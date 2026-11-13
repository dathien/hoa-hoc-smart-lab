import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FORMULA_CATEGORIES,
  FormulaNodeMode,
  OrganicStructureGraph,
  QUICK_SAMPLE_CHEMICALS,
  QuickFormulaItem,
  SYMBOL_KEYBOARD_GROUPS,
  VERIFIED_SAMPLE_EQUATIONS,
  VisualReactionSpecies,
  VisualReactionState,
  buildChemNodeHtml,
  escapeHtml,
  hydrateChemNodesInElement,
  organicGraphToSvg,
  renderFormulaToHtml,
  serializeVisualReaction,
  tryParseReactionSource,
  upgradeContentForEditorHtml,
} from '../../utils/chemSyntax';
import { OrganicStructure2DEditor } from './OrganicStructure2DEditor';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Atom,
  Bold,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FlaskConical,
  Flame,
  Hexagon,
  Image as ImageIcon,
  Italic,
  Keyboard,
  Link2,
  List,
  ListOrdered,
  Plus,
  Redo2,
  RotateCcw,
  Search,
  Sparkles,
  Subscript,
  Superscript,
  Table as TableIcon,
  Trash2,
  Underline,
  Undo2,
  X,
} from 'lucide-react';

export interface SmartChemEditorProps {
  value: string;
  onChange: (htmlValue: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: number;
  draftKey?: string;
  compact?: boolean;
  className?: string;
}

type ActiveSubPanel =
  | 'none'
  | 'formula'
  | 'reaction-builder'
  | 'ion-builder'
  | 'reaction-cond'
  | 'organic2d'
  | 'link'
  | 'image'
  | 'table';

const DRAFT_PREFIX = 'smart_chem_draft_v1_';
const RECENT_SYMBOLS_KEY = 'smart_chem_recent_symbols_v1';

const DEFAULT_REACTION_STATE = (): VisualReactionState => ({
  reactants: [
    { id: 'r1', coeff: '', formula: 'N2', state: '(k)', marker: '' },
    { id: 'r2', coeff: '3', formula: 'H2', state: '(k)', marker: '' },
  ],
  products: [{ id: 'p1', coeff: '2', formula: 'NH3', state: '(k)', marker: '' }],
  arrowType: '<=>',
  condAbove: 'xt, t°',
  condBelow: 'p',
  enthalpyValue: '-92',
  enthalpyUnit: 'kJ',
});

const EMPTY_REACTION_STATE = (): VisualReactionState => ({
  reactants: [
    { id: `r_${Date.now()}_1`, coeff: '', formula: '', state: '', marker: '' },
    { id: `r_${Date.now()}_2`, coeff: '', formula: '', state: '', marker: '' },
  ],
  products: [{ id: `p_${Date.now()}_1`, coeff: '', formula: '', state: '', marker: '' }],
  arrowType: '->',
  condAbove: '',
  condBelow: '',
  enthalpyValue: '',
  enthalpyUnit: 'kJ',
});

export const SmartChemEditor: React.FC<SmartChemEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung câu hỏi, công thức hóa học, phương trình hoặc cấu tạo 2D...',
  label,
  minHeight = 150,
  draftKey,
  compact = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEmittedRef = useRef<string>(value);
  const savedRangeRef = useRef<Range | null>(null);
  const editingNodeRef = useRef<HTMLElement | null>(null);

  // Undo/Redo history stack
  const historyRef = useRef<string[]>([upgradeContentForEditorHtml(value)]);
  const historyIdxRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Formatting state indicators (direct subscript / superscript at caret)
  const [isSubActive, setIsSubActive] = useState(false);
  const [isSupActive, setIsSupActive] = useState(false);

