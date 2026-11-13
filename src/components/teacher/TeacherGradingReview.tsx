import React, { useState } from 'react';
import { useChemStore } from '../../services/store';
import { Submission, SubmissionStatus, PublishStatus } from '../../types/chem';
import { ChemFormula } from '../common/ChemFormula';
import { SmartChemEditor } from '../common/SmartChemEditor';
import {
  CheckCircle,
  Clock,
  Eye,
  Send,
  RotateCcw,
  AlertTriangle,
  History,
  FileCheck,
  ShieldCheck,
  Edit3,
  Users
} from 'lucide-react';

export const TeacherGradingReview: React.FC = () => {
  const {
    classes,
    exams,
    submissions,
    questions,
    currentUser,
    regradeSubmission,
    publishSubmissionScore,
    publishEntireClassScores,
  } = useChemStore();

  const [selectedClassId, setSelectedClassId] = useState<string>('class_11a1');
  const [selectedExamId, setSelectedExamId] = useState<string>('exam_15m_c1');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    submissions[0]?.id || ''
  );

  // Regrading form state
  const [adjustedScore, setAdjustedScore] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [teacherFeedbackText, setTeacherFeedbackText] = useState<string>('');
  const [essayScores, setEssayScores] = useState<{ [qId: string]: number }>({});
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Submissions filtered by current class & exam
  const filteredSubmissions = submissions.filter(
    (s) =>
      (selectedClassId === 'all' || s.classId === selectedClassId) &&
      (selectedExamId === 'all' || s.examId === selectedExamId)
  );

  const activeSubmission = submissions.find((s) => s.id === selectedSubmissionId) || filteredSubmissions[0];
  const activeExam = exams.find((e) => e.id === activeSubmission?.examId);

  // Sync active submission into form
  React.useEffect(() => {
    if (activeSubmission) {
      setAdjustedScore(activeSubmission.finalScore ?? activeSubmission.autoGradedScore ?? 0);
      setTeacherFeedbackText(activeSubmission.teacherFeedback || '');
      setAdjustmentReason('');

      // Pre-fill essay manual scores if any
      const essayInit: { [k: string]: number } = {};
      Object.keys(activeSubmission.answers).forEach((qId) => {
        const ans = activeSubmission.answers[qId];
        if (ans.manualScore !== undefined) {
          essayInit[qId] = ans.manualScore;
        }
      });
      setEssayScores(essayInit);
    }
  }, [selectedSubmissionId, activeSubmission?.id]);

  const handleSaveGrading = () => {
    if (!activeSubmission) return;
    setErrorToast(null);

    if (!adjustmentReason.trim()) {
      setErrorToast('Vui lòng nhập "Lý do điều chỉnh / Nhận xét phê duyệt" để lưu vào nhật ký kiểm toán!');
      return;
    }

    regradeSubmission(
      activeSubmission.id,
      Number(adjustedScore),
      adjustmentReason,
      teacherFeedbackText,
      essayScores
    );

    setSuccessToast('Đã lưu kết quả chấm bài và cập nhật nhật ký kiểm toán thành công!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleTogglePublish = (publish: boolean) => {
    if (!activeSubmission) return;
    publishSubmissionScore(activeSubmission.id, publish);
    setSuccessToast(
      publish
        ? 'Đã CÔNG BỐ ĐIỂM cho học sinh và phụ huynh!'
        : 'Đã THU HỒI / ẨN ĐIỂM thành công!'
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handlePublishAll = () => {
    setErrorToast(null);
    if (!selectedExamId || selectedExamId === 'all') {
      setErrorToast('Vui lòng chọn cụ thể một bài kiểm tra để công bố điểm!');
      return;
    }
    publishEntireClassScores(selectedExamId, selectedClassId);
    setSuccessToast('Đã công bố điểm cho toàn bộ học sinh trong lớp thành công!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast alerts */}
      {errorToast && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-950 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {successToast}
        </div>
      )}

      {/* Filter Ribbon: Class, Exam, Batch Action */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Chọn Lớp học:
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.studentCount} HS)
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Chọn Bài kiểm tra:
            </span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-[280px]"
            >
              <option value="all">Tất cả đề kiểm tra</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch action: Publish whole class */}
        <button
          onClick={handlePublishAll}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Duyệt & Công bố điểm cả lớp
        </button>
      </div>

      {/* Main Grid: Submissions list on Left, Detailed Grading Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Submissions List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách bài làm ({filteredSubmissions.length})
            </span>
            <span className="text-[10px] text-slate-400">Chọn HS để chấm</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có học sinh nào nộp bài cho bộ lọc này.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isSelected = activeSubmission?.id === sub.id;
                const isApproved = sub.submissionStatus === 'APPROVED';
                const isPublished = sub.publishStatus === 'PUBLISHED';

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmissionId(sub.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-50/80 border-l-4 border-l-teal-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{sub.studentName}</h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {sub.studentCode} · Lớp {sub.className}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-teal-800 block">
                          {sub.finalScore ?? sub.autoGradedScore ?? '—'}/10đ
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px]">
                      {/* Submission status */}
                      <span
                        className={`font-semibold ${
                          isApproved
                            ? 'text-emerald-700'
                            : sub.submissionStatus === 'NEEDS_REVIEW'
                            ? 'text-amber-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {sub.submissionStatus === 'APPROVED'
                          ? 'Đã duyệt'
                          : sub.submissionStatus === 'NEEDS_REVIEW'
                          ? 'Cần chấm tự luận'
                          : 'Đã tự chấm'}
                      </span>

                      {/* Publish status */}
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isPublished ? 'ĐÃ CÔNG BỐ' : 'ĐANG ẨN'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Grading & Audit Review Panel */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {!activeSubmission ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Vui lòng chọn một bài nộp ở cột bên trái để chấm và duyệt điểm.
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      {activeSubmission.studentName} ({activeSubmission.studentCode})
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                      {activeSubmission.className}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bài: <strong>{activeSubmission.examTitle}</strong> · Nộp lúc:{' '}
                    {new Date(activeSubmission.submittedAt).toLocaleTimeString('vi-VN')} ngày{' '}
                    {new Date(activeSubmission.submittedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Status Badges & History Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
                  >
                    <History className="w-3.5 h-3.5 text-teal-600" />
                    Lịch sử chỉnh điểm ({activeSubmission.adjustmentLogs.length})
                  </button>

                  <button
                    onClick={() =>
                      handleTogglePublish(activeSubmission.publishStatus !== 'PUBLISHED')
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors ${
                      activeSubmission.publishStatus === 'PUBLISHED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {activeSubmission.publishStatus === 'PUBLISHED'
                      ? 'Thu hồi / Ẩn điểm'
                      : 'Công bố điểm cho HS & PH'}
                  </button>
                </div>
              </div>

              {/* Scrollable Questions and Answers View */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Điểm hệ thống tự chấm: </span>
                    <strong className="text-slate-800">{activeSubmission.autoGradedScore ?? 0} đ</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Trạng thái công bố: </span>
                    <strong className={activeSubmission.publishStatus === 'PUBLISHED' ? 'text-emerald-700' : 'text-slate-600'}>
                      {activeSubmission.publishStatus === 'PUBLISHED' ? 'Đã công bố đến Học sinh & Phụ huynh' : 'Đang giữ bí mật (Học sinh & Phụ huynh chưa thấy)'}
                    </strong>
                  </div>
                </div>

                {/* Questions Breakdown */}
                {activeExam?.questionIds.map((qId, idx) => {
                  const q =
                    activeExam.questionOverrides?.[qId] ||
                    questions.find((item) => item.id === qId);
                  const ans = activeSubmission.answers[qId];

                  if (!q) return null;

                  return (
                    <div
                      key={qId}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-800">
                          Câu {idx + 1} ({q.type === 'MCQ' ? 'Trắc nghiệm ABCD' : q.type === 'ESSAY' ? 'Tự luận' : q.type === 'SHORT_ANSWER' ? 'Điền đáp án ngắn' : 'Đúng/Sai nhiều ý'}) - Tối đa: {q.maxScore}đ
                        </span>
                        <span className="font-bold text-teal-700">
                          Điểm đạt: {ans?.manualScore ?? ans?.autoScore ?? 0} / {q.maxScore}đ
                        </span>
                      </div>

                      {/* Question content */}
                      <div className="text-slate-700 leading-relaxed font-medium">
                        <ChemFormula formula={q.content} />
                      </div>

                      {/* Student Answer */}
                      <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Bài làm của học sinh:
                        </span>
                        {q.type === 'MCQ' && (
                          <div className="font-bold text-slate-900">
                            Đáp án chọn: <span className="text-teal-700">{ans?.selectedOption || 'Chưa chọn'}</span>
                          </div>
                        )}
                        {q.type === 'SHORT_ANSWER' && (
                          <div className="font-bold text-slate-900">
                            Học sinh điền:{' '}
                            <span className="text-teal-700">
                              <ChemFormula formula={ans?.shortText || 'Để trống'} />
                            </span>
                          </div>
                        )}
                        {q.type === 'MULTIPLE_TRUE_FALSE' && (
                          <div className="space-y-1">
                            {q.tfStatements?.map((st) => (
                              <div key={st.id} className="flex justify-between text-[11px]">
                                <span>
                                  <ChemFormula formula={st.statement} />
                                </span>
                                <strong className="text-slate-800">
                                  {ans?.tfAnswers?.[st.id] ? 'ĐÚNG' : 'SAI'}
                                </strong>
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === 'ESSAY' && (
                          <div className="space-y-2">
                            <p className="text-slate-800 leading-relaxed italic bg-white p-2.5 rounded border border-slate-200">
                              &quot;{ans?.essayText || 'Học sinh không điền câu trả lời.'}&quot;
                            </p>
                            {/* Rubric guide */}
                            <div className="p-2 bg-amber-50/60 border border-amber-200 rounded text-[11px] text-amber-900">
                              <strong>Hướng dẫn chấm / Rubric:</strong>
                              <div className="mt-1">
                                <ChemFormula formula={q.rubricGuide || ''} isBlock />
                              </div>
                            </div>
                            {/* Score Input for Essay */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="font-bold text-slate-700">Chấm điểm câu này:</span>
                              <input
                                type="number"
                                step="0.25"
                                min="0"
                                max={q.maxScore}
                                value={essayScores[qId] ?? ans?.manualScore ?? 0}
                                onChange={(e) =>
                                  setEssayScores((prev) => ({
                                    ...prev,
                                    [qId]: Number(e.target.value),
                                  }))
                                }
                                className="w-20 p-1.5 border border-slate-300 rounded font-bold text-teal-800 text-center"
                              />
                              <span className="text-slate-400">/ {q.maxScore} đ</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Score Adjustment & Audit Form */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Biên Bản Chấm Lại & Duyệt Điểm Cuối Cùng
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Điểm tổng kết sau rà soát (thang 10) (*):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={adjustedScore}
                        onChange={(e) => setAdjustedScore(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-black text-lg text-teal-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Lý do điều chỉnh (bắt buộc theo quy chuẩn kiểm toán) (*):
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Chấm xong tự luận / Rà soát phúc khảo..."
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <SmartChemEditor
                      compact
                      minHeight={105}
                      label="Lời nhận xét của giáo viên (hỗ trợ công thức hóa học khi sửa bài)"
                      value={teacherFeedbackText}
                      onChange={setTeacherFeedbackText}
                      placeholder="Ghi nhận xét cụ thể về phương pháp, phản ứng hóa học và kiến thức của học sinh..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveGrading}
                      className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Lưu bản chấm & Duyệt điểm
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: AUDIT LOGS HISTORY */}
      {showHistoryModal && activeSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" />
                Lịch Sử Kiểm Toán Chấm Điểm
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Học sinh: <strong>{activeSubmission.studentName}</strong> ({activeSubmission.studentCode})
              <br />
              Bài thi: <strong>{activeSubmission.examTitle}</strong>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activeSubmission.adjustmentLogs.length === 0 ? (
                <div className="text-xs text-slate-400 italic p-3 text-center">
                  Chưa có lần điều chỉnh điểm nào. Điểm hiện tại là điểm tự chấm ban đầu.
                </div>
              ) : (
                activeSubmission.adjustmentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Phiên bản v{log.version}</span>
                      <span className="text-teal-700">
                        {log.previousScore} đ ➔ {log.newScore} đ
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>Lý do:</strong> {log.reason}
                    </p>
                    <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                      <span>Người sửa: {log.adjustedBy}</span>
                      <span>{new Date(log.adjustedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
