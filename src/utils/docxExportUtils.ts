import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import {
  CognitiveLevel,
  Exam,
  ExamMatrix,
  ExamVariant,
  MatrixTopicRow,
  Question,
  QuestionType,
  SpecificationItem,
} from '../types/chem';
import {
  COGNITIVE_LEVEL_LABELS,
  COGNITIVE_LEVELS,
  DEFAULT_TF_SCORING_RULE,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  calculateExamMaxScore,
  computeMatrixSummary,
  getMatrixCell,
  getVariantOptionsForQuestion,
  resolveExamQuestion,
} from './examUtils';

import {
  FormulaNodeMode,
  OrganicStructureGraph,
  chemSyntaxToLatex,
  organicGraphToSvg,
  scanMixedFormulaSegments,
} from './chemSyntax';

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Read balanced {...} or [...] delimited content starting at index idx.
 */
function readBracketOrBrace(str: string, idx: number, openCh: string, closeCh: string): { content: string; nextIdx: number } {
  if (idx >= str.length || str[idx] !== openCh) return { content: '', nextIdx: idx };
  let i = idx + 1;
  let depth = 1;
  let buf = '';
  while (i < str.length && depth > 0) {
    if (str[i] === openCh) depth++;
    else if (str[i] === closeCh) {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
    buf += str[i++];
  }
  return { content: buf, nextIdx: i };
}

/**
 * Convert a chemical / LaTeX snippet into Word OMML (<m:oMath>) XML!
 * Supports fractions (\frac{a}{b}), subscripts (H_2, SO_4, C_{12}), superscripts (Fe^{3+}, t^o, ^{2-}),
 * reaction arrows (\rightarrow, \rightleftharpoons, \xrightarrow[below]{above}, \xrightleftharpoons[below]{above}),
 * \uparrow, \downarrow, \Delta, etc.
 */
function buildOmmlInner(rawLatex: string): string {
  let s = rawLatex
    .replace(/\\ce\{([^}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^}]*)\}/g, '$1')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\to\b/g, '→')
    .replace(/->/g, '→')
    .replace(/\\rightleftharpoons/g, '⇌')
    .replace(/<=>/g, '⇌')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\uparrow/g, '↑')
    .replace(/\\downarrow/g, '↓')
    .replace(/\\equiv/g, '≡')
    .replace(/\\cdot/g, '·')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\times/g, '×')
    .replace(/\\approx/g, '≈')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\circ/g, '°')
    .replace(/\\pm/g, '±')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\%/g, '%')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\log/g, 'log')
    .replace(/\\ln/g, 'ln');

  const makeRun = (text: string) =>
    `<m:r><w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/></w:rPr><m:t xml:space="preserve">${escapeXml(text)}</m:t></m:r>`;

  let out = '';
  let i = 0;

  const readGroup = (): string => {
    if (i >= s.length) return '';
    if (s[i] === '{') {
      const res = readBracketOrBrace(s, i, '{', '}');
      i = res.nextIdx;
      return res.content;
    }
    return s[i++];
  };

  while (i < s.length) {
    // Handle \xrightarrow[below]{above} or \xrightleftharpoons[below]{above}
    if (s.startsWith('\\xrightarrow', i) || s.startsWith('\\xrightleftharpoons', i)) {
      const isEquilibrium = s.startsWith('\\xrightleftharpoons', i);
      const arrowSym = isEquilibrium ? '⇌' : '→';
      i += isEquilibrium ? '\\xrightleftharpoons'.length : '\\xrightarrow'.length;
      while (i < s.length && s[i] === ' ') i++;
      let below = '';
      if (s[i] === '[') {
        const res = readBracketOrBrace(s, i, '[', ']');
        below = res.content;
        i = res.nextIdx;
      }
      while (i < s.length && s[i] === ' ') i++;
      const above = s[i] === '{' ? readGroup() : '';

      let arrowExpr = makeRun(` ${arrowSym} `);
      if (above.trim()) {
        arrowExpr = `<m:limUpp><m:e>${arrowExpr}</m:e><m:lim>${buildOmmlInner(above)}</m:lim></m:limUpp>`;
      }
      if (below.trim()) {
        arrowExpr = `<m:limLow><m:e>${arrowExpr}</m:e><m:lim>${buildOmmlInner(below)}</m:lim></m:limLow>`;
      }
      out += arrowExpr;
      continue;
    }

    // Handle \frac{num}{den}
    if (s.startsWith('\\frac', i)) {
      i += 5;
      while (i < s.length && s[i] === ' ') i++;
      const num = readGroup();
      while (i < s.length && s[i] === ' ') i++;
      const den = readGroup();
      out += `<m:f><m:num>${buildOmmlInner(num)}</m:num><m:den>${buildOmmlInner(den)}</m:den></m:f>`;
      continue;
    }

    const ch = s[i];
    if (ch === '_' || ch === '^') {
      const isSub = ch === '_';
      i++;
      const grp = readGroup();
      if (isSub) {
        out += `<m:sSub><m:e>${makeRun(' ')}</m:e><m:sub>${buildOmmlInner(grp)}</m:sub></m:sSub>`;
      } else {
        out += `<m:sSup><m:e>${makeRun(' ')}</m:e><m:sup>${buildOmmlInner(grp)}</m:sup></m:sSup>`;
      }
      continue;
    }

    let plain = '';
    while (
      i < s.length &&
      s[i] !== '_' &&
      s[i] !== '^' &&
      !s.startsWith('\\frac', i) &&
      !s.startsWith('\\xrightarrow', i) &&
      !s.startsWith('\\xrightleftharpoons', i)
    ) {
      plain += s[i++];
    }

    if (i < s.length && (s[i] === '_' || s[i] === '^')) {
      const baseChar = plain.slice(-1) || ' ';
      const prefix = plain.slice(0, -1);
      if (prefix) out += makeRun(prefix);

      let subText: string | null = null;
      let supText: string | null = null;

      while (i < s.length && (s[i] === '_' || s[i] === '^')) {
        const marker = s[i++];
        const grp = readGroup();
        if (marker === '_') subText = grp;
        else supText = grp;
      }

      if (subText !== null && supText !== null) {
        out += `<m:sSubSup><m:e>${makeRun(baseChar)}</m:e><m:sub>${buildOmmlInner(subText)}</m:sub><m:sup>${buildOmmlInner(supText)}</m:sup></m:sSubSup>`;
      } else if (subText !== null) {
        out += `<m:sSub><m:e>${makeRun(baseChar)}</m:e><m:sub>${buildOmmlInner(subText)}</m:sub></m:sSub>`;
      } else if (supText !== null) {
        out += `<m:sSup><m:e>${makeRun(baseChar)}</m:e><m:sup>${buildOmmlInner(supText)}</m:sup></m:sSup>`;
      }
    } else if (plain) {
      out += makeRun(plain);
    }
  }

  return out;
}

function formulaSnippetToOmml(rawLatex: string): string {
  return `<m:oMath>${buildOmmlInner(rawLatex)}</m:oMath>`;
}