  // Inline Chemistry Symbol Keyboard (Section IV & XI)
  const [showSymbolKeyboard, setShowSymbolKeyboard] = useState<boolean>(false);
  const [activeSymGroup, setActiveSymGroup] = useState<'G1' | 'G2' | 'G3' | 'G4' | 'G5'>('G1');
  const [symbolSearch, setSymbolSearch] = useState<string>('');
  const [recentSymbols, setRecentSymbols] = useState<QuickFormulaItem[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SYMBOLS_KEY);
      return raw ? (JSON.parse(raw) as QuickFormulaItem[]) : [];
    } catch {
      return [];
    }
  });

  // Inline sub-panels (NO popup modal!)
  const [activePanel, setActivePanel] = useState<ActiveSubPanel>('none');
  const [formulaMode, setFormulaMode] = useState<FormulaNodeMode>('chem');
  const [activeCategory, setActiveCategory] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'>('A');
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [showAdvancedSyntax, setShowAdvancedSyntax] = useState<boolean>(false);
  const [isEditingExistingNode, setIsEditingExistingNode] = useState<boolean>(false);

  // Visual Reaction Builder state (Section VI)
  const [reactionState, setReactionState] = useState<VisualReactionState>(EMPTY_REACTION_STATE);

  // Ion & Charge builder state
  const [ionBase, setIonBase] = useState<string>('SO4');
  const [ionCharge, setIonCharge] = useState<string>('2-');

  // Reaction Condition Quick Arrow state
  const [condArrowType, setCondArrowType] = useState<'->' | '<=>'>('->');
  const [condAboveInput, setCondAboveInput] = useState<string>('t°');
  const [condBelowInput, setCondBelowInput] = useState<string>('');

  // 2D Organic Structure state
  const [editingOrganicGraph, setEditingOrganicGraph] = useState<OrganicStructureGraph | null>(null);
  const [editingOrganicLabel, setEditingOrganicLabel] = useState<string>('Cấu tạo hữu cơ 2D');

  // Link / Image / Table inline panels
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Draft recovery banner
  const [recoverableDraft, setRecoverableDraft] = useState<string | null>(null);

  // Sync external `value` into DOM safely (upgrading any legacy raw LaTeX into clickable rendered KaTeX nodes!)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastEmittedRef.current) {
      const upgraded = upgradeContentForEditorHtml(value);
      el.innerHTML = upgraded;
      hydrateChemNodesInElement(el);
      lastEmittedRef.current = value;
      historyRef.current = [el.innerHTML];
      historyIdxRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [value]);

  // Initial mount hydration & draft check
  useEffect(() => {
    const el = editorRef.current;
    if (el) {
      el.innerHTML = upgradeContentForEditorHtml(value);
      hydrateChemNodesInElement(el);
    }
    if (draftKey) {
      try {
        const saved = localStorage.getItem(DRAFT_PREFIX + draftKey);
        if (saved && saved.trim() && saved !== value && saved !== upgradeContentForEditorHtml(value)) {
          setRecoverableDraft(saved);
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  const refreshSubSupIndicator = useCallback(() => {
    try {
      setIsSubActive(document.queryCommandState('subscript'));
      setIsSupActive(document.queryCommandState('superscript'));
    } catch {}
  }, []);

  const pushHistorySnapshot = useCallback((html: string) => {
    const arr = historyRef.current.slice(0, historyIdxRef.current + 1);
    if (arr[arr.length - 1] !== html) {
      arr.push(html);
      if (arr.length > 60) arr.shift();
      historyRef.current = arr;
      historyIdxRef.current = arr.length - 1;
      setCanUndo(historyIdxRef.current > 0);
      setCanRedo(false);
    }
  }, []);

  const emitChange = useCallback(
    (recordHistory = true) => {
      const el = editorRef.current;
      if (!el) return;
      const activeNodes = el.querySelectorAll('.chem-formula-node-active');
      activeNodes.forEach((n) => n.classList.remove('chem-formula-node-active'));
      const html = el.innerHTML;
      if (editingNodeRef.current && el.contains(editingNodeRef.current)) {
        editingNodeRef.current.classList.add('chem-formula-node-active');
      }

      lastEmittedRef.current = html;
      if (recordHistory) pushHistorySnapshot(html);
      onChange(html);

      if (draftKey) {
        try {
          localStorage.setItem(DRAFT_PREFIX + draftKey, html);
        } catch {}
      }
    },
    [draftKey, onChange, pushHistorySnapshot]
  );

  const saveSelection = useCallback(() => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
    refreshSubSupIndicator();
  }, [refreshSubSupIndicator]);

  const restoreSelectionOrFocusEnd = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    if (savedRangeRef.current && el.contains(savedRangeRef.current.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    } else {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  const clearEditingNodeHighlight = useCallback(() => {
    if (editingNodeRef.current) {
      editingNodeRef.current.classList.remove('chem-formula-node-active');
      editingNodeRef.current = null;
    }
    setIsEditingExistingNode(false);
  }, []);

  const execFormat = (command: string, val?: string) => {
    restoreSelectionOrFocusEnd();
    document.execCommand(command, false, val);
    saveSelection();
    emitChange(true);
  };

  /**
   * Exit active subscript/superscript cleanly so next typed text is normal baseline.
   */
  const exitSubSupFormatting = useCallback(() => {
    restoreSelectionOrFocusEnd();
    try {
      if (document.queryCommandState('subscript')) {
        document.execCommand('subscript', false);
      }
      if (document.queryCommandState('superscript')) {
        document.execCommand('superscript', false);
      }
    } catch {}
    // Also ensure caret moves outside any <sub>/<sup> ancestor if collapsed at end
    const sel = window.getSelection();
    const el = editorRef.current;
    if (sel && sel.rangeCount > 0 && el) {
      const range = sel.getRangeAt(0);
      let node: Node | null = range.startContainer;
      let subOrSup: HTMLElement | null = null;
      while (node && node !== el) {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          ((node as HTMLElement).tagName === 'SUB' || (node as HTMLElement).tagName === 'SUP')
        ) {
          subOrSup = node as HTMLElement;
        }
        node = node.parentNode;
      }
      if (subOrSup && range.collapsed) {
        const afterText = document.createTextNode('\u200B');
        subOrSup.parentNode?.insertBefore(afterText, subOrSup.nextSibling);
        const newRange = document.createRange();
        newRange.setStartAfter(afterText);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      }
    }
    refreshSubSupIndicator();
    emitChange(false);
  }, [emitChange, refreshSubSupIndicator, restoreSelectionOrFocusEnd]);

  /**
   * Insert HTML node or plain text AT EXACT SAVED CARET POSITION without losing focus or jumping to end.
   */
  const insertAtCaret = useCallback(
    (htmlOrText: string, isRichNode = true) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelectionOrFocusEnd();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();

      if (isRichNode) {
        const temp = document.createElement('div');
        temp.innerHTML = htmlOrText;
        const firstEl = temp.firstElementChild as HTMLElement | null;
        if (firstEl) {
          const trailing = document.createTextNode('\u00A0');
          range.insertNode(trailing);
          range.insertNode(firstEl);
          const afterRange = document.createRange();
          afterRange.setStartAfter(trailing);
          afterRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(afterRange);
          savedRangeRef.current = afterRange.cloneRange();
        }
      } else {
        const textNode = document.createTextNode(htmlOrText);
        range.insertNode(textNode);
        const afterRange = document.createRange();
        afterRange.setStartAfter(textNode);
        afterRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(afterRange);
        savedRangeRef.current = afterRange.cloneRange();
      }
      emitChange(true);
    },
    [emitChange, restoreSelectionOrFocusEnd]
  );

  /**
   * Insert a superscript charge (e.g. +, −, 2+, 3+, 2−, 3−) right at caret using real <sup> element
   * and exit sub/sup afterwards so SO4 + 2- yields genuine SO<sub>4</sub><sup>2−</sup>!
   */
  const insertChargeSuperscriptAtCaret = useCallback(
    (chargeText: string) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelectionOrFocusEnd();
      // If currently inside <sub>, step out first so charge sits beside subscript rather than nested inside it!
      try {
        if (document.queryCommandState('subscript')) {
          document.execCommand('subscript', false);
        }
      } catch {}
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      let node: Node | null = range.startContainer;
      let insideSub: HTMLElement | null = null;
      while (node && node !== el) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'SUB') {
          insideSub = node as HTMLElement;
        }
        node = node.parentNode;
      }
      if (insideSub && insideSub.parentNode) {
        const afterRange = document.createRange();
        afterRange.setStartAfter(insideSub);
        afterRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(afterRange);
      }

      const activeRange = sel.getRangeAt(0);
      activeRange.deleteContents();
      const sup = document.createElement('sup');
      sup.textContent = chargeText;
      const spacer = document.createTextNode('\u200B');
      activeRange.insertNode(spacer);
      activeRange.insertNode(sup);

      const nextRange = document.createRange();
      nextRange.setStartAfter(spacer);
      nextRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      savedRangeRef.current = nextRange.cloneRange();
      refreshSubSupIndicator();
      emitChange(true);
    },
    [emitChange, refreshSubSupIndicator, restoreSelectionOrFocusEnd]
  );

  const recordRecentSymbol = useCallback((item: QuickFormulaItem) => {
    if (!item.code || ['SUB', 'SUP', 'EXIT_SUBSUP', 'OPEN_2D', 'OPEN_COND'].includes(item.code)) {
      return;
    }
    setRecentSymbols((prev) => {
      const filtered = prev.filter((x) => x.code !== item.code);
      const next = [item, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_SYMBOLS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleSymbolClick = (item: QuickFormulaItem) => {
    recordRecentSymbol(item);

    if (item.insertKind === 'sub') {
      restoreSelectionOrFocusEnd();
      try {
        if (document.queryCommandState('superscript')) {
          document.execCommand('superscript', false);
        }
      } catch {}
      document.execCommand('subscript', false);
      saveSelection();
      emitChange(true);
      return;
    }

    if (item.insertKind === 'sup') {
      restoreSelectionOrFocusEnd();
      try {
        if (document.queryCommandState('subscript')) {
          document.execCommand('subscript', false);
        }
      } catch {}
      document.execCommand('superscript', false);
      saveSelection();
      emitChange(true);
      return;
    }

    if (item.insertKind === 'exit-sub-sup') {
      exitSubSupFormatting();
      return;
    }

    if (item.insertKind === 'charge-sup') {
      insertChargeSuperscriptAtCaret(item.code);
      return;
    }

    if (item.insertKind === 'open-2d') {
      handleOpenOrganic2DPanel();
      return;
    }

    if (item.insertKind === 'reaction-cond') {
      saveSelection();
      clearEditingNodeHighlight();
      setActivePanel('reaction-cond');
      return;
    }

    if (item.insertKind === 'node') {
      insertAtCaret(buildChemNodeHtml(item.code, item.mode || 'chem'), true);
      return;
    }

    insertAtCaret(item.code, false);
  };

  const handleUndo = () => {
    const el = editorRef.current;
    if (!el || historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const html = historyRef.current[historyIdxRef.current] ?? '';
    el.innerHTML = html;
    hydrateChemNodesInElement(el);
    lastEmittedRef.current = html;
    onChange(html);
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
    clearEditingNodeHighlight();
  };

  const handleRedo = () => {
    const el = editorRef.current;
    if (!el || historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const html = historyRef.current[historyIdxRef.current] ?? '';
    el.innerHTML = html;
    hydrateChemNodesInElement(el);
    lastEmittedRef.current = html;
    onChange(html);
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
    clearEditingNodeHighlight();
  };

  const handleOpenChemPanel = () => {
    saveSelection();
    clearEditingNodeHighlight();
    setFormulaMode('chem');
    setActiveCategory('A');
    setFormulaInput('');
    setActivePanel(activePanel === 'formula' ? 'none' : 'formula');
  };

  const handleOpenReactionBuilder = () => {
    saveSelection();
    clearEditingNodeHighlight();
    setReactionState(EMPTY_REACTION_STATE());
    setFormulaMode('reaction');
    setFormulaInput('');
    setShowAdvancedSyntax(false);
    setActivePanel(activePanel === 'reaction-builder' ? 'none' : 'reaction-builder');
  };

  const handleOpenIonBuilder = () => {
    saveSelection();
    clearEditingNodeHighlight();
    setActivePanel(activePanel === 'ion-builder' ? 'none' : 'ion-builder');
  };

  const handleOpenConditionPanel = () => {
    saveSelection();
    clearEditingNodeHighlight();
    setActivePanel(activePanel === 'reaction-cond' ? 'none' : 'reaction-cond');
  };

  const handleOpenOrganic2DPanel = () => {
    saveSelection();
    clearEditingNodeHighlight();
    setEditingOrganicGraph(null);
    setEditingOrganicLabel('Cấu tạo hữu cơ 2D');
    setActivePanel(activePanel === 'organic2d' ? 'none' : 'organic2d');
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const node = target.closest('[data-chem-node="true"]') as HTMLElement | null;

    if (node && editorRef.current?.contains(node)) {
      e.preventDefault();
      e.stopPropagation();
      clearEditingNodeHighlight();
      editingNodeRef.current = node;
      node.classList.add('chem-formula-node-active');
      setIsEditingExistingNode(true);

      const mode = (node.getAttribute('data-mode') || 'chem') as FormulaNodeMode;
      const src = node.getAttribute('data-source') || '';

      if (mode === 'organic2d') {
        const jsonStr = node.getAttribute('data-structure-json');
        let parsed: OrganicStructureGraph | null = null;
        if (jsonStr) {
          try {
            parsed = JSON.parse(jsonStr);
          } catch {}
        }
        setEditingOrganicGraph(parsed);
        setEditingOrganicLabel(src || 'Cấu tạo hữu cơ 2D');
        setActivePanel('organic2d');
      } else if (mode === 'reaction') {
        const parsedRx = tryParseReactionSource(src);
        if (parsedRx) {
          setReactionState(parsedRx);
          setFormulaMode('reaction');
          setFormulaInput(src);
          setShowAdvancedSyntax(false);
          setActivePanel('reaction-builder');
        } else {
          setFormulaMode('reaction');
          setFormulaInput(src);
          setActiveCategory('D');
          setActivePanel('formula');
        }
      } else {
        setFormulaMode(mode);
        setFormulaInput(src);
        if (mode === 'organic') setActiveCategory('F');
        else if (mode === 'math') setActiveCategory('G');
        else setActiveCategory('A');
        setActivePanel('formula');
      }
      return;
    }

    saveSelection();
  };

  const replaceOrInsertFormulaNode = (sourceText: string, mode: FormulaNodeMode) => {
    const trimmed = sourceText.trim();
    if (!trimmed) return;
    const el = editorRef.current;
    if (!el) return;

    // 1. Editing an existing clicked node: replace IN-PLACE cleanly without duplicating
    if (isEditingExistingNode && editingNodeRef.current && el.contains(editingNodeRef.current)) {
      const targetNode = editingNodeRef.current;
      targetNode.setAttribute('data-source', trimmed);
      targetNode.setAttribute('data-mode', mode);
      targetNode.setAttribute('contenteditable', 'false');
      targetNode.innerHTML = renderFormulaToHtml(trimmed, mode, false);
      clearEditingNodeHighlight();
      setActivePanel('none');
      setFormulaInput('');
      emitChange(true);
      return;
    }

    // 2. Otherwise insert at saved caret position
    insertAtCaret(buildChemNodeHtml(trimmed, mode), true);
    setActivePanel('none');
    setFormulaInput('');
  };

  const handleConfirmReactionBuilder = () => {
    const activeSrc = showAdvancedSyntax
      ? formulaInput.trim()
      : serializeVisualReaction(reactionState);
    if (!activeSrc) return;
    replaceOrInsertFormulaNode(activeSrc, 'reaction');
  };

  const handleConfirmFormula = () => {
    replaceOrInsertFormulaNode(formulaInput, formulaMode);
  };

  const handleConfirmIon = () => {
    const base = ionBase.trim();
    if (!base) return;
    const src = ionCharge.trim() ? `${base}^${ionCharge.trim()}` : base;
    replaceOrInsertFormulaNode(src, 'chem');
  };

  const handleConfirmConditionArrow = () => {
    const a = condAboveInput.trim();
    const b = condBelowInput.trim();
    let code = condArrowType as string;
    if (a && b) code = `${condArrowType}[${a}|${b}]`;
    else if (a) code = `${condArrowType}[${a}]`;
    else if (b) code = `${condArrowType}[|${b}]`;
    insertAtCaret(buildChemNodeHtml(code, 'reaction'), true);
    setActivePanel('none');
  };

  const handleConfirmOrganic2D = (structLabel: string, graph: OrganicStructureGraph) => {
    const el = editorRef.current;
    if (!el) return;
    const jsonStr = JSON.stringify(graph);

    if (isEditingExistingNode && editingNodeRef.current && el.contains(editingNodeRef.current)) {
      const targetNode = editingNodeRef.current;
      targetNode.setAttribute('data-mode', 'organic2d');
      targetNode.setAttribute('data-source', structLabel);
      targetNode.setAttribute('data-structure-json', jsonStr);
      targetNode.setAttribute('contenteditable', 'false');
      targetNode.classList.add('chem-organic-2d');
      targetNode.innerHTML = organicGraphToSvg(graph, { compact: true });
      clearEditingNodeHighlight();
      setActivePanel('none');
      emitChange(true);
      return;
    }

    insertAtCaret(buildChemNodeHtml(structLabel, 'organic2d', jsonStr), true);
    setActivePanel('none');
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    restoreSelectionOrFocusEnd();
    const text = linkText.trim() || linkUrl.trim();
    const html = `<a href="${escapeHtml(linkUrl.trim())}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>&nbsp;`;
    document.execCommand('insertHTML', false, html);
    setActivePanel('none');
    setLinkUrl('https://');
    setLinkText('');
    emitChange(true);
  };

  const handleInsertImageUrl = (srcUrl: string) => {
    if (!srcUrl.trim()) return;
    restoreSelectionOrFocusEnd();
    const html = `<img src="${escapeHtml(srcUrl.trim())}" alt="Hình minh họa Hóa học" style="max-height:240px;" />`;
    document.execCommand('insertHTML', false, html);
    setActivePanel('none');
    setImageUrlInput('');
    emitChange(true);
  };

  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleInsertImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsertTable = () => {
    const r = Math.max(1, Math.min(10, tableRows));
    const c = Math.max(1, Math.min(8, tableCols));
    let html = '<table><thead><tr>';
    for (let j = 0; j < c; j++) html += `<th>Cột ${j + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let i = 1; i < r; i++) {
      html += '<tr>';
      for (let j = 0; j < c; j++) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    restoreSelectionOrFocusEnd();
    document.execCommand('insertHTML', false, html);
    setActivePanel('none');
    emitChange(true);
  };

  const reactionSourcePreview = useMemo(() => {
    if (showAdvancedSyntax) return formulaInput;
    return serializeVisualReaction(reactionState);
  }, [formulaInput, reactionState, showAdvancedSyntax]);

  const reactionPreviewHtml = useMemo(
    () => (reactionSourcePreview.trim() ? renderFormulaToHtml(reactionSourcePreview, 'reaction', false) : ''),
    [reactionSourcePreview]
  );

  const livePreviewHtml = useMemo(
    () => (formulaInput.trim() ? renderFormulaToHtml(formulaInput, formulaMode, false) : ''),
    [formulaInput, formulaMode]
  );

  const ionPreviewHtml = useMemo(() => {
    if (!ionBase.trim()) return '';
    const src = ionCharge.trim() ? `${ionBase.trim()}^${ionCharge.trim()}` : ionBase.trim();
    return renderFormulaToHtml(src, 'chem', false);
  }, [ionBase, ionCharge]);

  const condPreviewHtml = useMemo(() => {
    const a = condAboveInput.trim();
    const b = condBelowInput.trim();
    let code = condArrowType as string;
    if (a && b) code = `${condArrowType}[${a}|${b}]`;
    else if (a) code = `${condArrowType}[${a}]`;
    else if (b) code = `${condArrowType}[|${b}]`;
    return renderFormulaToHtml(code, 'reaction', false);
  }, [condAboveInput, condArrowType, condBelowInput]);

  const activeCategoryData = useMemo(
    () => FORMULA_CATEGORIES.find((c) => c.id === activeCategory) || FORMULA_CATEGORIES[0],
    [activeCategory]
  );

  const filteredKeyboardItems = useMemo(() => {
    const q = symbolSearch.trim().toLowerCase();
    if (!q) {
      return SYMBOL_KEYBOARD_GROUPS.find((g) => g.id === activeSymGroup)?.items || [];
    }
    return SYMBOL_KEYBOARD_GROUPS.flatMap((g) => g.items).filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q) ||
        (it.description || '').toLowerCase().includes(q) ||
        (it.keywords || '').toLowerCase().includes(q)
    );
  }, [activeSymGroup, symbolSearch]);

  const updateSpecies = (
    side: 'reactants' | 'products',
    idx: number,
    patch: Partial<VisualReactionSpecies>
  ) => {
    setReactionState((prev) => ({
      ...prev,
      [side]: prev[side].map((sp, i) => (i === idx ? { ...sp, ...patch } : sp)),
    }));
  };

  return (
    <div className={`bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-xs ${className}`}>
      {label && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{label}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            Nhấp trực tiếp vào công thức trong nội dung để chỉnh sửa
          </span>
        </div>
      )}

      {/* Recoverable draft banner */}
      {recoverableDraft && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-950">
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Có bản nháp tự lưu trước đó cho nội dung này.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.innerHTML = upgradeContentForEditorHtml(recoverableDraft);
                  hydrateChemNodesInElement(editorRef.current);
                  emitChange(true);
                }
                setRecoverableDraft(null);
              }}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg"
            >
              Khôi phục nháp
            </button>
            <button
              type="button"
              onClick={() => {
                if (draftKey) {
                  try {
                    localStorage.removeItem(DRAFT_PREFIX + draftKey);
                  } catch {}
                }
                setRecoverableDraft(null);
              }}
              className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {/* MAIN TOOLBAR (TEXT FORMATTING + 6 CHEMISTRY GROUPS — NO "CT TOÁN") */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Heading / Paragraph select */}
          <select
            aria-label="Định dạng đoạn văn"
            defaultValue="P"
            onChange={(e) => execFormat('formatBlock', e.target.value)}
            className="px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-700 min-h-[36px]"
          >
            <option value="P">Đoạn văn</option>
            <option value="H1">Tiêu đề 1</option>
            <option value="H2">Tiêu đề 2</option>
            <option value="H3">Tiêu đề 3</option>
          </select>

          {/* Bold, Italic, Underline */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('bold')}
              title="In đậm"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('italic')}
              title="In nghiêng"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('underline')}
              title="Gạch chân"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Subscript / Superscript / Escape Formatting */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                restoreSelectionOrFocusEnd();
                try {
                  if (document.queryCommandState('superscript')) {
                    document.execCommand('superscript', false);
                  }
                } catch {}
                document.execCommand('subscript', false);
                saveSelection();
                emitChange(true);
              }}
              title="Chỉ số dưới (H₂O, SO₄) – Bôi đen số rồi nhấn hoặc bật để gõ"
              className={`p-1.5 rounded flex items-center gap-0.5 text-xs font-bold ${
                isSubActive ? 'bg-teal-700 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Subscript className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                restoreSelectionOrFocusEnd();
                try {
                  if (document.queryCommandState('subscript')) {
                    document.execCommand('subscript', false);
                  }
                } catch {}
                document.execCommand('superscript', false);
                saveSelection();
                emitChange(true);
              }}
              title="Chỉ số trên / Điện tích (²⁻, ³⁺) – Bôi đen rồi nhấn hoặc bật để gõ"
              className={`p-1.5 rounded flex items-center gap-0.5 text-xs font-bold ${
                isSupActive ? 'bg-teal-700 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Superscript className="w-4 h-4" />
            </button>
            {(isSubActive || isSupActive) && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={exitSubSupFormatting}
                title="Thoát chế độ chỉ số để nhập chữ bình thường"
                className="px-1.5 py-1 rounded bg-amber-100 text-amber-900 text-[11px] font-black"
              >
                Thoát chỉ số
              </button>
            )}
          </div>

          {/* Alignment */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('justifyLeft')}
              title="Căn trái"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('justifyCenter')}
              title="Căn giữa"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('justifyRight')}
              title="Căn phải"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('insertUnorderedList')}
              title="Danh sách dấu đầu dòng"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execFormat('insertOrderedList')}
              title="Danh sách đánh số"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Link, Image, Table */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setActivePanel(activePanel === 'link' ? 'none' : 'link');
              }}
              title="Chèn liên kết"
              className={`p-1.5 rounded ${
                activePanel === 'link' ? 'bg-teal-100 text-teal-800' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setActivePanel(activePanel === 'image' ? 'none' : 'image');
              }}
              title="Chèn hình ảnh"
              className={`p-1.5 rounded ${
                activePanel === 'image' ? 'bg-teal-100 text-teal-800' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setActivePanel(activePanel === 'table' ? 'none' : 'table');
              }}
              title="Chèn bảng dữ liệu"
              className={`p-1.5 rounded ${
                activePanel === 'table' ? 'bg-teal-100 text-teal-800' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUndo}
              disabled={!canUndo}
              title="Hoàn tác (Ctrl+Z)"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 disabled:opacity-35"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleRedo}
              disabled={!canRedo}
              title="Làm lại (Ctrl+Y)"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 disabled:opacity-35"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 SPECIALIZED CHEMISTRY TOOL GROUPS (NO "CT TOÁN") */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/80">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenChemPanel}
            title="Chèn công thức phân tử, nhiệt hóa học hoặc công thức tính hóa học"
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
              activePanel === 'formula'
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-50'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>CT Hóa</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenReactionBuilder}
            title="Trình soạn phương trình phản ứng trực quan (chất tham gia, mũi tên, điều kiện, nhiệt phản ứng)"
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
              activePanel === 'reaction-builder'
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>PT phản ứng</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenIonBuilder}
            title="Chèn nhanh ion và điện tích (+, -, 2+, 3+, 2-, 3-)"
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
              activePanel === 'ion-builder'
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ion &amp; Điện tích</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              saveSelection();
              setShowSymbolKeyboard((v) => !v);
            }}
            title="Mở / thu gọn bàn phím ký hiệu Hóa học (5 nhóm chuyên dụng)"
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
              showSymbolKeyboard
                ? 'bg-sky-700 text-white border-sky-800'
                : 'bg-white text-sky-800 border-sky-300 hover:bg-sky-50'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Ký hiệu Hóa học</span>
            {showSymbolKeyboard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenOrganic2DPanel}
            title="Mở trình vẽ công thức cấu tạo hữu cơ 2D (vòng benzen, nhánh, liên kết đơn/đôi/ba)"
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
              activePanel === 'organic2d'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5" />
            <span>Cấu tạo 2D</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenConditionPanel}
            title="Đặt mũi tên phản ứng kèm điều kiện phía trên và phía dưới"
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
              activePanel === 'reaction-cond'
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Điều kiện phản ứng</span>
          </button>
        </div>
      </div>

      {/* SECTION IV: INLINE COLLAPSIBLE CHEMISTRY SYMBOL KEYBOARD */}
      {showSymbolKeyboard && (
        <div className="p-3 bg-sky-50/40 border-b border-sky-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
                placeholder="Tìm ký hiệu Hóa học (VD: SO4, thuận nghịch, enthalpy...)"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowSymbolKeyboard(false)}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Thu gọn bàn phím
            </button>
          </div>

          {/* Recent + Frequently used strip */}
          {recentSymbols.length > 0 && !symbolSearch && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Clock className="w-3 h-3" /> Gần đây:
              </span>
              {recentSymbols.map((item, idx) => (
                <button
                  key={`rec_${item.code}_${idx}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSymbolClick(item)}
                  title={item.description || item.label}
                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-teal-50 border border-slate-300 text-slate-800 rounded-md"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* 5 Chemistry Keyboard Group Tabs */}
          {!symbolSearch && (
            <div className="flex flex-wrap gap-1.5">
              {SYMBOL_KEYBOARD_GROUPS.map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setActiveSymGroup(grp.id)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    activeSymGroup === grp.id
                      ? 'bg-sky-700 text-white border-sky-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {compact ? grp.shortTitle : grp.title}
                </button>
              ))}
            </div>
          )}

          {/* Symbol Buttons Grid */}
          <div className="flex flex-wrap gap-1.5 p-2.5 bg-white border border-slate-200 rounded-xl max-h-56 overflow-y-auto">
            {filteredKeyboardItems.length === 0 ? (
              <span className="text-xs text-slate-400 italic p-1">
                Không tìm thấy ký hiệu phù hợp với &ldquo;{symbolSearch}&rdquo;.
              </span>
            ) : (
              filteredKeyboardItems.map((item, idx) => (
                <button
                  key={`${item.label}_${idx}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSymbolClick(item)}
                  title={item.description || item.label}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors min-h-[34px] ${
                    item.insertKind === 'open-2d'
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                      : item.insertKind === 'sub' && isSubActive
                      ? 'bg-teal-700 text-white border-teal-800'
                      : item.insertKind === 'sup' && isSupActive
                      ? 'bg-teal-700 text-white border-teal-800'
                      : item.insertKind === 'exit-sub-sup'
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                      : item.insertKind === 'node'
                      ? 'bg-teal-50/70 hover:bg-teal-100 border-teal-200 text-teal-900'
                      : 'bg-slate-50 hover:bg-sky-50 border-slate-300 text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION VI: INLINE VISUAL REACTION EQUATION BUILDER (NO POPUP) */}
      {activePanel === 'reaction-builder' && (
        <div className="p-4 bg-teal-50/50 border-b border-teal-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-black text-teal-950">
              {isEditingExistingNode
                ? 'Chỉnh Sửa Phương Trình Phản Ứng Đã Chọn'
                : 'Trình Chỉnh Sửa Phương Trình Phản Ứng Trực Quan'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!showAdvancedSyntax) {
                    setFormulaInput(serializeVisualReaction(reactionState));
                  } else {
                    const parsed = tryParseReactionSource(formulaInput);
                    if (parsed) setReactionState(parsed);
                  }
                  setShowAdvancedSyntax((v) => !v);
                }}
                className="px-2.5 py-1 text-xs font-bold bg-white border border-teal-300 text-teal-800 rounded-lg hover:bg-teal-50"
              >
                {showAdvancedSyntax ? 'Chuyển sang nhập từng chất trực quan' : 'Chế độ nhập nhanh / LaTeX'}
              </button>
            </div>
          </div>

          {!showAdvancedSyntax ? (
            <div className="space-y-3">
              {/* Quick verified reaction presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Mẫu SGK kiểm chứng:</span>
                {VERIFIED_SAMPLE_EQUATIONS.map((eq) => (
                  <button
                    key={eq.label}
                    type="button"
                    onClick={() => {
                      const p = tryParseReactionSource(eq.code);
                      if (p) setReactionState(p);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-sky-50 border border-sky-200 text-sky-900 rounded-lg"
                  >
                    {eq.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setReactionState(DEFAULT_REACTION_STATE())}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-teal-50 border border-teal-200 text-teal-900 rounded-lg"
                >
                  N₂ + 3H₂ ⇌ 2NH₃ (ΔᵣH°₂₉₈)
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Reactants */}
                <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase">Chất tham gia</span>
                    <button
                      type="button"
                      onClick={() =>
                        setReactionState((p) => ({
                          ...p,
                          reactants: [
                            ...p.reactants,
                            { id: `r_${Date.now()}`, coeff: '', formula: '', state: '', marker: '' },
                          ],
                        }))
                      }
                      className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm chất
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {reactionState.reactants.map((sp, idx) => (
                      <div key={sp.id} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={sp.coeff}
                          onChange={(e) => updateSpecies('reactants', idx, { coeff: e.target.value })}
                          placeholder="HS"
                          title="Hệ số (giữ nguyên chính xác)"
                          className="w-11 px-1.5 py-1 text-xs text-center font-bold bg-slate-50 border border-slate-300 rounded"
                        />
                        <input
                          type="text"
                          value={sp.formula}
                          onChange={(e) => updateSpecies('reactants', idx, { formula: e.target.value })}
                          placeholder="VD: N2, H2SO4"
                          className="flex-1 min-w-0 px-2 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded"
                        />
                        <select
                          value={sp.state}
                          onChange={(e) => updateSpecies('reactants', idx, { state: e.target.value })}
                          className="px-1 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                          title="Trạng thái"
                        >
                          <option value="">--</option>
                          <option value="(r)">(r)</option>
                          <option value="(l)">(l)</option>
                          <option value="(k)">(k)</option>
                          <option value="(dd)">(dd)</option>
                        </select>
                        {reactionState.reactants.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setReactionState((p) => ({
                                ...p,
                                reactants: p.reactants.filter((_, i) => i !== idx),
                              }))
                            }
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow & Conditions */}
                <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-700 uppercase block">
                    Mũi tên &amp; Điều kiện
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReactionState((p) => ({ ...p, arrowType: '->' }))}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        reactionState.arrowType === '->'
                          ? 'bg-teal-700 text-white border-teal-800'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      → Một chiều
                    </button>
                    <button
                      type="button"
                      onClick={() => setReactionState((p) => ({ ...p, arrowType: '<=>' }))}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        reactionState.arrowType === '<=>'
                          ? 'bg-teal-700 text-white border-teal-800'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      ⇌ Thuận nghịch
                    </button>
                  </div>

                  <input
                    type="text"
                    value={reactionState.condAbove}
                    onChange={(e) => setReactionState((p) => ({ ...p, condAbove: e.target.value }))}
                    placeholder="Điều kiện trên mũi tên (VD: xt, t°)"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={reactionState.condBelow}
                    onChange={(e) => setReactionState((p) => ({ ...p, condBelow: e.target.value }))}
                    placeholder="Điều kiện dưới mũi tên (VD: p, H2SO4 đặc)"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  <div className="flex flex-wrap gap-1">
                    {['t°', 'xt, t°', 'as', 'đpnc', 'đpdd'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setReactionState((p) => ({ ...p, condAbove: c }))}
                        className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 hover:bg-teal-100 rounded text-slate-700"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products */}
                <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase">Sản phẩm</span>
                    <button
                      type="button"
                      onClick={() =>
                        setReactionState((p) => ({
                          ...p,
                          products: [
                            ...p.products,
                            { id: `p_${Date.now()}`, coeff: '', formula: '', state: '', marker: '' },
                          ],
                        }))
                      }
                      className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm SP
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {reactionState.products.map((sp, idx) => (
                      <div key={sp.id} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={sp.coeff}
                          onChange={(e) => updateSpecies('products', idx, { coeff: e.target.value })}
                          placeholder="HS"
                          className="w-11 px-1.5 py-1 text-xs text-center font-bold bg-slate-50 border border-slate-300 rounded"
                        />
                        <input
                          type="text"
                          value={sp.formula}
                          onChange={(e) => updateSpecies('products', idx, { formula: e.target.value })}
                          placeholder="VD: NH3, BaSO4"
                          className="flex-1 min-w-0 px-2 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded"
                        />
                        <select
                          value={sp.state}
                          onChange={(e) => updateSpecies('products', idx, { state: e.target.value })}
                          className="px-1 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                        >
                          <option value="">--</option>
                          <option value="(r)">(r)</option>
                          <option value="(l)">(l)</option>
                          <option value="(k)">(k)</option>
                          <option value="(dd)">(dd)</option>
                        </select>
                        <select
                          value={sp.marker}
                          onChange={(e) =>
                            updateSpecies('products', idx, { marker: e.target.value as '' | '↑' | '↓' })
                          }
                          className="px-1 py-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded"
                          title="Khí ↑ / Kết tủa ↓"
                        >
                          <option value="">--</option>
                          <option value="↑">↑</option>
                          <option value="↓">↓</option>
                        </select>
                        {reactionState.products.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setReactionState((p) => ({
                                ...p,
                                products: p.products.filter((_, i) => i !== idx),
                              }))
                            }
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Thermochemistry Info */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Thông tin nhiệt phản ứng ΔᵣH°₂₉₈ (tùy chọn):</span>
                <input
                  type="text"
                  value={reactionState.enthalpyValue}
                  onChange={(e) => setReactionState((p) => ({ ...p, enthalpyValue: e.target.value }))}
                  placeholder="VD: -92"
                  className="w-28 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
                <select
                  value={reactionState.enthalpyUnit}
                  onChange={(e) =>
                    setReactionState((p) => ({
                      ...p,
                      enthalpyUnit: e.target.value as 'kJ' | 'kJ/mol',
                    }))
                  }
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="kJ">kJ</option>
                  <option value="kJ/mol">kJ/mol</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Nhập cú pháp nhanh hoặc LaTeX/mhchem (hệ số được giữ nguyên tuyệt đối):
              </label>
              <textarea
                rows={2}
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                placeholder="VD: N2(k) + 3H2(k) <=>[xt, t°|p] 2NH3(k)"
                className="w-full p-2.5 font-mono text-sm bg-white border border-slate-300 rounded-xl"
              />
            </div>
          )}

          {/* Live Reaction Preview */}
          <div className="p-3 bg-white border border-teal-300 rounded-xl flex items-center justify-center min-h-[60px] text-lg overflow-x-auto">
            {reactionPreviewHtml ? (
              <span dangerouslySetInnerHTML={{ __html: reactionPreviewHtml }} />
            ) : (
              <span className="text-xs text-slate-400 italic">
                Nhập chất tham gia và sản phẩm để xem trước phương trình...
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                clearEditingNodeHighlight();
                setActivePanel('none');
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl min-h-[38px]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmReactionBuilder}
              disabled={!reactionSourcePreview.trim()}
              className="px-5 py-2 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl disabled:opacity-45 flex items-center gap-1.5 min-h-[38px]"
            >
              <Check className="w-4 h-4" />
              <span>{isEditingExistingNode ? 'Cập nhật công thức' : 'Chèn phương trình'}</span>
            </button>
          </div>
        </div>
      )}

      {/* INLINE ION & CHARGE BUILDER */}
      {activePanel === 'ion-builder' && (
        <div className="p-4 bg-teal-50/50 border-b border-teal-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-teal-950">Chèn Ion &amp; Điện Tích Nhanh</span>
            <button
              type="button"
              onClick={() => setActivePanel('none')}
              className="text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FORMULA_CATEGORIES.find((c) => c.id === 'B')?.items.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => insertAtCaret(buildChemNodeHtml(item.code, 'chem'), true)}
                className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-lg"
                title={`Chèn nhanh ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              value={ionBase}
              onChange={(e) => setIonBase(e.target.value)}
              placeholder="Gốc ion / nguyên tử (VD: SO4, Fe, NH4)"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono w-48"
            />
            <div className="flex items-center gap-1">
              {['+', '-', '2+', '3+', '2-', '3-'].map((chg) => (
                <button
                  key={chg}
                  type="button"
                  onClick={() => setIonCharge(chg)}
                  className={`px-2.5 py-1 font-bold rounded-lg border ${
                    ionCharge === chg
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {chg.replace('-', '−')}
                </button>
              ))}
            </div>
            <div className="px-3 py-1.5 bg-white border border-teal-300 rounded-lg min-w-[90px] text-center text-base">
              {ionPreviewHtml ? <span dangerouslySetInnerHTML={{ __html: ionPreviewHtml }} /> : '...'}
            </div>
            <button
              type="button"
              onClick={handleConfirmIon}
              className="px-4 py-1.5 bg-teal-700 text-white font-bold rounded-lg ml-auto"
            >
              Chèn Ion
            </button>
          </div>
        </div>
      )}

      {/* INLINE REACTION CONDITION ARROW BUILDER */}
      {activePanel === 'reaction-cond' && (
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-emerald-950">
              Chèn Mũi Tên &amp; Điều Kiện Phản Ứng (Trên / Dưới Mũi Tên)
            </span>
            <button
              type="button"
              onClick={() => setActivePanel('none')}
              className="text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs items-center">
            <select
              value={condArrowType}
              onChange={(e) => setCondArrowType(e.target.value as '->' | '<=>')}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
            >
              <option value="->">→ Một chiều</option>
              <option value="<=>">⇌ Thuận nghịch</option>
            </select>
            <input
              type="text"
              value={condAboveInput}
              onChange={(e) => setCondAboveInput(e.target.value)}
              placeholder="Trên mũi tên (VD: t°, xt)"
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              value={condBelowInput}
              onChange={(e) => setCondBelowInput(e.target.value)}
              placeholder="Dưới mũi tên (VD: p, as)"
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
            />
            <div className="p-2 bg-white border border-emerald-300 rounded-lg text-center text-base">
              <span dangerouslySetInnerHTML={{ __html: condPreviewHtml }} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleConfirmConditionArrow}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-lg"
            >
              Chèn mũi tên có điều kiện
            </button>
          </div>
        </div>
      )}

      {/* INLINE LINK / IMAGE / TABLE PANELS */}
      {activePanel === 'link' && (
        <div className="p-3 bg-sky-50/70 border-b border-sky-200 flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Văn bản hiển thị (tùy chọn)..."
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg min-w-[180px]"
          />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg min-w-[200px]"
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="px-3.5 py-1.5 bg-sky-700 text-white font-bold rounded-lg"
          >
            Chèn liên kết
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('none')}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg"
          >
            Hủy
          </button>
        </div>
      )}

      {activePanel === 'image' && (
        <div className="p-3 bg-sky-50/70 border-b border-sky-200 flex flex-wrap items-center gap-2 text-xs">
          <label className="px-3.5 py-1.5 bg-teal-700 text-white font-bold rounded-lg cursor-pointer">
            Tải ảnh từ máy
            <input type="file" accept="image/*" onChange={handleUploadImageFile} className="hidden" />
          </label>
          <span className="text-slate-500 font-semibold">hoặc</span>
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Dán đường dẫn ảnh URL..."
            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg min-w-[200px]"
          />
          <button
            type="button"
            onClick={() => handleInsertImageUrl(imageUrlInput)}
            className="px-3.5 py-1.5 bg-sky-700 text-white font-bold rounded-lg"
          >
            Chèn ảnh
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('none')}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg"
          >
            Hủy
          </button>
        </div>
      )}

      {activePanel === 'table' && (
        <div className="p-3 bg-sky-50/70 border-b border-sky-200 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-700">Chèn bảng số liệu thí nghiệm:</span>
          <label className="flex items-center gap-1.5 font-bold">
            Số hàng:
            <input
              type="number"
              min={1}
              max={10}
              value={tableRows}
              onChange={(e) => setTableRows(Number(e.target.value) || 2)}
              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center"
            />
          </label>
          <label className="flex items-center gap-1.5 font-bold">
            Số cột:
            <input
              type="number"
              min={1}
              max={8}
              value={tableCols}
              onChange={(e) => setTableCols(Number(e.target.value) || 2)}
              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center"
            />
          </label>
          <button
            type="button"
            onClick={handleInsertTable}
            className="px-3.5 py-1.5 bg-teal-700 text-white font-bold rounded-lg"
          >
            Chèn bảng
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('none')}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg"
          >
            Hủy
          </button>
        </div>
      )}

      {/* INLINE CHEMISTRY FORMULA PANEL ("CT Hóa" or click-to-edit existing formula) */}
      {activePanel === 'formula' && (
        <div className="p-4 bg-teal-50/50 border-b border-teal-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-black text-teal-900">
              {isEditingExistingNode ? 'Chỉnh Sửa Công Thức Đã Chọn' : 'Chèn Công Thức Hóa Học'}
            </span>

            <div className="flex items-center gap-1.5 text-xs">
              {(['chem', 'reaction', 'organic', 'math'] as FormulaNodeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormulaMode(m)}
                  className={`px-2.5 py-1 rounded-lg font-bold border ${
                    formulaMode === m
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {m === 'chem'
                    ? 'Chất & Ion'
                    : m === 'reaction'
                    ? 'Phương trình'
                    : m === 'organic'
                    ? 'Hữu cơ'
                    : 'Tính toán Hóa học'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1">Mẫu nhanh:</span>
            {QUICK_SAMPLE_CHEMICALS.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setFormulaInput((prev) => (prev ? `${prev} ${item.code}` : item.code))}
                title={item.description}
                className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-teal-100 border border-slate-300 text-slate-800 rounded-lg"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 7 Category Tabs */}
          <div className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex flex-wrap gap-1">
              {FORMULA_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeCategoryData.items.map((item, idx) => (
                <button
                  key={`${activeCategoryData.id}_${idx}`}
                  type="button"
                  onClick={() => {
                    const needsSpace =
                      formulaInput &&
                      !formulaInput.endsWith(' ') &&
                      !item.code.startsWith(' ') &&
                      !item.code.startsWith('(') &&
                      !item.code.startsWith('^') &&
                      !item.code.startsWith('-');
                    setFormulaInput((prev) =>
                      prev ? `${prev}${needsSpace ? ' ' : ''}${item.code}` : item.code
                    );
                  }}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-800 rounded-lg"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Nhập công thức (VD: H2SO4, SO4^2-, HNO3 -&gt; H+ + NO3-, CH3-CH(OH)-COOH):
              </label>
              <textarea
                rows={2}
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleConfirmFormula();
                  }
                }}
                placeholder="VD: H2SO4 hoặc SO4^2-"
                className="w-full p-2.5 font-mono text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-teal-900 block">
                Xem trước công thức trực tiếp:
              </label>
              <div className="min-h-[68px] p-3 bg-white border border-teal-300 rounded-xl flex items-center justify-center text-lg text-slate-900 overflow-x-auto">
                {livePreviewHtml ? (
                  <span dangerouslySetInnerHTML={{ __html: livePreviewHtml }} />
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Xem trước công thức sẽ hiển thị tại đây...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                clearEditingNodeHighlight();
                setActivePanel('none');
                setFormulaInput('');
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl flex items-center gap-1 min-h-[38px]"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmFormula}
              disabled={!formulaInput.trim()}
              className="px-5 py-2 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl disabled:opacity-45 flex items-center gap-1.5 min-h-[38px]"
            >
              <Check className="w-4 h-4" />
              <span>{isEditingExistingNode ? 'Cập nhật công thức' : 'Chèn công thức'}</span>
            </button>
          </div>
        </div>
      )}

      {/* INLINE 2D ORGANIC STRUCTURE PANEL */}
      {activePanel === 'organic2d' && (
        <div className="p-3 bg-teal-50/30 border-b border-teal-200">
          <OrganicStructure2DEditor
            initialGraph={editingOrganicGraph}
            initialLabel={editingOrganicLabel}
            isEditingExisting={isEditingExistingNode}
            onConfirm={handleConfirmOrganic2D}
            onCancel={() => {
              clearEditingNodeHighlight();
              setActivePanel('none');
            }}
          />
        </div>
      )}

      {/* WYSIWYG Editable Rich Surface */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            saveSelection();
            emitChange(true);
          }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onClick={handleEditorClick}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
              e.preventDefault();
              handleUndo();
            } else if (
              ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
              ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
            ) {
              e.preventDefault();
              handleRedo();
            }
          }}
          style={{ minHeight: `${minHeight}px` }}
          className="smart-chem-surface p-4 text-base text-slate-800 leading-relaxed focus:outline-none focus:bg-white bg-white overflow-y-auto"
          data-placeholder={placeholder}
        />
        {!value && (
          <div className="pointer-events-none absolute top-4 left-4 text-sm text-slate-400">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};
