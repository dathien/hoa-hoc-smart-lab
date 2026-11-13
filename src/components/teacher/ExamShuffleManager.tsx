import React, { useEffect, useMemo, useState } from 'react';
import { useChemStore } from '../../services/store';
import { ExamVariant, Question } from '../../types/chem';
import {
  QUESTION_TYPE_LABELS,
  buildShuffledVariants,
  getVariantOptionsForQuestion,
  resolveExamQuestion,
} from '../../utils/examUtils';
import { richHtmlToPlainText } from '../../utils/chemSyntax';
import { ChemFormula } from '../common/ChemFormula';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
  RefreshCw,
  Save,
  Shuffle,
  Unlock,
} from 'lucide-react';

interface ExamShuffleManagerProps {
  initialExamId?: string;
  onGoToAnswers?: (examId: string) => void;
  onGoToExport?: (examId: string) => void;
}

export const ExamShuffleManager: React.FC<ExamShuffleManagerProps> = ({
  initialExamId,
  onGoToAnswers,
  onGoToExport,
}) => {
  const { exams, questions, updateExam } = useChemStore();

  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || exams[0]?.id || '');
  const selectedExam = useMemo(
    () => exams.find((e) => e.id === selectedExamId) || exams[0],
    [exams, selectedExamId]
  );

  useEffect(() => {
    if (initialExamId) setSelectedExamId(initialExamId);
  }, [initialExamId]);

  const [variantCount, setVariantCount] = useState<number>(selectedExam?.variantCount || selectedExam?.variants?.length || 4);
  const [variantRule, setVariantRule] = useState<'101_SERIES' | '201_SERIES' | 'CUSTOM'>(
    selectedExam?.variantRule || '101_SERIES'
  );
  const [customPrefix, setCustomPrefix] = useState<string>(selectedExam?.variantPrefix || 'M');
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    selectedExam?.shuffleQuestions ?? true
  );
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(
    selectedExam?.shuffleOptions ?? true
  );
  const [shuffleTfStatements, setShuffleTfStatements] = useState<boolean>(
    selectedExam?.shuffleTfStatements ?? false
  );
  const [lockedQuestionIds, setLockedQuestionIds] = useState<string[]>(
    selectedExam?.lockedQuestionIds || []
  );
  const [previewVariants, setPreviewVariants] = useState<ExamVariant[]>(
    selectedExam?.variants || []
  );
  const [activeCode, setActiveCode] = useState<string>(
    selectedExam?.variants?.[0]?.code || '101'
  );
  const [viewMode, setViewMode] = useState<'paper' | 'mapping'>('paper');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Sync state when switching exam
  useEffect(() => {
    if (selectedExam) {
      setVariantCount(selectedExam.variantCount || selectedExam.variants?.length || 4);
      setVariantRule(selectedExam.variantRule || '101_SERIES');
      setCustomPrefix(selectedExam.variantPrefix || 'M');
      setShuffleQuestions(selectedExam.shuffleQuestions ?? true);
      setShuffleOptions(selectedExam.shuffleOptions ?? true);
      setShuffleTfStatements(selectedExam.shuffleTfStatements ?? false);
      setLockedQuestionIds(selectedExam.lockedQuestionIds || []);
      setPreviewVariants(selectedExam.variants || []);
      setActiveCode(selectedExam.variants?.[0]?.code || '101');
    }
  }, [selectedExam?.id]);

  const qMap = useMemo(() => {
    const rawMap: Record<string, Question> = {};
    questions.forEach((q) => (rawMap[q.id] = q));
    if (!selectedExam?.questionOverrides) return rawMap;
    const merged: Record<string, Question> = { ...rawMap };
    Object.keys(selectedExam.questionOverrides).forEach((qId) => {
      const resolved = resolveExamQuestion(selectedExam, qId, rawMap);
      if (resolved) merged[qId] = resolved;
    });
    return merged;
  }, [questions, selectedExam]);

  if (!selectedExam) {
    return (
      <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold">
        Chưa có đề kiểm tra nào. Hãy tạo đề ở tab &quot;Tạo đề mới&quot; trước.
      </div>
    );
  }

  const handleToggleLockQuestion = (qId: string) => {
    setLockedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleGenerateVariants = (seedOffset = Date.now() % 10000) => {
    const nextVariants = buildShuffledVariants(selectedExam.questionIds, qMap, {
      count: variantCount,
      rule: variantRule,
      customPrefix,
      shuffleQuestions,
      shuffleOptions,
      shuffleTfStatements,
      lockedQuestionIds,
      lockedGroups: selectedExam.lockedGroups,
      seedOffset,
    });
    setPreviewVariants(nextVariants);
    setActiveCode(nextVariants[0]?.code || '101');
    setSaveMsg(
      `Đã tạo ${nextVariants.length} mã đề (${nextVariants.map((v) => v.code).join(', ')}). Nhấn "Lưu Bộ Mã Đề" để áp dụng!`
    );
  };

  const handleSaveVariants = () => {
    if (selectedExam.isLockedVersion) {
      setSaveMsg('Đề này đang bị KHÓA PHIÊN BẢN ở tab Đáp án. Hãy mở khóa trước nếu muốn ghi đè mã đề.');
      return;
    }
    updateExam(selectedExam.id, {
      variantCount,
      variantRule,
      variantPrefix: customPrefix,
      shuffleQuestions,
      shuffleOptions,
      shuffleTfStatements,
      lockedQuestionIds,
      variants: previewVariants,
      needsResync: false,
    });
    setSaveMsg('Đã lưu toàn bộ mã đề trộn, đáp án mới & bản đồ ánh xạ câu hỏi!');
    setTimeout(() => setSaveMsg(null), 3500);
  };

  const activeVariant =
    previewVariants.find((v) => v.code === activeCode) || previewVariants[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <Shuffle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Trộn Đề, Sinh Mã Đề & Ánh Xạ Đáp Án Tự Động
            </h2>
            <p className="text-sm text-slate-500">
              Trộn câu theo từng phần, trộn phương án A/B/C/D (tự cập nhật đáp án mới), giữ nguyên thứ tự ý Đúng/Sai mặc định và khóa câu phụ thuộc.
            </p>
          </div>
        </div>

        <select
          value={selectedExam.id}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="px-3.5 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl min-h-[44px] max-w-md"
        >
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              [Khối {ex.grade}] {ex.title} ({ex.variants?.length || 0} mã đề)
            </option>
          ))}
        </select>
      </div>

      {selectedExam.needsResync && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-amber-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Ngân hàng câu hỏi có cập nhật sau lần trộn trước. Hãy bấm &quot;Trộn & Sinh Mã Đề&quot; rồi Lưu để đồng bộ đáp án mới.
            </span>
          </div>
        </div>
      )}

      {saveMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-sm font-bold text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT CONFIG & LOCK PANEL */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs font-bold text-slate-700">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b border-slate-100 pb-2">
              1. Cấu Hình Sinh Mã Đề
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Số lượng mã đề:</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={variantCount}
                  onChange={(e) => setVariantCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-black"
                />
              </div>

              <div>
                <label className="block mb-1">Quy tắc mã đề:</label>
                <select
                  value={variantRule}
                  onChange={(e) => setVariantRule(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="101_SERIES">101, 102, 103...</option>
                  <option value="201_SERIES">201, 202, 203...</option>
                  <option value="CUSTOM">Tiền tố tự chọn</option>
                </select>
              </div>
            </div>

            {variantRule === 'CUSTOM' && (
              <div>
                <label className="block mb-1">Tiền tố mã đề (VD: HOA → HOA01):</label>
                <input
                  type="text"
                  value={customPrefix}
                  onChange={(e) => setCustomPrefix(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono"
                />
              </div>
            )}

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span>Trộn thứ tự câu hỏi trong từng phần</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span>Trộn phương án A, B, C, D (tự tính đáp án mới)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={shuffleTfStatements}
                  onChange={(e) => setShuffleTfStatements(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span>Trộn thứ tự ý a, b, c, d trong câu Đúng/Sai (mặc định giữ nguyên)</span>
              </label>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleGenerateVariants()}
                className="w-full py-3 px-4 text-sm font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" />
                <span>Trộn & Sinh {variantCount} Mã Đề</span>
              </button>

              <button
                type="button"
                onClick={handleSaveVariants}
                disabled={previewVariants.length === 0}
                className="w-full py-2.5 px-4 text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-40"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Bộ Mã Đề & Ánh Xạ Đáp Án</span>
              </button>
            </div>
          </div>

          {/* Lock Questions Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b border-slate-100 pb-2">
              2. Khóa Câu / Nhóm Không Trộn ({lockedQuestionIds.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Bấm biểu tượng khóa để giữ cố định vị trí và phương án của câu hỏi (ví dụ câu có &quot;tất cả đều đúng&quot; hoặc câu thí nghiệm đầu phần).
            </p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {selectedExam.questionIds.map((qId, idx) => {
                const q = qMap[qId];
                if (!q) return null;
                const isLocked = lockedQuestionIds.includes(qId);
                return (
                  <div
                    key={qId}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                      isLocked
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <strong>Câu {idx + 1}:</strong> {richHtmlToPlainText(q.content).slice(0, 55)}...
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleLockQuestion(qId)}
                      className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 shrink-0 ${
                        isLocked ? 'bg-amber-600 text-white' : 'bg-white border border-slate-300'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{isLocked ? 'Đã khóa' : 'Khóa'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW: VARIANT PAPER OR MAPPING TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              {/* Variant code pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {previewVariants.map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => setActiveCode(v.code)}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all ${
                      activeCode === v.code
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    Mã {v.code}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('paper')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                    viewMode === 'paper'
                      ? 'bg-teal-50 text-teal-900 border-teal-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Xem đề mã {activeCode}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('mapping')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                    viewMode === 'mapping'
                      ? 'bg-teal-50 text-teal-900 border-teal-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Bảng ánh xạ Câu gốc ↔ Mã {activeCode}
                </button>
              </div>
            </div>

            {!activeVariant ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                Chưa có mã đề. Nhấn &quot;Trộn & Sinh Mã Đề&quot; ở cột bên trái.
              </div>
            ) : viewMode === 'mapping' ? (
              /* MAPPING TABLE: ORIGINAL QUESTION -> SHUFFLED QUESTION + OLD ANSWER -> NEW ANSWER */
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="p-2.5 border border-slate-300 text-center">Vị trí mới (Mã {activeVariant.code})</th>
                      <th className="p-2.5 border border-slate-300 text-center">Vị trí đề gốc</th>
                      <th className="p-2.5 border border-slate-300 text-left">Dạng câu & Nội dung tóm tắt</th>
                      <th className="p-2.5 border border-slate-300 text-center">Đáp án đề gốc</th>
                      <th className="p-2.5 border border-slate-300 text-center bg-teal-50 text-teal-900">
                        Đáp án mới (Mã {activeVariant.code})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVariant.questionIds.map((qId, newIdx) => {
                      const q = qMap[qId];
                      if (!q) return null;
                      const origIdx = selectedExam.questionIds.indexOf(qId) + 1;
                      const origAns =
                        q.type === 'MCQ'
                          ? q.options?.find((o) => o.isCorrect)?.id || 'A'
                          : q.type === 'SHORT_ANSWER'
                          ? q.correctAnswer || ''
                          : q.type === 'MULTIPLE_TRUE_FALSE'
                          ? (q.tfStatements || [])
                              .map((s, i) => `${['a', 'b', 'c', 'd'][i]}:${s.isCorrect ? 'Đ' : 'S'}`)
                              .join(' ')
                          : 'Rubric';

                      const newKeyRaw = activeVariant.answerKey[qId];
                      const newAns =
                        typeof newKeyRaw === 'string'
                          ? newKeyRaw
                          : typeof newKeyRaw === 'object' && newKeyRaw
                          ? (activeVariant.tfOrderPermutations?.[qId] || (q.tfStatements || []).map((s) => s.id))
                              .map((sid, i) => `${['a', 'b', 'c', 'd'][i]}:${newKeyRaw[sid] ? 'Đ' : 'S'}`)
                              .join(' ')
                          : origAns;

                      return (
                        <tr key={qId} className="hover:bg-slate-50">
                          <td className="p-2.5 border border-slate-300 text-center font-black text-teal-800">
                            Câu {newIdx + 1}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-600">
                            Câu gốc #{origIdx}
                          </td>
                          <td className="p-2.5 border border-slate-300">
                            <span className="font-bold text-slate-800 block">
                              {QUESTION_TYPE_LABELS[q.type]}
                            </span>
                            <span className="text-slate-500 line-clamp-1">{richHtmlToPlainText(q.content)}</span>
                          </td>
                          <td className="p-2.5 border border-slate-300 text-center font-mono font-bold">
                            {origAns}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-center font-mono font-black text-teal-900 bg-teal-50/40">
                            {newAns}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* VARIANT PAPER PREVIEW */
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {activeVariant.questionIds.map((qId, idx) => {
                  const q = qMap[qId];
                  if (!q) return null;
                  const opts = getVariantOptionsForQuestion(q, activeVariant);
                  const newAns = activeVariant.answerKey[qId];
                  return (
                    <div
                      key={qId}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-teal-900">
                          Câu {idx + 1} ({selectedExam.questionScores?.[qId] ?? q.maxScore} đ)
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Gốc #{selectedExam.questionIds.indexOf(qId) + 1} · {QUESTION_TYPE_LABELS[q.type]}
                        </span>
                      </div>
                      <div className="text-sm text-slate-800 font-medium">
                        <ChemFormula formula={q.content} />
                      </div>
                      {q.type === 'MCQ' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {opts.map((o) => (
                            <div
                              key={o.displayLetter}
                              className={`p-2 rounded-lg border flex items-center justify-between ${
                                newAns === o.displayLetter
                                  ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span>
                                <strong>{o.displayLetter}.</strong> <ChemFormula formula={o.content} />
                              </span>
                              {newAns === o.displayLetter && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-end gap-2">
              {onGoToAnswers && (
                <button
                  type="button"
                  onClick={() => onGoToAnswers(selectedExam.id)}
                  className="px-4 py-2 text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 rounded-xl flex items-center gap-1.5"
                >
                  <span>Sang Đáp án & Hướng dẫn chấm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onGoToExport && (
                <button
                  type="button"
                  onClick={() => onGoToExport(selectedExam.id)}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl"
                >
                  Xuất Word / In PDF các mã đề
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