function makeWmlRun(
  text: string,
  bold = false,
  italic = false,
  fontSizeHalfPt = 24,
  underline = false,
  vertAlign?: 'subscript' | 'superscript'
): string {
  if (!text) return '';
  const rPr = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${
    bold ? '<w:b/>' : ''
  }${italic ? '<w:i/>' : ''}${underline ? '<w:u w:val="single"/>' : ''}${
    vertAlign ? `<w:vertAlign w:val="${vertAlign}"/>` : ''
  }<w:sz w:val="${fontSizeHalfPt}"/><w:szCs w:val="${fontSizeHalfPt}"/></w:rPr>`;
  return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

/**
 * Convert plain or mixed text (or rich HTML containing data-chem-node spans and sub/sup tags)
 * into inline WordprocessingML runs + OMML <m:oMath> blocks.
 */
function textWithChemToWmlRuns(
  textOrHtml: string,
  bold = false,
  italic = false,
  fontSizeHalfPt = 24,
  underline = false,
  vertAlign?: 'subscript' | 'superscript'
): string {
  if (!textOrHtml) return '';

  // If input contains HTML tags or data-chem-node, parse inline DOM cleanly
  if (/<\/?[a-z][\s\S]*>/i.test(textOrHtml) && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(`<div>${textOrHtml}</div>`, 'text/html');
    const root = doc.body.firstElementChild;
    if (root) {
      const renderInlineNode = (
        node: Node,
        b: boolean,
        it: boolean,
        u: boolean,
        va?: 'subscript' | 'superscript'
      ): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return textWithChemToWmlRuns(node.textContent || '', b, it, fontSizeHalfPt, u, va);
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (el.getAttribute('data-chem-node') === 'true') {
          const mode = (el.getAttribute('data-mode') || 'chem') as FormulaNodeMode;
          const src = el.getAttribute('data-source') || '';
          if (mode === 'organic2d') {
            return makeWmlRun(`[Cấu tạo 2D: ${src}]`, true, it, fontSizeHalfPt, u, va);
          }
          return formulaSnippetToOmml(chemSyntaxToLatex(src, mode));
        }

        if (tag === 'br') return '<w:r><w:br/></w:r>';
        if (tag === 'img') {
          const alt = el.getAttribute('alt') || 'Hình minh họa';
          return makeWmlRun(`[${alt}]`, b, true, fontSizeHalfPt);
        }

        const nextB = b || tag === 'b' || tag === 'strong' || tag === 'h1' || tag === 'h2' || tag === 'h3';
        const nextIt = it || tag === 'i' || tag === 'em';
        const nextU = u || tag === 'u';
        const nextVa: 'subscript' | 'superscript' | undefined =
          tag === 'sub' ? 'subscript' : tag === 'sup' ? 'superscript' : va;

        const inner = Array.from(el.childNodes)
          .map((c) => renderInlineNode(c, nextB, nextIt, nextU, nextVa))
          .join('');
        if (['p', 'div', 'h1', 'h2', 'h3', 'li'].includes(tag) && inner) {
          return `${inner}<w:r><w:t xml:space="preserve"> </w:t></w:r>`;
        }
        return inner;
      };
      return Array.from(root.childNodes)
        .map((c) => renderInlineNode(c, bold, italic, underline, vertAlign))
        .join('');
    }
  }

  // Plain / mixed prose with inline $...$, \ce{...}, \Delta_r H^o_{298}, or LaTeX chemistry tokens
  const segments = scanMixedFormulaSegments(textOrHtml);
  return segments
    .map((seg) => {
      if (seg.isFormula) {
        return formulaSnippetToOmml(chemSyntaxToLatex(seg.text, seg.mode));
      }
      return makeWmlRun(seg.text, bold, italic, fontSizeHalfPt, underline, vertAlign);
    })
    .join('');
}

function makeParagraph(
  innerXml: string,
  opts: { align?: 'left' | 'center' | 'right' | 'both'; spaceAfter?: number; spaceBefore?: number; pageBreakBefore?: boolean } = {}
): string {
  const jc = opts.align ? `<w:jc w:val="${opts.align}"/>` : '';
  const spacing = `<w:spacing w:before="${opts.spaceBefore ?? 40}" w:after="${opts.spaceAfter ?? 80}" w:line="276" w:lineRule="auto"/>`;
  const pb = opts.pageBreakBefore ? '<w:pageBreakBefore/>' : '';
  return `<w:p><w:pPr>${pb}${spacing}${jc}</w:pPr>${innerXml}</w:p>`;
}

function makeTable(rowsXml: string[], borders = true): string {
  const borderXml = borders
    ? `<w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="334155"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="64748B"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="64748B"/>
      </w:tblBorders>`
    : `<w:tblBorders>
        <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
        <w:insideH w:val="none"/><w:insideV w:val="none"/>
      </w:tblBorders>`;

  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      ${borderXml}
      <w:tblCellMar>
        <w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/>
        <w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    ${rowsXml.join('')}
  </w:tbl>`;
}

function makeCell(
  paragraphsXml: string,
  opts: { widthPct?: number; bg?: string; gridSpan?: number; vMerge?: 'restart' | 'continue' } = {}
): string {
  const tcW = opts.widthPct ? `<w:tcW w:w="${opts.widthPct * 50}" w:type="dxa"/>` : '';
  const shd = opts.bg ? `<w:shd w:val="clear" w:color="auto" w:fill="${opts.bg}"/>` : '';
  const span = opts.gridSpan && opts.gridSpan > 1 ? `<w:gridSpan w:val="${opts.gridSpan}"/>` : '';
  const vMerge = opts.vMerge
    ? opts.vMerge === 'restart'
      ? '<w:vMerge w:val="restart"/>'
      : '<w:vMerge/>'
    : '';
  return `<w:tc><w:tcPr>${tcW}${span}${vMerge}${shd}<w:vAlign w:val="center"/></w:tcPr>${paragraphsXml || '<w:p/>'}</w:tc>`;
}

/**
 * Convert an SVG string to PNG Uint8Array using canvas so diagrams embed cleanly in DOCX.
 */
