import React, { useEffect, useMemo, useState } from 'react';
import { useChemStore } from '../../services/store';
import { Exam, ExamVariant, Question } from '../../types/chem';
import {
  DEFAULT_TF_SCORING_RULE,
  QUESTION_TYPE_LABELS,
  calculateExamMaxScore,
  resolveExamQuestion,
} from '../../utils/examUtils';
import { ChemFormula } from '../common/ChemFormula';
import { SmartChemEditor } from '../common/SmartChemEditor';
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  FileText,
  Layers,
  Lock,
  Printer,
  RefreshCw,
  Save,
  ShieldCheck,
  Unlock,
} from 'lucide-react';

interface ExamRubricAnswersProps {
  initialExamId?: string;
  onResyncInShuffleTab?: (examId: string) => void;
  onOpenExportModal?: (exam: Exam) => void;
}

export const ExamRubricAnswers: React.FC<ExamRubricAnswersProps> = ({
  initialExamId,
  onResyncInShuffleTab,
  onOpenExportModal,
}) => {
  const { exams, questions, updateExam, updateQuestion } = useChemStore();

  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || exams[0]?.id || '');
  const selectedExam = useMemo(
    () => exams.find((e) => e.id === selectedExamId) || exams[0],
    [exams, selectedExamId]
  );

  useEffect(() => {
    if (initialExamId) setSelectedExamId(initialExamId);
  }, [initialExamId]);

  const variants: ExamVariant[] = useMemo(() => {
    if (!selectedExam) return [];
    if (selectedExam.variants && selectedExam.variants.length > 0) {
      return selectedExam.variants;
    }
    return [
      {
        code: 'GỐC',
        questionIds: selectedExam.questionIds,
        answerKey: {},
      },
    ];
  }, [selectedExam]);

  const [selectedCode, setSelectedCode] = useState<string>(variants[0]?.code || '101');
  const [activeTab, setActiveTab] = useState<'matrix_answers' | 'essay_rubrics'>('matrix_answers');
  const [editingRubricQId, setEditingRubricQId] = useState<string | null>(null);
  const [rubricDraftHtml, setRubricDraftHtml] = useState<string>('');
  const [solutionDraftHtml, setSolutionDraftHtml] = useState<string>('');

  useEffect(() => {
    if (variants[0] && !variants.some((v) => v.code === selectedCode)) {
      setSelectedCode(variants[0].code);
    }
  }, [variants, selectedCode]);

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
        Chưa có đề kiểm tra nào.
      </div>
    );
  }

  const activeVariant = variants.find((v) => v.code === selectedCode) || variants[0];
  const orderedQuestions = (activeVariant?.questionIds || selectedExam.questionIds)
    .map((id) => qMap[id])
    .filter(Boolean);

  const mcqQuestions = orderedQuestions.filter((q) => q.type === 'MCQ');
  const tfQuestions = orderedQuestions.filter((q) => q.type === 'MULTIPLE_TRUE_FALSE');
  const shortQuestions = orderedQuestions.filter((q) => q.type === 'SHORT_ANSWER');
  const essayQuestions = orderedQuestions.filter((q) => q.type === 'ESSAY');

  const calculatedTotalScore = calculateExamMaxScore(selectedExam, qMap);
  const tfRule = selectedExam.tfScoringRule || DEFAULT_TF_SCORING_RULE;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Đáp Án Theo Từng Mã Đề & Hướng Dẫn Chấm (Rubric)
            </h2>
            <p className="text-sm text-slate-500">
              Hiển thị chính xác đáp án từng mã đề sau trộn, quy tắc chấm Đúng/Sai nhiều ý và khóa phiên bản đề chính thức.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedExam.id}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 text-xs md:text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl min-h-[44px] max-w-sm"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                [K{ex.grade}] {ex.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              updateExam(selectedExam.id, {
                status: selectedExam.status === 'APPROVED' ? 'DRAFT' : 'APPROVED',
              })
            }
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border min-h-[44px] flex items-center gap-1.5 ${
              selectedExam.status === 'APPROVED' || selectedExam.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-teal-700 text-white border-teal-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {selectedExam.status === 'APPROVED' || selectedExam.status === 'ACTIVE'
                ? 'Đã duyệt đề'
                : 'Duyệt đề kiểm tra'}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              updateExam(selectedExam.id, {
                isLockedVersion: !selectedExam.isLockedVersion,
              })
            }
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border min-h-[44px] flex items-center gap-1.5 ${
              selectedExam.isLockedVersion
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {selectedExam.isLockedVersion ? (
              <>
                <Lock className="w-4 h-4" /> <span>Đang khóa phiên bản</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" /> <span>Khóa phiên bản</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenExportModal ? onOpenExportModal(selectedExam) : window.print()
            }
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Xuất / In Đáp án</span>
          </button>
        </div>
      </div>

      {/* Resync Warning if a question was modified after shuffling */}
      {selectedExam.needsResync && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-rose-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              Cảnh báo: Có câu hỏi trong ngân hàng vừa được chỉnh sửa sau khi đề này sinh mã đề. Vui lòng đồng bộ lại ở tab Trộn đề để đảm bảo đáp án chuẩn!
            </span>
          </div>
          {onResyncInShuffleTab && (
            <button
              type="button"
              onClick={() => onResyncInShuffleTab(selectedExam.id)}
              className="px-3.5 py-2 bg-rose-700 text-white rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đồng bộ lại mã đề ngay</span>
            </button>
          )}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('matrix_answers')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 min-h-[44px] ${
            activeTab === 'matrix_answers'
              ? 'bg-teal-700 text-white'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bảng đáp án theo mã đề ({variants.map((v) => v.code).join(', ')})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('essay_rubrics')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 min-h-[44px] ${
            activeTab === 'essay_rubrics'
              ? 'bg-teal-700 text-white'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Hướng dẫn chấm Tự luận chi tiết ({essayQuestions.length} câu)</span>
        </button>
      </div>

      {/* Total Score Summary */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-950">
        <span>
          Tổng số câu hiển thị: <strong>{orderedQuestions.length} câu</strong> · Tổng điểm thực tế:{' '}
          <strong>{calculatedTotalScore} điểm</strong> · Quy tắc Đúng/Sai:{' '}
          {tfRule.mode === 'EQUAL_PER_ITEM'
            ? 'Chia đều 1/4 điểm mỗi ý'
            : `${tfRule.pointsFor1} / ${tfRule.pointsFor2} / ${tfRule.pointsFor3} / ${tfRule.pointsFor4} đ`}
        </span>
        <span className="text-slate-600">Trạng thái đề: {selectedExam.status}</span>
      </div>

      {activeTab === 'matrix_answers' && (
        <div className="space-y-5">
          {/* Variant code pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl max-w-fit">
            <span className="text-xs font-bold text-slate-500 px-2">Mã đề:</span>
            {variants.map((v) => (
              <button
                key={v.code}
                type="button"
                onClick={() => setSelectedCode(v.code)}
                className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                  activeVariant?.code === v.code
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-700 bg-white'
                }`}
              >
                Mã {v.code}
              </button>
            ))}
          </div>

          {mcqQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase">
                  Phần I: Trắc nghiệm 4 lựa chọn ({mcqQuestions.length} câu) – Mã {activeVariant?.code}
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  Đáp án đã ánh xạ đúng sau khi trộn phương án A/B/C/D
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {mcqQuestions.map((q, idx) => {
                  const ansLetter =
                    (activeVariant?.answerKey?.[q.id] as string | undefined) ||
                    q.options?.find((o) => o.isCorrect)?.id ||
                    'A';
                  return (
                    <div
                      key={q.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-slate-500">Câu {idx + 1}:</span>
                      <span className="text-base font-black text-teal-800 bg-white w-7 h-7 rounded-lg border border-teal-200 flex items-center justify-center">
                        {ansLetter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tfQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-800 uppercase">
                  Phần II: Trắc nghiệm Đúng / Sai ({tfQuestions.length} câu) – Mã {activeVariant?.code}
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  Đúng 1 ý: {tfRule.pointsFor1}đ · 2 ý: {tfRule.pointsFor2}đ · 3 ý: {tfRule.pointsFor3}đ · 4 ý: {tfRule.pointsFor4}đ
                </span>
              </div>
              <div className="p-4 space-y-3">
                {tfQuestions.map((q, idx) => {
                  const keyObj = activeVariant?.answerKey?.[q.id];
                  const perm =
                    activeVariant?.tfOrderPermutations?.[q.id] ||
                    (q.tfStatements || []).map((s) => s.id);
                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                    >
                      <strong className="text-teal-900 block text-sm">
                        Câu {idx + 1}: <ChemFormula formula={q.content.slice(0, 120)} />
                      </strong>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {perm.map((sid, sIdx) => {
                          const st = q.tfStatements?.find((x) => x.id === sid);
                          if (!st) return null;
                          const val =
                            typeof keyObj === 'object' && keyObj !== null
                              ? Boolean(keyObj[sid])
                              : st.isCorrect;
                          return (
                            <div
                              key={sid}
                              className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
                            >
                              <span className="font-bold text-slate-700">
                                Ý {['a', 'b', 'c', 'd'][sIdx]}:
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded font-black text-xs ${
                                  val
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {val ? 'ĐÚNG' : 'SAI'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {shortQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-800 uppercase">
                  Phần III: Trả lời ngắn ({shortQuestions.length} câu) – Mã {activeVariant?.code}
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {shortQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                  >
                    <span className="font-bold text-slate-600 block">
                      Câu {idx + 1} ({selectedExam.questionScores?.[q.id] ?? q.maxScore} đ):
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Đáp số:</span>
                      <span className="font-mono font-black text-teal-900 bg-white px-3 py-1 rounded border border-teal-200 text-sm">
                        <ChemFormula formula={String(activeVariant?.answerKey?.[q.id] || q.correctAnswer || '')} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'essay_rubrics' && (
        <div className="space-y-4">
          {essayQuestions.length === 0 ? (
            <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center text-sm font-bold text-slate-500">
              Đề thi này không có câu Tự luận (Phần IV = 0 câu).
            </div>
          ) : (
            essayQuestions.map((q, idx) => {
              const steps = selectedExam.essayComponentRubrics?.[q.id] || q.rubricSteps;
              const qScore = selectedExam.questionScores?.[q.id] ?? q.maxScore;
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="px-3 py-1 text-xs font-black rounded-lg bg-teal-100 text-teal-800">
                      Câu Tự Luận {idx + 1} ({qScore} Điểm)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {q.chapter} · {QUESTION_TYPE_LABELS[q.type]}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingRubricQId === q.id) {
                            setEditingRubricQId(null);
                          } else {
                            setEditingRubricQId(q.id);
                            setRubricDraftHtml(q.rubricGuide || '');
                            setSolutionDraftHtml(q.explanation || '');
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-xl flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{editingRubricQId === q.id ? 'Đóng soạn thảo' : 'Soạn Đáp án & Hướng dẫn chấm'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium">
                    <ChemFormula formula={q.content} />
                  </div>

                  {editingRubricQId === q.id && (
                    <div className="p-4 bg-teal-50/30 border border-teal-200 rounded-xl space-y-3">
                      <SmartChemEditor
                        compact
                        minHeight={110}
                        label="Soạn Đáp án & Lời giải chi tiết"
                        value={solutionDraftHtml}
                        onChange={setSolutionDraftHtml}
                        draftKey={`rubric_sol_${q.id}`}
                      />
                      <SmartChemEditor
                        compact
                        minHeight={110}
                        label="Soạn Hướng dẫn chấm & Ghi chú biểu điểm"
                        value={rubricDraftHtml}
                        onChange={setRubricDraftHtml}
                        draftKey={`rubric_guide_${q.id}`}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingRubricQId(null)}
                          className="px-3.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-700"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQ: Question = {
                              ...q,
                              explanation: solutionDraftHtml,
                              rubricGuide: rubricDraftHtml,
                              updatedAt: new Date().toISOString(),
                            };
                            updateExam(selectedExam.id, {
                              questionOverrides: {
                                ...(selectedExam.questionOverrides || {}),
                                [q.id]: updatedQ,
                              },
                            });
                            if (!selectedExam.questionOverrides?.[q.id]) {
                              // Keep bank untouched by default when editing inside an exam
                            } else {
                              void updateQuestion;
                            }
                            try {
                              localStorage.removeItem(`smart_chem_draft_v1_rubric_sol_${q.id}`);
                              localStorage.removeItem(`smart_chem_draft_v1_rubric_guide_${q.id}`);
                            } catch {}
                            setEditingRubricQId(null);
                          }}
                          className="px-4 py-2 text-xs font-black bg-teal-700 text-white rounded-xl flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu đáp án & hướng dẫn chấm</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {steps && steps.length > 0 && (
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-amber-50 text-amber-950">
                          <th className="p-2.5 border border-amber-200 text-left">
                            Nội dung / Bước giải cần đạt
                          </th>
                          <th className="p-2.5 border border-amber-200 text-center w-28">
                            Điểm thành phần
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {steps.map((st) => (
                          <tr key={st.id}>
                            <td className="p-2.5 border border-slate-200">
                              <ChemFormula formula={st.description} />
                            </td>
                            <td className="p-2.5 border border-slate-200 text-center font-black text-teal-800">
                              {st.score} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {q.rubricGuide && (
                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1">
                      <strong className="text-amber-900 block">Hướng dẫn chấm chi tiết:</strong>
                      <ChemFormula formula={q.rubricGuide} isBlock />
                    </div>
                  )}

                  {q.explanation && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <strong className="text-slate-800 block">Lời giải chi tiết:</strong>
                      <ChemFormula formula={q.explanation} isBlock />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
