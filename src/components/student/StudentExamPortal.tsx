import React, { useMemo, useState } from 'react';
import { useChemStore } from '../../services/store';
import { Exam, Question, QuestionType } from '../../types/chem';
import { getVariantOptionsForQuestion, resolveExamQuestion } from '../../utils/examUtils';
import { ChemFormula } from '../common/ChemFormula';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentExamPortal: React.FC = () => {
  const { exams, questions, submissions, currentUser, submitExamAnswers } = useChemStore();

  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [assignedVariantCode, setAssignedVariantCode] = useState<string>('101');
  const [answers, setAnswers] = useState<{
    [qId: string]: {
      option?: string;
      tf?: { [statementId: string]: boolean };
      short?: string;
      essay?: string;
    };
  }>({});
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  const studentClassIds = currentUser.assignedClassIds || ['class_11a1'];

  // Available active/assigned exams matching student class & non-archived
  const availableExams = useMemo(() => {
    return exams.filter((e) => {
      if (e.isArchived) return false;
      if (e.status === 'DRAFT' || e.status === 'CLOSED') return false;
      if (
        e.assignedClassIds &&
        e.assignedClassIds.length > 0 &&
        !e.assignedClassIds.some((cid) => studentClassIds.includes(cid))
      ) {
        return false;
      }
      return true;
    });
  }, [exams, studentClassIds]);

  const studentSubmissions = submissions.filter(
    (s) => s.studentId === currentUser.id || s.studentId === 'HS11015'
  );

  const qMap = useMemo(() => {
    const rawMap: Record<string, Question> = {};
    questions.forEach((q) => (rawMap[q.id] = q));
    if (!activeExam?.questionOverrides) return rawMap;
    const merged: Record<string, Question> = { ...rawMap };
    Object.keys(activeExam.questionOverrides).forEach((qId) => {
      const resolved = resolveExamQuestion(activeExam, qId, rawMap);
      if (resolved) merged[qId] = resolved;
    });
    return merged;
  }, [questions, activeExam]);

  const handleStartExam = (exam: Exam) => {
    // Pick deterministic variant based on studentId + attempts
    const variants = exam.variants && exam.variants.length > 0 ? exam.variants : [];
    let pickedCode = '101';
    if (variants.length > 0) {
      const hash = currentUser.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      pickedCode = variants[hash % variants.length].code;
    }
    setAssignedVariantCode(pickedCode);
    setActiveExam(exam);
    setAnswers({});
    setSubmittedResult(null);
  };

  const handleAnswerOption = (qId: string, optId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], option: optId },
    }));
  };

  const handleAnswerTf = (qId: string, statementId: string, val: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        tf: { ...(prev[qId]?.tf || {}), [statementId]: val },
      },
    }));
  };

  const handleAnswerShort = (qId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], short: text },
    }));
  };

  const handleAnswerEssay = (qId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], essay: text },
    }));
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    const res = submitExamAnswers(activeExam.id, currentUser.id, answers, assignedVariantCode);
    setSubmittedResult(res);

    if (res.publishStatus === 'PUBLISHED') {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const activeVariant =
    activeExam?.variants?.find((v) => v.code === assignedVariantCode) ||
    activeExam?.variants?.[0];

  const orderedQuestions = useMemo(() => {
    if (!activeExam) return [];
    const ids = activeVariant ? activeVariant.questionIds : activeExam.questionIds;
    return ids.map((id) => qMap[id]).filter(Boolean);
  }, [activeExam, activeVariant, qMap]);

  const partDefinitions: { type: QuestionType; title: string }[] = [
    { type: 'MCQ', title: 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn' },
    { type: 'MULTIPLE_TRUE_FALSE', title: 'PHẦN II. Câu trắc nghiệm đúng sai' },
    { type: 'SHORT_ANSWER', title: 'PHẦN III. Câu trắc nghiệm yêu cầu trả lời ngắn' },
    { type: 'ESSAY', title: 'PHẦN IV. Tự luận' },
  ];

  return (
    <div className="space-y-6">
      {activeExam ? (
        <div className="space-y-6">
          {/* Header ribbon */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-slate-900">{activeExam.title}</h2>
              <span className="text-xs text-slate-500">
                Khối {activeExam.grade} · Mã đề: <strong className="text-teal-800">{assignedVariantCode}</strong> · Số câu: {orderedQuestions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold font-mono">
                <Clock className="w-4 h-4 text-amber-600" />
                {activeExam.durationMinutes} phút
              </span>
              <button
                type="button"
                onClick={() => setActiveExam(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Quay lại
              </button>
            </div>
          </div>

          {submittedResult ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center max-w-xl mx-auto space-y-4">
              <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
              <h3 className="text-lg font-black text-slate-900">ĐÃ NỘP BÀI THÀNH CÔNG!</h3>

              {submittedResult.publishStatus === 'PUBLISHED' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <span className="text-slate-600 font-medium">Kết quả bài làm của bạn (Mã {assignedVariantCode}):</span>
                  <div className="text-3xl font-black text-emerald-700">
                    {submittedResult.finalScore ?? submittedResult.autoGradedScore} / 10 điểm
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                  <div className="font-bold text-sm text-slate-800">
                    &quot;Đã nộp bài thành công. Kết quả đang chờ giáo viên chấm và công bố.&quot;
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Điểm số và đáp án chi tiết được bảo mật đến khi giáo viên hoàn tất duyệt điểm.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveExam(null);
                  setSubmittedResult(null);
                }}
                className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
              >
                Quay lại danh sách bài kiểm tra
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                let globalQNum = 1;
                return partDefinitions.map((part) => {
                  const pQs = orderedQuestions.filter((q) => q.type === part.type);
                  if (pQs.length === 0) return null; // Skip 0-question sections!
                  return (
                    <div key={part.type} className="space-y-4">
                      <h3 className="text-sm font-black text-teal-900 uppercase bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-200">
                        {part.title} ({pQs.length} câu)
                      </h3>

                      {pQs.map((q) => {
                        const qNumber = globalQNum++;
                        const ans = answers[q.id] || {};
                        const variantOpts = getVariantOptionsForQuestion(q, activeVariant);
                        const tfPerm =
                          activeVariant?.tfOrderPermutations?.[q.id] ||
                          (q.tfStatements || []).map((s) => s.id);
                        const qScore = activeExam.questionScores?.[q.id] ?? q.maxScore;

                        return (
                          <div
                            key={q.id}
                            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="font-bold text-xs text-slate-800">
                                Câu {qNumber}
                              </span>
                              <span className="text-xs font-semibold text-teal-700">
                                {qScore} điểm
                              </span>
                            </div>

                            <div className="text-sm text-slate-800 leading-relaxed font-medium">
                              <ChemFormula formula={q.content} />
                            </div>

                            {q.diagramSvg && (
                              <div
                                className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-sm"
                                dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                              />
                            )}

                            {/* MCQ Choices using variant option permutation */}
                            {q.type === 'MCQ' && (
                              <div className="space-y-2 pt-1">
                                {variantOpts.map((opt) => {
                                  const isSelected = ans.option === opt.displayLetter;
                                  return (
                                    <button
                                      key={opt.displayLetter}
                                      type="button"
                                      onClick={() => handleAnswerOption(q.id, opt.displayLetter)}
                                      className={`w-full text-left p-3 rounded-lg border text-xs flex items-center gap-3 transition-all ${
                                        isSelected
                                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                                          isSelected
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'border-slate-300 text-slate-500'
                                        }`}
                                      >
                                        {opt.displayLetter}
                                      </span>
                                      <span>
                                        <ChemFormula formula={opt.content} />
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Multiple True/False statements */}
                            {q.type === 'MULTIPLE_TRUE_FALSE' && q.tfStatements && (
                              <div className="space-y-2 pt-1">
                                {tfPerm.map((sid, sIdx) => {
                                  const st = q.tfStatements!.find((s) => s.id === sid);
                                  if (!st) return null;
                                  const curVal = ans.tf?.[sid];
                                  return (
                                    <div
                                      key={sid}
                                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs"
                                    >
                                      <div className="flex-1">
                                        <strong className="text-teal-800 mr-1.5">
                                          {['a)', 'b)', 'c)', 'd)'][sIdx]}
                                        </strong>
                                        <ChemFormula formula={st.statement} />
                                      </div>
                                      <div className="flex gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleAnswerTf(q.id, sid, true)}
                                          className={`px-3 py-1 rounded-lg font-bold border ${
                                            curVal === true
                                              ? 'bg-emerald-600 text-white border-emerald-700'
                                              : 'bg-white text-slate-600 border-slate-300'
                                          }`}
                                        >
                                          ĐÚNG
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleAnswerTf(q.id, sid, false)}
                                          className={`px-3 py-1 rounded-lg font-bold border ${
                                            curVal === false
                                              ? 'bg-rose-600 text-white border-rose-700'
                                              : 'bg-white text-slate-600 border-slate-300'
                                          }`}
                                        >
                                          SAI
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Short Answer */}
                            {q.type === 'SHORT_ANSWER' && (
                              <input
                                type="text"
                                value={ans.short || ''}
                                onChange={(e) => handleAnswerShort(q.id, e.target.value)}
                                placeholder="Nhập đáp án ngắn (ví dụ: 12.5)..."
                                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                              />
                            )}

                            {/* Essay */}
                            {q.type === 'ESSAY' && (
                              <textarea
                                rows={4}
                                value={ans.essay || ''}
                                onChange={(e) => handleAnswerEssay(q.id, e.target.value)}
                                placeholder="Trình bày lời giải chi tiết..."
                                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="flex items-center gap-2 px-8 py-3 text-xs font-black text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>NỘP BÀI KIỂM TRA</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Bài Tập & Bài Kiểm Tra Hóa Học
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Danh sách bài kiểm tra được giao cho lớp của bạn. Hệ thống tự động phát mã đề và bảo mật đáp án.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExams.map((exam) => {
              const attemptsUsed = studentSubmissions.filter((s) => s.examId === exam.id).length;
              const attemptLimit = exam.attemptLimit || 99;
              const nowMs = Date.now();
              const notOpenYet = exam.opensAt ? new Date(exam.opensAt).getTime() > nowMs : false;
              const limitReached = attemptsUsed >= attemptLimit;

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 uppercase">
                        Khối {exam.grade} · {exam.durationMinutes} phút
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Đã làm: {attemptsUsed}/{exam.attemptLimit ?? '∞'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{exam.title}</h3>
                    <p className="text-xs text-slate-500">
                      Số câu: <strong>{exam.questionIds.length} câu</strong> · Hạn nộp:{' '}
                      <strong>{new Date(exam.deadline).toLocaleDateString('vi-VN')}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {exam.allowShowScoreImmediately ? 'Xem điểm ngay' : 'Chờ GV duyệt điểm'}
                    </span>
                    <button
                      type="button"
                      disabled={notOpenYet || limitReached}
                      onClick={() => handleStartExam(exam)}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
                    >
                      {notOpenYet ? (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Chưa mở đề
                        </>
                      ) : limitReached ? (
                        <>Hết lượt làm</>
                      ) : (
                        <>
                          Bắt đầu làm bài <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-800">
              Kết Quả Bài Làm & Điểm Số Đã Được Công Bố
            </h3>
            <div className="space-y-3">
              {studentSubmissions.filter((s) => s.publishStatus === 'PUBLISHED').length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Chưa có bài kiểm tra nào được công bố điểm.
                </p>
              ) : (
                studentSubmissions
                  .filter((s) => s.publishStatus === 'PUBLISHED')
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">
                          {sub.examTitle} {sub.variantCode && `(Mã ${sub.variantCode})`}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                        </span>
                        {sub.teacherFeedback && (
                          <div className="text-xs text-teal-800 font-medium mt-1">
                            <span>Nhận xét: </span>
                            <ChemFormula formula={sub.teacherFeedback} />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-teal-700">
                          {sub.finalScore ?? sub.autoGradedScore} / 10
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          ĐÃ CÔNG BỐ
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