async function svgStringToPngBytes(svgString: string): Promise<Uint8Array | null> {
  try {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('SVG load error'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(360, img.width || 420);
    canvas.height = Math.max(200, img.height || 240);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return null;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const pngBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!pngBlob) return null;
    const buf = await pngBlob.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

function makeDrawingParagraph(rId: string, idx: number, widthEmu = 4200000, heightEmu = 2400000): string {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="100"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${widthEmu}" cy="${heightEmu}"/><wp:docPr id="${idx}" name="Diagram_${idx}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${idx}" name="Diagram_${idx}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

/**
 * Pack WordprocessingML body XML + optional embedded PNGs into a genuine .docx archive.
 */
async function packAndDownloadDocx(
  bodyXml: string,
  fileName: string,
  images: { rId: string; fileName: string; bytes: Uint8Array }[] = []
) {
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  const imgRels = images
    .map(
      (img) =>
        `<Relationship Id="${img.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img.fileName}"/>`
    )
    .join('\n  ');

  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${imgRels}
</Relationships>`
  );

  images.forEach((img) => {
    zip.file(`word/media/${img.fileName}`, img.bytes);
  });

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', docXml);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ExportExamDocxOptions {
  exam: Exam;
  matrix?: ExamMatrix;
  questions: Question[];
  departmentTitle: string;
  schoolName: string;
  teamName: string;
  academicYear: string;
  subjectName: string;
  selectedVariantCodes: string[];
  includeOriginalPaper: boolean;
  includeVariantsPaper: boolean;
  includeMatrix: boolean;
  includeSpec: boolean;
  includeAnswerKey: boolean;
  includeRubric: boolean;
}

function buildMatrixTableWml(matrix: ExamMatrix): string {
  const summary = computeMatrixSummary(matrix);
  const rows: string[] = [];

  // Header row 1
  rows.push(
    `<w:tr>
      ${makeCell(makeParagraph(textWithChemToWmlRuns('TT', true, false, 20), { align: 'center' }), { bg: 'E2E8F0', vMerge: 'restart' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Chương / Chủ đề & Nội dung', true, false, 20), { align: 'center' }), { bg: 'E2E8F0', vMerge: 'restart' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Số câu theo mức độ nhận thức', true, false, 20), { align: 'center' }), { bg: 'E2E8F0', gridSpan: 4 })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Tổng câu', true, false, 20), { align: 'center' }), { bg: 'E2E8F0', vMerge: 'restart' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Tổng điểm', true, false, 20), { align: 'center' }), { bg: 'E2E8F0', vMerge: 'restart' })}
    </w:tr>`
  );

  // Header row 2
  rows.push(
    `<w:tr>
      ${makeCell('', { bg: 'E2E8F0', vMerge: 'continue' })}
      ${makeCell('', { bg: 'E2E8F0', vMerge: 'continue' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('NB', true, false, 20), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('TH', true, false, 20), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('VD', true, false, 20), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('VDC', true, false, 20), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell('', { bg: 'E2E8F0', vMerge: 'continue' })}
      ${makeCell('', { bg: 'E2E8F0', vMerge: 'continue' })}
    </w:tr>`
  );

  matrix.topics.forEach((t, idx) => {
    const nb = QUESTION_TYPES.reduce((s, qt) => s + (getMatrixCell(t, qt, 'NHAN_BIET').count ?? 0), 0);
    const th = QUESTION_TYPES.reduce((s, qt) => s + (getMatrixCell(t, qt, 'THONG_HIEU').count ?? 0), 0);
    const vd = QUESTION_TYPES.reduce((s, qt) => s + (getMatrixCell(t, qt, 'VAN_DUNG').count ?? 0), 0);
    const vdc = QUESTION_TYPES.reduce((s, qt) => s + (getMatrixCell(t, qt, 'VAN_DUNG_CAO').count ?? 0), 0);
    const topicSum = summary.byTopic[t.id] || { count: nb + th + vd + vdc, score: t.totalScore };

    rows.push(
      `<w:tr>
        ${makeCell(makeParagraph(textWithChemToWmlRuns(String(idx + 1), false, false, 20), { align: 'center' }))}
        ${makeCell(
          makeParagraph(textWithChemToWmlRuns(t.topicName, true, false, 20)) +
            makeParagraph(textWithChemToWmlRuns(t.unitLesson, false, true, 18))
        )}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(String(nb), false, false, 20), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(String(th), false, false, 20), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(String(vd), false, false, 20), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(String(vdc), false, false, 20), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(String(topicSum.count), true, false, 20), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(`${topicSum.score}`, true, false, 20), { align: 'center' }))}
      </w:tr>`
    );
  });

  // Summary row
  rows.push(
    `<w:tr>
      ${makeCell(makeParagraph(textWithChemToWmlRuns('TỔNG CỘNG', true, false, 20), { align: 'center' }), { bg: 'F1F5F9', gridSpan: 2 })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns(`${summary.byLevel.NHAN_BIET.count} (${summary.byLevel.NHAN_BIET.percent}%)`, true, false, 18), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns(`${summary.byLevel.THONG_HIEU.count} (${summary.byLevel.THONG_HIEU.percent}%)`, true, false, 18), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns(`${summary.byLevel.VAN_DUNG.count} (${summary.byLevel.VAN_DUNG.percent}%)`, true, false, 18), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns(`${summary.byLevel.VAN_DUNG_CAO.count} (${summary.byLevel.VAN_DUNG_CAO.percent}%)`, true, false, 18), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns(String(summary.totalQuestions), true, false, 20), { align: 'center' }), { bg: 'F1F5F9' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns(`${summary.totalScore}đ`, true, false, 20), { align: 'center' }), { bg: 'F1F5F9' })}
    </w:tr>`
  );

  return makeTable(rows, true);
}

function buildSpecTableWml(matrix: ExamMatrix): string {
  const rows: string[] = [];
  rows.push(
    `<w:tr>
      ${makeCell(makeParagraph(textWithChemToWmlRuns('TT', true, false, 18), { align: 'center' }), { bg: 'E2E8F0' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Chủ đề / Nội dung', true, false, 18), { align: 'center' }), { bg: 'E2E8F0' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Yêu cầu cần đạt (GDPT 2018)', true, false, 18), { align: 'center' }), { bg: 'E2E8F0' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Mô tả đánh giá', true, false, 18), { align: 'center' }), { bg: 'E2E8F0' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Mức độ', true, false, 18), { align: 'center' }), { bg: 'E2E8F0' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Dạng câu', true, false, 18), { align: 'center' }), { bg: 'E2E8F0' })}
      ${makeCell(makeParagraph(textWithChemToWmlRuns('Số câu / Điểm', true, false, 18), { align: 'center' }), { bg: 'E2E8F0' })}
    </w:tr>`
  );

  matrix.specifications.forEach((s, idx) => {
    const score = s.totalItemScore ?? (s.questionCount ?? 0) * (s.scorePerQuestion ?? 0);
    rows.push(
      `<w:tr>
        ${makeCell(makeParagraph(textWithChemToWmlRuns(String(idx + 1), false, false, 18), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(s.topicName, true, false, 18)))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(s.requiredCompetency, false, false, 18)))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(s.assessmentContent, false, false, 18)))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(COGNITIVE_LEVEL_LABELS[s.cognitiveLevel], false, false, 18), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(QUESTION_TYPE_LABELS[s.questionType], false, false, 18), { align: 'center' }))}
        ${makeCell(makeParagraph(textWithChemToWmlRuns(`${s.questionCount ?? 0} câu (${score}đ)`, true, false, 18), { align: 'center' }))}
      </w:tr>`
    );
  });

  return makeTable(rows, true);
}

/**
 * Full DOCX Export with real OMML formulas & PNG-embedded SVG diagrams.
 */
export async function exportExamSuiteToDocx(opts: ExportExamDocxOptions): Promise<void> {
  const {
    exam,
    matrix,
    questions,
    departmentTitle,
    schoolName,
    teamName,
    academicYear,
    subjectName,
    selectedVariantCodes,
    includeOriginalPaper,
    includeVariantsPaper,
    includeMatrix,
    includeSpec,
    includeAnswerKey,
    includeRubric,
  } = opts;

  const rawQMap: Record<string, Question> = {};
  questions.forEach((q) => (rawQMap[q.id] = q));
  const qMap: Record<string, Question> = {};
  questions.forEach((q) => {
    qMap[q.id] = resolveExamQuestion(exam, q.id, rawQMap) || q;
  });
  Object.entries(exam.questionOverrides || {}).forEach(([qId, q]) => {
    qMap[qId] = q;
  });

  const images: { rId: string; fileName: string; bytes: Uint8Array }[] = [];
  const svgCache = new Map<string, string>();
  let imgCounter = 1;

  for (const qId of exam.questionIds) {
    const q = qMap[qId];
    if (q?.diagramSvg && !svgCache.has(q.id)) {
      const pngBytes = await svgStringToPngBytes(q.diagramSvg);
      if (pngBytes) {
        const rId = `rIdImg${imgCounter}`;
        const fileName = `diagram_${imgCounter}.png`;
        images.push({ rId, fileName, bytes: pngBytes });
        svgCache.set(q.id, rId);
        imgCounter++;
      }
    }
  }

  const nextImageId = () => `rIdImg${imgCounter++}`;
  const pushImage = (bytes: Uint8Array, prefix = 'img') => {
    const rId = nextImageId();
    const fileName = `${prefix}_${imgCounter}.png`;
    images.push({ rId, fileName, bytes });
    return rId;
  };

  const bodyParts: string[] = [];
  let needPageBreak = false;

  const pushPageBreakIfNeeded = () => {
    if (needPageBreak) {
      bodyParts.push(makeParagraph('', { pageBreakBefore: true }));
    }
    needPageBreak = true;
  };

  // 1. MATRIX
  if (includeMatrix && matrix) {
    pushPageBreakIfNeeded();
    bodyParts.push(makeParagraph(textWithChemToWmlRuns(schoolName.toUpperCase(), true, false, 24), { align: 'center' }));
    bodyParts.push(makeParagraph(textWithChemToWmlRuns(`KHUNG MA TRẬN ĐỀ KIỂM TRA – ${exam.title.toUpperCase()}`, true, false, 26), { align: 'center' }));
    bodyParts.push(makeParagraph(textWithChemToWmlRuns(`Môn: ${subjectName} – Khối ${exam.grade} – Thời gian: ${exam.durationMinutes} phút`, false, true, 22), { align: 'center' }));
    bodyParts.push(buildMatrixTableWml(matrix));
  }

  // 2. SPECIFICATION
  if (includeSpec && matrix) {
    pushPageBreakIfNeeded();
    bodyParts.push(makeParagraph(textWithChemToWmlRuns(`BẢN ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA – ${exam.title.toUpperCase()}`, true, false, 26), { align: 'center' }));
    bodyParts.push(buildSpecTableWml(matrix));
  }

  const renderPaperBlock = async (codeLabel: string, orderedQuestionIds: string[], variant?: ExamVariant) => {
    pushPageBreakIfNeeded();
    // Official Top Header Table
    bodyParts.push(
      makeTable(
        [
          `<w:tr>
            ${makeCell(
              makeParagraph(textWithChemToWmlRuns(departmentTitle.toUpperCase(), false, false, 22), { align: 'center', spaceAfter: 20 }) +
                makeParagraph(textWithChemToWmlRuns(schoolName.toUpperCase(), true, false, 22), { align: 'center', spaceAfter: 20 }) +
                makeParagraph(textWithChemToWmlRuns(teamName, false, true, 20), { align: 'center', spaceAfter: 20 })
            )}
            ${makeCell(
              makeParagraph(textWithChemToWmlRuns('ĐỀ KIỂM TRA CHÍNH THỨC', true, false, 22), { align: 'center', spaceAfter: 20 }) +
                makeParagraph(textWithChemToWmlRuns(`Năm học: ${academicYear}`, false, false, 22), { align: 'center', spaceAfter: 20 }) +
                makeParagraph(textWithChemToWmlRuns(`MÃ ĐỀ: ${codeLabel}`, true, false, 24), { align: 'center', spaceAfter: 20 })
            )}
          </w:tr>`,
        ],
        false
      )
    );

    bodyParts.push(makeParagraph(textWithChemToWmlRuns(exam.title.toUpperCase(), true, false, 26), { align: 'center', spaceBefore: 120 }));
    bodyParts.push(
      makeParagraph(
        textWithChemToWmlRuns(
          `Môn: ${subjectName} – Lớp: ${exam.grade} – Thời gian làm bài: ${exam.durationMinutes} phút (không kể thời gian phát đề)`,
          false,
          true,
          22
        ),
        { align: 'center', spaceAfter: 140 }
      )
    );

    const paperQuestions = orderedQuestionIds.map((id) => qMap[id]).filter(Boolean);
    const partMap: { type: QuestionType; header: string }[] = [
      { type: 'MCQ', header: 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.' },
      { type: 'MULTIPLE_TRUE_FALSE', header: 'PHẦN II. Câu trắc nghiệm đúng sai.' },
      { type: 'SHORT_ANSWER', header: 'PHẦN III. Câu trắc nghiệm yêu cầu trả lời ngắn.' },
      { type: 'ESSAY', header: 'PHẦN IV. Tự luận.' },
    ];

    let globalQNum = 1;
    for (const part of partMap) {
      const pQuestions = paperQuestions.filter((q) => q.type === part.type);
      if (pQuestions.length === 0) continue; // Skip sections with 0 questions!

      bodyParts.push(makeParagraph(textWithChemToWmlRuns(part.header, true, false, 24), { spaceBefore: 140, spaceAfter: 60 }));

      for (const q of pQuestions) {
        const qScore = exam.questionScores?.[q.id] ?? q.maxScore;
        const hasBlockHtml = /<(?:table|ul|ol|h[1-3]|img)\b|data-mode="organic2d"/i.test(q.content);
        if (!hasBlockHtml) {
          bodyParts.push(
            makeParagraph(
              textWithChemToWmlRuns(`Câu ${globalQNum} (${qScore} điểm): `, true, false, 24) +
                textWithChemToWmlRuns(q.content, false, false, 24),
              { spaceBefore: 80, spaceAfter: 40 }
            )
          );
        } else {
          bodyParts.push(
            makeParagraph(
              textWithChemToWmlRuns(`Câu ${globalQNum} (${qScore} điểm): `, true, false, 24),
              { spaceBefore: 80, spaceAfter: 20 }
            )
          );
          const richBlocks = await htmlToWmlBlocks(q.content, pushImage);
          bodyParts.push(...richBlocks);
        }

        const imgRId = svgCache.get(q.id);
        if (imgRId) {
          bodyParts.push(makeDrawingParagraph(imgRId, imgCounter++));
        }

        if (q.type === 'MCQ') {
          const opts = getVariantOptionsForQuestion(q, variant);
          bodyParts.push(
            makeTable(
              [
                `<w:tr>
                  ${opts
                    .slice(0, 2)
                    .map((o) =>
                      makeCell(
                        makeParagraph(
                          textWithChemToWmlRuns(`${o.displayLetter}. `, true, false, 22) +
                            textWithChemToWmlRuns(o.content, false, false, 22),
                          { spaceAfter: 20 }
                        )
                      )
                    )
                    .join('')}
                </w:tr>`,
                ...(opts.length > 2
                  ? [
                      `<w:tr>
                        ${opts
                          .slice(2, 4)
                          .map((o) =>
                            makeCell(
                              makeParagraph(
                                textWithChemToWmlRuns(`${o.displayLetter}. `, true, false, 22) +
                                  textWithChemToWmlRuns(o.content, false, false, 22),
                                { spaceAfter: 20 }
                              )
                            )
                          )
                          .join('')}
                      </w:tr>`,
                    ]
                  : []),
              ],
              false
            )
          );
        } else if (q.type === 'MULTIPLE_TRUE_FALSE' && q.tfStatements) {
          const permIds = variant?.tfOrderPermutations?.[q.id];
          const orderedSt = permIds
            ? permIds.map((sid) => q.tfStatements!.find((s) => s.id === sid)!).filter(Boolean)
            : q.tfStatements;
          orderedSt.forEach((st, sIdx) => {
            bodyParts.push(
              makeParagraph(
                textWithChemToWmlRuns(`   ${['a)', 'b)', 'c)', 'd)'][sIdx] || `${sIdx + 1})`} `, true, false, 22) +
                  textWithChemToWmlRuns(st.statement, false, false, 22),
                { spaceAfter: 30 }
              )
            );
          });
        } else if (q.type === 'SHORT_ANSWER') {
          bodyParts.push(
            makeParagraph(textWithChemToWmlRuns('   Đáp số: ...............................', false, true, 22), {
              spaceAfter: 60,
            })
          );
        }
        globalQNum++;
      }
    }
  };

  // 3. ORIGINAL PAPER
  if (includeOriginalPaper) {
    await renderPaperBlock('ĐỀ GỐC', exam.questionIds);
  }

  // 4. VARIANT PAPERS
  if (includeVariantsPaper) {
    const variantsToExport = (exam.variants || []).filter((v) =>
      selectedVariantCodes.includes(v.code)
    );
    for (const v of variantsToExport) {
      await renderPaperBlock(v.code, v.questionIds, v);
    }
  }

  // 5. ANSWER KEYS PER VARIANT
  if (includeAnswerKey) {
    const variantsForKey =
      exam.variants && exam.variants.length > 0
        ? exam.variants.filter((v) => selectedVariantCodes.includes(v.code) || selectedVariantCodes.length === 0)
        : [
            {
              code: 'ĐỀ GỐC',
              questionIds: exam.questionIds,
              answerKey: Object.fromEntries(
                exam.questionIds.map((id) => {
                  const q = qMap[id];
                  if (!q) return [id, '–'];
                  if (q.type === 'MCQ') return [id, q.options?.find((o) => o.isCorrect)?.id || 'A'];
                  if (q.type === 'SHORT_ANSWER') return [id, q.correctAnswer || ''];
                  if (q.type === 'MULTIPLE_TRUE_FALSE') {
                    return [id, Object.fromEntries((q.tfStatements || []).map((st) => [st.id, st.isCorrect]))];
                  }
                  return [id, 'Rubric'];
                })
              ),
            } as ExamVariant,
          ];

    for (const v of variantsForKey) {
      pushPageBreakIfNeeded();
      bodyParts.push(
        makeParagraph(
          textWithChemToWmlRuns(`ĐÁP ÁN & THANG ĐIỂM – MÃ ĐỀ ${v.code}`, true, false, 26),
          { align: 'center' }
        )
      );
      bodyParts.push(
        makeParagraph(
          textWithChemToWmlRuns(
            `${exam.title} · Tổng điểm: ${calculateExamMaxScore(exam, qMap)} điểm`,
            false,
            true,
            22
          ),
          { align: 'center', spaceAfter: 120 }
        )
      );

      const ansRows: string[] = [
        `<w:tr>
          ${makeCell(makeParagraph(textWithChemToWmlRuns('Câu', true, false, 20), { align: 'center' }), { bg: 'E2E8F0' })}
          ${makeCell(makeParagraph(textWithChemToWmlRuns('Dạng câu hỏi', true, false, 20), { align: 'center' }), { bg: 'E2E8F0' })}
          ${makeCell(makeParagraph(textWithChemToWmlRuns('Đáp án chuẩn theo mã đề', true, false, 20), { align: 'center' }), { bg: 'E2E8F0' })}
          ${makeCell(makeParagraph(textWithChemToWmlRuns('Điểm tối đa', true, false, 20), { align: 'center' }), { bg: 'E2E8F0' })}
        </w:tr>`,
      ];

      v.questionIds.forEach((qId, idx) => {
        const q = qMap[qId];
        if (!q) return;
        const rawKey = v.answerKey[qId];
        let ansStr = '';
        if (q.type === 'MCQ') {
          ansStr = String(rawKey || 'A');
        } else if (q.type === 'MULTIPLE_TRUE_FALSE') {
          const tfMap = (typeof rawKey === 'object' && rawKey) || {};
          const perm = v.tfOrderPermutations?.[qId] || (q.tfStatements || []).map((s) => s.id);
          ansStr = perm
            .map((sid, sIdx) => `${['a', 'b', 'c', 'd'][sIdx]}: ${tfMap[sid] ? 'Đ' : 'S'}`)
            .join(' | ');
        } else if (q.type === 'SHORT_ANSWER') {
          ansStr = String(rawKey || q.correctAnswer || '');
        } else {
          ansStr = 'Theo hướng dẫn chấm tự luận';
        }
        const qScore = exam.questionScores?.[q.id] ?? q.maxScore;

        ansRows.push(
          `<w:tr>
            ${makeCell(makeParagraph(textWithChemToWmlRuns(`Câu ${idx + 1}`, true, false, 20), { align: 'center' }))}
            ${makeCell(makeParagraph(textWithChemToWmlRuns(QUESTION_TYPE_LABELS[q.type], false, false, 20), { align: 'center' }))}
            ${makeCell(makeParagraph(textWithChemToWmlRuns(ansStr, true, false, 20), { align: 'center' }))}
            ${makeCell(makeParagraph(textWithChemToWmlRuns(`${qScore}đ`, false, false, 20), { align: 'center' }))}
          </w:tr>`
        );
      });

      bodyParts.push(makeTable(ansRows, true));
    }
  }

  // 6. DETAILED ESSAY RUBRICS
  if (includeRubric) {
    const essayQs = exam.questionIds.map((id) => qMap[id]).filter((q) => q && q.type === 'ESSAY');
    if (essayQs.length > 0) {
      pushPageBreakIfNeeded();
      bodyParts.push(makeParagraph(textWithChemToWmlRuns('HƯỚNG DẪN CHẤM TỰ LUẬN CHI TIẾT (RUBRIC)', true, false, 26), { align: 'center', spaceAfter: 120 }));
      for (let idx = 0; idx < essayQs.length; idx++) {
        const q = essayQs[idx];
        const qScore = exam.questionScores?.[q.id] ?? q.maxScore;
        bodyParts.push(
          makeParagraph(
            textWithChemToWmlRuns(`Câu Tự luận ${idx + 1} (${qScore} điểm): `, true, false, 22) +
              textWithChemToWmlRuns(q.content, false, false, 22)
          )
        );
        const steps = exam.essayComponentRubrics?.[q.id] || q.rubricSteps;
        if (steps && steps.length > 0) {
          const rRows = [
            `<w:tr>
              ${makeCell(makeParagraph(textWithChemToWmlRuns('Nội dung / Bước giải cần đạt', true, false, 20)), { bg: 'F1F5F9' })}
              ${makeCell(makeParagraph(textWithChemToWmlRuns('Điểm thành phần', true, false, 20), { align: 'center' }), { bg: 'F1F5F9' })}
            </w:tr>`,
            ...steps.map(
              (st) =>
                `<w:tr>
                  ${makeCell(makeParagraph(textWithChemToWmlRuns(st.description, false, false, 20)))}
                  ${makeCell(makeParagraph(textWithChemToWmlRuns(`${st.score} đ`, true, false, 20), { align: 'center' }))}
                </w:tr>`
            ),
          ];
          bodyParts.push(makeTable(rRows, true));
        } else if (q.rubricGuide) {
          const blocks = await htmlToWmlBlocks(q.rubricGuide, pushImage);
          bodyParts.push(...blocks);
        }
      }
    }
  }

  await packAndDownloadDocx(
    bodyParts.join('\n'),
    `Bo_De_Thi_Hoa_${exam.grade}_${Date.now()}.docx`,
    images
  );
}

/**
 * Export Matrix + Specification directly to .docx (with OMML)
 */
export async function exportMatrixToDocx(matrix: ExamMatrix): Promise<void> {
  const body =
    makeParagraph(textWithChemToWmlRuns(matrix.title.toUpperCase(), true, false, 26), { align: 'center' }) +
    makeParagraph(
      textWithChemToWmlRuns(
        `Môn: Hóa học – Khối ${matrix.grade} – Thời gian: ${matrix.durationMinutes} phút`,
        false,
        true,
        22
      ),
      { align: 'center', spaceAfter: 120 }
    ) +
    makeParagraph(textWithChemToWmlRuns('I. KHUNG MA TRẬN ĐỀ KIỂM TRA', true, false, 24), { spaceBefore: 100 }) +
    buildMatrixTableWml(matrix) +
    makeParagraph(textWithChemToWmlRuns('II. BẢN ĐẶC TẢ CHI TIẾT', true, false, 24), { pageBreakBefore: true }) +
    buildSpecTableWml(matrix);

  await packAndDownloadDocx(body, `Ma_Tran_Dac_Ta_Hoa_${matrix.grade}_${Date.now()}.docx`);
}

/**
 * Export Matrix & Specification to real Excel (.xlsx)
 */
export function exportMatrixToExcel(matrix: ExamMatrix): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Matrix
  const matrixRows: any[][] = [
    [matrix.title],
    [`Khối ${matrix.grade}`, `Năm học ${matrix.schoolYear}`, `Thời gian: ${matrix.durationMinutes} phút`],
    [],
    [
      'TT',
      'Chương / Chủ đề',
      'Nội dung kiến thức',
      'Yêu cầu cần đạt',
      'MCQ NB',
      'MCQ TH',
      'MCQ VD',
      'MCQ VDC',
      'Đ/S NB',
      'Đ/S TH',
      'Đ/S VD',
      'Đ/S VDC',
      'Ngắn NB',
      'Ngắn TH',
      'Ngắn VD',
      'Ngắn VDC',
      'Tự luận NB',
      'Tự luận TH',
      'Tự luận VD',
      'Tự luận VDC',
      'Tổng điểm dòng',
    ],
  ];

  matrix.topics.forEach((t, idx) => {
    matrixRows.push([
      idx + 1,
      t.topicName,
      t.unitLesson,
      t.requiredCompetency || '',
      getMatrixCell(t, 'MCQ', 'NHAN_BIET').count ?? 0,
      getMatrixCell(t, 'MCQ', 'THONG_HIEU').count ?? 0,
      getMatrixCell(t, 'MCQ', 'VAN_DUNG').count ?? 0,
      getMatrixCell(t, 'MCQ', 'VAN_DUNG_CAO').count ?? 0,
      getMatrixCell(t, 'MULTIPLE_TRUE_FALSE', 'NHAN_BIET').count ?? 0,
      getMatrixCell(t, 'MULTIPLE_TRUE_FALSE', 'THONG_HIEU').count ?? 0,
      getMatrixCell(t, 'MULTIPLE_TRUE_FALSE', 'VAN_DUNG').count ?? 0,
      getMatrixCell(t, 'MULTIPLE_TRUE_FALSE', 'VAN_DUNG_CAO').count ?? 0,
      getMatrixCell(t, 'SHORT_ANSWER', 'NHAN_BIET').count ?? 0,
      getMatrixCell(t, 'SHORT_ANSWER', 'THONG_HIEU').count ?? 0,
      getMatrixCell(t, 'SHORT_ANSWER', 'VAN_DUNG').count ?? 0,
      getMatrixCell(t, 'SHORT_ANSWER', 'VAN_DUNG_CAO').count ?? 0,
      getMatrixCell(t, 'ESSAY', 'NHAN_BIET').count ?? 0,
      getMatrixCell(t, 'ESSAY', 'THONG_HIEU').count ?? 0,
      getMatrixCell(t, 'ESSAY', 'VAN_DUNG').count ?? 0,
      getMatrixCell(t, 'ESSAY', 'VAN_DUNG_CAO').count ?? 0,
      t.totalScore,
    ]);
  });

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Ma_Tran');

  // Sheet 2: Specifications
  const specRows: any[][] = [
    ['TT', 'Chương/Chủ đề', 'Bài học', 'Yêu cầu cần đạt', 'Mô tả đánh giá', 'Mức độ', 'Dạng câu', 'Số câu', 'Tổng điểm'],
    ...matrix.specifications.map((s, idx) => [
      idx + 1,
      s.topicName,
      s.lessonName || s.knowledgeContent || '',
      s.requiredCompetency,
      s.assessmentContent,
      COGNITIVE_LEVEL_LABELS[s.cognitiveLevel],
      QUESTION_TYPE_LABELS[s.questionType],
      s.questionCount ?? 0,
      s.totalItemScore ?? (s.questionCount ?? 0) * (s.scorePerQuestion ?? 0),
    ]),
  ];
  const wsSpec = XLSX.utils.aoa_to_sheet(specRows);
  XLSX.utils.book_append_sheet(wb, wsSpec, 'Ban_Dac_Ta');

  XLSX.writeFile(wb, `Ma_Tran_Ban_Dac_Ta_Hoa_${matrix.grade}_${Date.now()}.xlsx`);
}

async function imageUrlToPngBytes(src: string): Promise<Uint8Array | null> {
  if (!src) return null;
  if (src.startsWith('data:image/svg+xml')) {
    try {
      const commaIdx = src.indexOf(',');
      const raw = src.slice(commaIdx + 1);
      const svg = src.includes(';base64,') ? atob(raw) : decodeURIComponent(raw);
      return await svgStringToPngBytes(svg);
    } catch {
      return null;
    }
  }
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load error'));
      img.src = src;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(900, Math.max(120, img.naturalWidth || 400));
    canvas.height = Math.round(
      canvas.width * ((img.naturalHeight || 240) / (img.naturalWidth || 400))
    );
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) return null;
    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Convert full rich HTML (paragraphs, headings, alignment, lists, tables, images,
 * data-chem-node formulas, and 2D organic structure SVGs) into WordprocessingML blocks.
 */
async function htmlToWmlBlocks(
  html: string,
  pushImage: (bytes: Uint8Array, prefix?: string) => string
): Promise<string[]> {
  if (!html || !html.trim()) return [];
  if (!/<\/?[a-z][\s\S]*>/i.test(html) || typeof DOMParser === 'undefined') {
    return html
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => makeParagraph(textWithChemToWmlRuns(l, false, false, 24)));
  }

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return [];

  const blocks: string[] = [];
  let imgIdx = 100;

  const extractAlign = (el: HTMLElement): 'left' | 'center' | 'right' | undefined => {
    const ta = (el.style?.textAlign || el.getAttribute('align') || '').toLowerCase();
    if (ta === 'center') return 'center';
    if (ta === 'right') return 'right';
    if (ta === 'left') return 'left';
    return undefined;
  };

  const renderElementInlineAndDrawings = async (el: Element): Promise<{ runs: string; drawings: string[] }> => {
    const drawings: string[] = [];
    // Check 2D organic SVG nodes & images inside this block
    const organicNodes = Array.from(el.querySelectorAll('[data-mode="organic2d"]'));
    for (const on of organicNodes) {
      const jsonStr = on.getAttribute('data-structure-json');
      if (jsonStr) {
        try {
          const graph = JSON.parse(jsonStr) as OrganicStructureGraph;
          const svg = organicGraphToSvg(graph, { compact: false, width: 320, height: 180 });
          const png = await svgStringToPngBytes(svg);
          if (png) {
            const rId = pushImage(png, 'organic2d');
            drawings.push(makeDrawingParagraph(rId, imgIdx++, 3100000, 1750000));
          }
        } catch {}
      }
    }
    const imgs = Array.from(el.querySelectorAll('img'));
    for (const im of imgs) {
      const src = im.getAttribute('src') || '';
      const png = await imageUrlToPngBytes(src);
      if (png) {
        const rId = pushImage(png, 'embed');
        drawings.push(makeDrawingParagraph(rId, imgIdx++, 3800000, 2200000));
      }
    }
    return { runs: textWithChemToWmlRuns(el.outerHTML, false, false, 24), drawings };
  };

  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = child.textContent || '';
      if (t.trim()) {
        blocks.push(makeParagraph(textWithChemToWmlRuns(t, false, false, 24)));
      }
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'table') {
      const trNodes = Array.from(el.querySelectorAll('tr'));
      const wRows: string[] = [];
      for (const tr of trNodes) {
        const cells = Array.from(tr.children).filter(
          (c) => c.tagName.toLowerCase() === 'td' || c.tagName.toLowerCase() === 'th'
        );
        const wCells = cells.map((cell) => {
          const isTh = cell.tagName.toLowerCase() === 'th';
          return makeCell(
            makeParagraph(textWithChemToWmlRuns(cell.innerHTML, isTh, false, 22)),
            isTh ? { bg: 'F1F5F9' } : {}
          );
        });
        if (wCells.length > 0) wRows.push(`<w:tr>${wCells.join('')}</w:tr>`);
      }
      if (wRows.length > 0) blocks.push(makeTable(wRows, true));
      continue;
    }

    if (tag === 'ul' || tag === 'ol') {
      const lis = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li');
      for (let idx = 0; idx < lis.length; idx++) {
        const prefix = tag === 'ol' ? `${idx + 1}. ` : '• ';
        const { runs, drawings } = await renderElementInlineAndDrawings(lis[idx]);
        blocks.push(
          makeParagraph(makeWmlRun(prefix, true, false, 24) + runs, { spaceAfter: 40 })
        );
        blocks.push(...drawings);
      }
      continue;
    }

    if (tag === 'img') {
      const png = await imageUrlToPngBytes(el.getAttribute('src') || '');
      if (png) {
        const rId = pushImage(png, 'embed');
        blocks.push(makeDrawingParagraph(rId, imgIdx++, 3800000, 2200000));
      }
      continue;
    }

    const align = extractAlign(el);
    const isHeading = tag === 'h1' || tag === 'h2' || tag === 'h3';
    const fontSz = tag === 'h1' ? 30 : tag === 'h2' ? 26 : 24;
    const { drawings } = await renderElementInlineAndDrawings(el);
    const runs = textWithChemToWmlRuns(el.innerHTML, isHeading, false, fontSz);
    if (runs) {
      blocks.push(
        makeParagraph(runs, {
          align,
          spaceBefore: isHeading ? 120 : 40,
          spaceAfter: isHeading ? 60 : 80,
        })
      );
    }
    blocks.push(...drawings);
  }

  return blocks;
}

/**
 * Export Lesson Material or Worksheet (Phiếu học tập) directly to editable .docx with OMML formulas,
 * tables, images, and 2D organic structure diagrams.
 */
export async function exportRichDocToDocx(opts: {
  title: string;
  subtitle?: string;
  sections: { heading: string; html: string }[];
  fileName: string;
}): Promise<void> {
  const images: { rId: string; fileName: string; bytes: Uint8Array }[] = [];
  let imgCounter = 1;
  const pushImage = (bytes: Uint8Array, prefix = 'doc') => {
    const rId = `rIdDocImg${imgCounter}`;
    const fileName = `${prefix}_${imgCounter}.png`;
    images.push({ rId, fileName, bytes });
    imgCounter++;
    return rId;
  };

  const bodyParts: string[] = [
    makeParagraph(textWithChemToWmlRuns(opts.title.toUpperCase(), true, false, 28), {
      align: 'center',
      spaceAfter: 60,
    }),
  ];

  if (opts.subtitle) {
    bodyParts.push(
      makeParagraph(textWithChemToWmlRuns(opts.subtitle, false, true, 22), {
        align: 'center',
        spaceAfter: 160,
      })
    );
  }

  for (const sec of opts.sections) {
    if (!sec.html || !sec.html.trim()) continue;
    bodyParts.push(
      makeParagraph(textWithChemToWmlRuns(sec.heading, true, false, 24), {
        spaceBefore: 140,
        spaceAfter: 60,
      })
    );
    const secBlocks = await htmlToWmlBlocks(sec.html, pushImage);
    bodyParts.push(...secBlocks);
  }

  await packAndDownloadDocx(bodyParts.join('\n'), opts.fileName, images);
}

/**
 * Recursively convert a Word OMML (<m:oMath>) XML element into editable formula syntax,
 * flagging unrecognized/complex structures with [CẦN KIỂM TRA CÔNG THỨC].
 */
function parseOmmlElementToSource(el: Element, tracker: { ambiguous: number }): string {
  const local = el.localName || el.tagName.replace(/^[^:]+:/, '');
  const children = Array.from(el.children);

  if (local === 't') {
    return el.textContent || '';
  }
  if (local === 'r') {
    return children.map((c) => parseOmmlElementToSource(c, tracker)).join('');
  }
  if (local === 'e' || local === 'oMath' || local === 'oMathPara') {
    return children.map((c) => parseOmmlElementToSource(c, tracker)).join('');
  }
  if (local === 'sSub') {
    const eNode = children.find((c) => (c.localName || c.tagName).endsWith('e'));
    const subNode = children.find((c) => (c.localName || c.tagName).endsWith('sub'));
    const base = eNode ? parseOmmlElementToSource(eNode, tracker) : '';
    const sub = subNode ? parseOmmlElementToSource(subNode, tracker) : '';
    return sub.length === 1 ? `${base}_${sub}` : `${base}_{${sub}}`;
  }
  if (local === 'sSup') {
    const eNode = children.find((c) => (c.localName || c.tagName).endsWith('e'));
    const supNode = children.find((c) => (c.localName || c.tagName).endsWith('sup'));
    const base = eNode ? parseOmmlElementToSource(eNode, tracker) : '';
    const sup = supNode ? parseOmmlElementToSource(supNode, tracker) : '';
    return sup.length === 1 ? `${base}^${sup}` : `${base}^{${sup}}`;
  }
  if (local === 'sSubSup') {
    const eNode = children.find((c) => (c.localName || c.tagName).endsWith('e'));
    const subNode = children.find((c) => (c.localName || c.tagName).endsWith('sub'));
    const supNode = children.find((c) => (c.localName || c.tagName).endsWith('sup'));
    const base = eNode ? parseOmmlElementToSource(eNode, tracker) : '';
    const sub = subNode ? parseOmmlElementToSource(subNode, tracker) : '';
    const sup = supNode ? parseOmmlElementToSource(supNode, tracker) : '';
    return `${base}_{${sub}}^{${sup}}`;
  }
  if (local === 'f') {
    const numNode = children.find((c) => (c.localName || c.tagName).endsWith('num'));
    const denNode = children.find((c) => (c.localName || c.tagName).endsWith('den'));
    const num = numNode ? parseOmmlElementToSource(numNode, tracker) : '';
    const den = denNode ? parseOmmlElementToSource(denNode, tracker) : '';
    return `\\frac{${num}}{${den}}`;
  }
  if (local === 'num' || local === 'den' || local === 'sub' || local === 'sup') {
    return children.map((c) => parseOmmlElementToSource(c, tracker)).join('');
  }
  if (local === 'rPr' || local === 'ctrlPr' || local === 'fPr' || local === 'sSubPr' || local === 'sSupPr') {
    return '';
  }

  // Complex or unrecognized OMML container: extract text if possible AND flag for review
  const fallbackText = Array.from(el.getElementsByTagName('m:t'))
    .map((t) => t.textContent || '')
    .join('')
    .trim();
  tracker.ambiguous += 1;
  return fallbackText
    ? `${fallbackText} [CẦN KIỂM TRA CÔNG THỨC]`
    : `[CẦN KIỂM TRA CÔNG THỨC]`;
}

/**
 * Extract readable text (plus OMML chemistry/math conversions & table structure)
 * from an uploaded .docx, .xlsx, .csv, .txt, or .pdf file.
 * Flags ambiguous/image formulas with [CẦN KIỂM TRA CÔNG THỨC] rather than silently breaking them.
 */
export async function extractTextFromUploadedFile(
  file: File
): Promise<{ text: string; excelRows?: any[][]; ambiguousCount?: number }> {
  const lower = file.name.toLowerCase();

  // 1. Excel / CSV
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any[]>(firstSheet, { header: 1 });
    const text = rows.map((r) => (Array.isArray(r) ? r.join(' | ') : '')).join('\n');
    return { text, excelRows: rows, ambiguousCount: 0 };
  }

  // 2. DOCX (OOXML via JSZip preserving paragraph text + recursive OMML + tables)
  if (lower.endsWith('.docx')) {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      return { text: '', ambiguousCount: 0 };
    }
    const xmlStr = await docXmlFile.async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
    const tracker = { ambiguous: 0 };

    const extractParagraphText = (p: Element): string => {
      let buf = '';
      const walk = (node: Element) => {
        const local = node.localName || node.tagName.replace(/^[^:]+:/, '');
        if (local === 'oMath') {
          const parsedFormula = parseOmmlElementToSource(node, tracker);
          if (parsedFormula) {
            buf += ` $${parsedFormula}$ `;
          }
          return;
        }
        if (local === 'object' || local === 'pict') {
          tracker.ambiguous += 1;
          buf += ' [CẦN KIỂM TRA CÔNG THỨC] ';
          return;
        }
        if (local === 't') {
          buf += node.textContent || '';
          return;
        }
        if (local === 'br' || local === 'cr') {
          buf += ' ';
          return;
        }
        Array.from(node.children).forEach(walk);
      };
      Array.from(p.children).forEach(walk);
      return buf.replace(/\s+/g, ' ').trim();
    };

    const bodyEl = xmlDoc.getElementsByTagName('w:body')[0] || xmlDoc.documentElement;
    const lines: string[] = [];

    Array.from(bodyEl.children).forEach((block) => {
      const local = block.localName || block.tagName.replace(/^[^:]+:/, '');
      if (local === 'p') {
        const t = extractParagraphText(block);
        if (t) lines.push(t);
      } else if (local === 'tbl') {
        const rows = Array.from(block.getElementsByTagName('w:tr'));
        rows.forEach((tr) => {
          const cells = Array.from(tr.children).filter(
            (c) => (c.localName || c.tagName).endsWith('tc')
          );
          const cellTexts = cells.map((tc) =>
            Array.from(tc.getElementsByTagName('w:p'))
              .map(extractParagraphText)
              .filter(Boolean)
              .join(' ')
          );
          const rowLine = cellTexts.filter(Boolean).join(' | ').trim();
          if (rowLine) lines.push(rowLine);
        });
      }
    });

    return { text: lines.join('\n'), ambiguousCount: tracker.ambiguous };
  }

  // 3. PDF (extract readable literal text strings without fabricating anything)
  if (lower.endsWith('.pdf')) {
    const buffer = await file.arrayBuffer();
    const raw = new TextDecoder('latin1').decode(buffer);
    const matches = raw.match(/\(([^()]{2,200})\)/g) || [];
    const cleaned = matches
      .map((m) => m.slice(1, -1).replace(/\\[nrt]/g, ' ').replace(/[^\x20-\x7E\u00C0-\u1EF9]/g, ''))
      .filter((s) => /[a-zA-Z0-9\u00C0-\u1EF9]{2,}/.test(s));
    return { text: cleaned.join('\n'), ambiguousCount: 0 };
  }

  // 4. Plain text / Word HTML (.doc)
  const rawText = await file.text();
  if (rawText.includes('<html') || rawText.includes('<body')) {
    const stripped = rawText
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { text: stripped, ambiguousCount: 0 };
  }
  return { text: rawText, ambiguousCount: 0 };
}

/**
 * Parse structured question blocks from pasted/extracted text (e.g. "Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: B").
 */
export function parseQuestionsFromText(
  rawText: string,
  defaultGrade: 10 | 11 | 12
): Partial<Question>[] {
  const blocks = rawText
    .split(/(?=Câu\s+\d+\s*[:.])/gi)
    .map((b) => b.trim())
    .filter((b) => b.length > 8);

  const parsed: Partial<Question>[] = [];

  for (const block of blocks) {
    const cleanHeader = block.replace(/^Câu\s+\d+\s*[:.]\s*/i, '').trim();
    const optMatch = cleanHeader.match(/\n?\s*A\.\s+([\s\S]*?)\s*B\.\s+([\s\S]*?)\s*C\.\s+([\s\S]*?)\s*D\.\s+([\s\S]*?)(?:\n|$|Đáp án|Lời giải)/i);
    const ansMatch = cleanHeader.match(/Đáp án\s*[:.]\s*([A-D]|[0-9.,\-]+)/i);
    const expMatch = cleanHeader.match(/(?:Lời giải|Giải thích)\s*[:.]\s*([\s\S]+)$/i);

    if (optMatch) {
      const stem = cleanHeader.slice(0, optMatch.index).trim();
      const correctLetter = (ansMatch?.[1] || 'A').toUpperCase();
      parsed.push({
        type: 'MCQ',
        grade: defaultGrade,
        chapter: 'Chủ đề nhập từ tài liệu',
        topic: 'Câu hỏi nhập tự động',
        cognitiveLevel: 'THONG_HIEU',
        content: stem,
        options: [
          { id: 'A', content: optMatch[1].trim(), isCorrect: correctLetter === 'A' },
          { id: 'B', content: optMatch[2].trim(), isCorrect: correctLetter === 'B' },
          { id: 'C', content: optMatch[3].trim(), isCorrect: correctLetter === 'C' },
          { id: 'D', content: optMatch[4].trim(), isCorrect: correctLetter === 'D' },
        ],
        maxScore: 0.25,
        explanation: expMatch?.[1]?.trim() || '',
        isApproved: false,
      });
    } else if (/a\)\s+/i.test(cleanHeader) && /b\)\s+/i.test(cleanHeader)) {
      const firstIdx = cleanHeader.search(/a\)\s+/i);
      const stem = cleanHeader.slice(0, firstIdx).trim();
      const stPart = cleanHeader.slice(firstIdx);
      const stMatches = stPart.split(/(?=[a-d]\)\s+)/i).map((s) => s.replace(/^[a-d]\)\s+/i, '').trim());
      parsed.push({
        type: 'MULTIPLE_TRUE_FALSE',
        grade: defaultGrade,
        chapter: 'Chủ đề nhập từ tài liệu',
        topic: 'Câu hỏi Đúng/Sai nhập từ tài liệu',
        cognitiveLevel: 'VAN_DUNG',
        content: stem,
        tfStatements: stMatches.slice(0, 4).map((s, idx) => ({
          id: `tf_imp_${Date.now()}_${idx}`,
          statement: s,
          isCorrect: !/\[Sai\]/i.test(s),
        })),
        maxScore: 1.0,
        explanation: expMatch?.[1]?.trim() || '',
        isApproved: false,
      });
    } else {
      parsed.push({
        type: ansMatch ? 'SHORT_ANSWER' : 'ESSAY',
        grade: defaultGrade,
        chapter: 'Chủ đề nhập từ tài liệu',
        topic: 'Câu hỏi nhập từ tài liệu',
        cognitiveLevel: 'VAN_DUNG',
        content: cleanHeader.replace(/(?:Đáp án|Lời giải)\s*[:.][\s\S]*/i, '').trim(),
        correctAnswer: ansMatch?.[1]?.trim(),
        maxScore: ansMatch ? 0.5 : 1.0,
        explanation: expMatch?.[1]?.trim() || '',
        isApproved: false,
      });
    }
  }

  return parsed;
}
