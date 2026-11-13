import React, { useMemo, useState } from 'react';
import { Exam, ExamMatrix, Question, QuestionType } from '../../types/chem';
import {
  calculateExamMaxScore,
  getVariantOptionsForQuestion,
  resolveExamQuestion,
} from '../../utils/examUtils';
import { exportExamSuiteToDocx } from '../../utils/docxExportUtils';
import { ChemFormula } from '../common/ChemFormula';
import { CheckCircle2, Download, Printer, X } from 'lucide-react';

interface ExamExportModalProps {
  exam: Exam;
  matrix?: ExamMatrix;
  questions: Question[];
  onClose: () => void;
}

export const ExamExportModal: React.FC<ExamExportModalProps> = ({
  exam,
  matrix,
  questions,
  onClose,
}) => {
  const [departmentTitle, setDepartmentTitle] = useState<string>(
    'SỞ GIÁO DỤC VÀ ĐÀO TẠO TP. HỒ CHÍ MINH'
  );
  const [schoolName, setSchoolName] = useState<string>(
    exam.schoolName || 'TRƯỜNG THPT VÕ TRƯỜNG TOẢN'
  );
  const [teamName, setTeamName] = useState<string>(exam.departmentName || 'TỔ HÓA HỌC');
  const [academicYear, setAcademicYear] = useState<string>(
    exam.schoolYear || exam.academicYear || '2026 - 2027'
  );
  const [subjectName, setSubjectName] = useState<string>(exam.subjectName || 'HÓA HỌC');

  const availableCodes = useMemo(
    () =>
      exam.variants && exam.variants.length > 0
        ? exam.variants.map((v) => v.code)
        : ['101'],
    [exam.variants]
  );

  const [selectedVariantCodes, setSelectedVariantCodes] = useState<string[]>(availableCodes);
  const [previewCode, setPreviewCode] = useState<string>(availableCodes[0] || '101');

  const [includeOriginalPaper, setIncludeOriginalPaper] = useState<boolean>(true);
  const [includeVariantsPaper, setIncludeVariantsPaper] = useState<boolean>(true);
  const [includeMatrix, setIncludeMatrix] = useState<boolean>(Boolean(matrix));
  const [includeSpec, setIncludeSpec] = useState<boolean>(Boolean(matrix));
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [includeRubric, setIncludeRubric] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportDoneMsg, setExportDoneMsg] = useState<string | null>(null);

  const qMap = useMemo(() => {
    const rawMap: Record<string, Question> = {};
    questions.forEach((q) => (rawMap[q.id] = q));
    if (!exam.questionOverrides) return rawMap;
    const merged: Record<string, Question> = { ...rawMap };
    Object.keys(exam.questionOverrides).forEach((qId) => {
      const resolved = resolveExamQuestion(exam, qId, rawMap);
      if (resolved) merged[qId] = resolved;
    });
    return merged;
  }, [questions, exam]);

  const previewVariant =
    exam.variants?.find((v) => v.code === previewCode) || exam.variants?.[0];
  const previewQuestionIds = previewVariant ? previewVariant.questionIds : exam.questionIds;
  const previewQuestions = previewQuestionIds.map((id) => qMap[id]).filter(Boolean);

  const partDefinitions: { type: QuestionType; label: string }[] = [
    { type: 'MCQ', label: 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.' },
    { type: 'MULTIPLE_TRUE_FALSE', label: 'PHẦN II. Câu trắc nghiệm đúng sai.' },
    { type: 'SHORT_ANSWER', label: 'PHẦN III. Câu trắc nghiệm yêu cầu trả lời ngắn.' },
    { type: 'ESSAY', label: 'PHẦN IV. Tự luận.' },
  ];

  const handleToggleCode = (code: string) => {
    setSelectedVariantCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleExportRealDocx = async () => {
    setIsExporting(true);
    setExportDoneMsg(null);
    try {
      await exportExamSuiteToDocx({
        exam,
        matrix,
        questions,
        departmentTitle,
        schoolName,
        teamName,
        academicYear,
        subjectName,
        selectedVariantCodes:
          selectedVariantCodes.length > 0 ? selectedVariantCodes : availableCodes,
        includeOriginalPaper,
        includeVariantsPaper,
        includeMatrix,
        includeSpec,
        includeAnswerKey,
        includeRubric,
      });
      setExportDoneMsg(
        'Đã tạo và tải xuống tệp Word (.docx) chuẩn OMML kèm công thức hóa học, bảng biểu và hình sơ đồ!'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintA4 = () => {
    const printEl = document.getElementById('a4-exam-print-sheet');
    if (!printEl) {
      window.print();
      return;
    }

    const existingFrame = document.getElementById('chem-print-iframe') as HTMLIFrameElement | null;
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'chem-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const collectedStyles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${exam.title} - Mã đề ${previewCode}</title>
          ${collectedStyles}
          <style>
            @page { size: A4; margin: 16mm; }
            body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.45; color: #111; background: #fff; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #333; padding: 5px 8px; font-size: 11.5pt; }
            .no-border td { border: none; }
            .q-block { margin-bottom: 10px; page-break-inside: avoid; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-top: 4px; padding-left: 16px; }
            .chem-formula-node { background: transparent !important; border: none !important; padding: 0 !important; }
            .katex, .katex-display { overflow: visible !important; }
          </style>
        </head>
        <body>${printEl.innerHTML}</body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 1500);
    }, 350);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                Xuất Đề Kiểm Tra Word (.docx Chuẩn Công Thức OMML) & In PDF A4
              </h3>
              <p className="text-xs text-slate-500">
                Xuất ma trận, bản đặc tả, đề gốc, từng mã đề trộn, đáp án từng mã đề & rubric tự luận. Tự động ẩn phần có 0 câu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {exportDoneMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportDoneMsg}</span>
            </div>
          )}

          {/* Header Metadata */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Cơ quan chủ quản:</label>
              <input
                type="text"
                value={departmentTitle}
                onChange={(e) => setDepartmentTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1">Trường THPT:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1">Tổ chuyên môn:</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1">Năm học:</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1">Môn học:</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Export Options */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs font-bold text-slate-700">
            <div>
              <span className="uppercase text-slate-500 block mb-2">
                1. Chọn thành phần đóng gói vào tệp Word (.docx):
              </span>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMatrix}
                    disabled={!matrix}
                    onChange={(e) => setIncludeMatrix(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Khung Ma trận {!matrix && '(Chưa gắn)'}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSpec}
                    disabled={!matrix}
                    onChange={(e) => setIncludeSpec(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Bản đặc tả</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOriginalPaper}
                    onChange={(e) => setIncludeOriginalPaper(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Đề gốc</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVariantsPaper}
                    onChange={(e) => setIncludeVariantsPaper(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Các mã đề trộn</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Đáp án từng mã đề</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRubric}
                    onChange={(e) => setIncludeRubric(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Hướng dẫn chấm Tự luận</span>
                </label>
              </div>
            </div>

            <div>
              <span className="uppercase text-slate-500 block mb-2">
                2. Chọn các mã đề xuất ra & xem trước bản in A4:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {availableCodes.map((code) => (
                  <label
                    key={code}
                    className={`px-3 py-1.5 rounded-xl border cursor-pointer flex items-center gap-1.5 ${
                      selectedVariantCodes.includes(code)
                        ? 'bg-teal-50 border-teal-400 text-teal-900'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedVariantCodes.includes(code)}
                      onChange={() => handleToggleCode(code)}
                      className="w-3.5 h-3.5 text-teal-600"
                    />
                    <span>Mã {code}</span>
                  </label>
                ))}

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-slate-500">Xem trước A4:</span>
                  <select
                    value={previewCode}
                    onChange={(e) => setPreviewCode(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                  >
                    {availableCodes.map((c) => (
                      <option key={c} value={c}>
                        Mã đề {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* A4 Print Preview Sheet */}
          <div className="bg-slate-200/70 p-6 rounded-2xl border border-slate-300 overflow-x-auto">
            <div
              id="a4-exam-print-sheet"
              className="bg-white p-8 max-w-3xl mx-auto shadow-md border border-slate-300 text-slate-900 font-serif space-y-4"
            >
              <table className="w-full no-border" style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ border: 'none', textAlign: 'center', width: '50%' }}>
                      <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                        {departmentTitle.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                        {schoolName.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '10.5pt', fontStyle: 'italic' }}>{teamName}</div>
                    </td>
                    <td style={{ border: 'none', textAlign: 'center', width: '50%' }}>
                      <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                        ĐỀ KIỂM TRA CHÍNH THỨC
                      </div>
                      <div style={{ fontSize: '11pt' }}>Năm học: {academicYear}</div>
                      <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#0f766e' }}>
                        MÃ ĐỀ: {previewCode}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="text-center border-b border-slate-800 pb-3">
                <h4 className="font-bold text-base uppercase">{exam.title}</h4>
                <p className="text-xs italic">
                  Môn: {subjectName} – Khối {exam.grade} – Thời gian: {exam.durationMinutes} phút (Tổng điểm:{' '}
                  {calculateExamMaxScore(exam, qMap)} đ)
                </p>
              </div>

              {/* Render ONLY sections that have > 0 questions */}
              {(() => {
                let globalNum = 1;
                return partDefinitions.map((part) => {
                  const pQs = previewQuestions.filter((q) => q.type === part.type);
                  if (pQs.length === 0) return null;
                  return (
                    <div key={part.type} className="space-y-3 pt-2">
                      <div className="font-bold text-sm uppercase">{part.label}</div>
                      {pQs.map((q) => {
                        const qIndex = globalNum++;
                        const qScore = exam.questionScores?.[q.id] ?? q.maxScore;
                        const opts = getVariantOptionsForQuestion(q, previewVariant);
                        const permTf =
                          previewVariant?.tfOrderPermutations?.[q.id] ||
                          (q.tfStatements || []).map((s) => s.id);
                        return (
                          <div key={q.id} className="q-block space-y-1.5 text-sm">
                            <div>
                              <strong>
                                Câu {qIndex} ({qScore} đ):
                              </strong>{' '}
                              <ChemFormula formula={q.content} />
                            </div>
                            {q.diagramSvg && (
                              <div
                                className="max-w-xs py-1"
                                dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                              />
                            )}
                            {q.type === 'MCQ' && (
                              <div className="grid-2 grid grid-cols-2 gap-x-6 gap-y-1 pl-4 text-xs">
                                {opts.map((o) => (
                                  <div key={o.displayLetter}>
                                    <strong>{o.displayLetter}.</strong>{' '}
                                    <ChemFormula formula={o.content} />
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.type === 'MULTIPLE_TRUE_FALSE' && q.tfStatements && (
                              <div className="pl-4 space-y-1 text-xs">
                                {permTf.map((sid, sIdx) => {
                                  const st = q.tfStatements!.find((s) => s.id === sid);
                                  if (!st) return null;
                                  return (
                                    <div key={sid}>
                                      <strong>{['a)', 'b)', 'c)', 'd)'][sIdx]}</strong>{' '}
                                      <ChemFormula formula={st.statement} />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {q.type === 'SHORT_ANSWER' && (
                              <div className="pl-4 text-xs italic text-slate-600">
                                Đáp số: ...........................................
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl min-h-[44px]"
          >
            Đóng
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportRealDocx}
              className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 min-h-[44px]"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>{isExporting ? 'Đang tạo DOCX...' : 'Tải Word Chuẩn (.docx)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintA4}
              className="px-5 py-2.5 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-1.5 min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>In Đề A4 / Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
