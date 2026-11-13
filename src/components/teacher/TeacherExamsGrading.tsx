import React, { useEffect, useMemo, useState } from 'react';
import { useChemStore } from '../../services/store';
import { Exam, ExamLifecycleStatus, ExamMatrix } from '../../types/chem';
import { ExamMatrixSpecManager } from './ExamMatrixSpecManager';
import { ExamGenerator } from './ExamGenerator';
import { TeacherQuestionBank } from './TeacherQuestionBank';
import { ExamShuffleManager } from './ExamShuffleManager';
import { ExamRubricAnswers } from './ExamRubricAnswers';
import { ExamExportModal } from './ExamExportModal';
import {
  AlertTriangle,
  Archive,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  FileText,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Printer,
  Search,
  Send,
  Shuffle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';

interface TeacherExamsGradingProps {
  initialSubTab?: string;
}

const STATUS_LABELS: Record<ExamLifecycleStatus, { label: string; badge: string }> = {
  DRAFT: { label: 'Nháp', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
  PENDING_REVIEW: { label: 'Chờ duyệt', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  APPROVED: { label: 'Đã duyệt', badge: 'bg-sky-100 text-sky-900 border-sky-300' },
  ASSIGNED: { label: 'Đã giao', badge: 'bg-teal-100 text-teal-900 border-teal-300' },
  ACTIVE: { label: 'Đang mở thi', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  CLOSED: { label: 'Đã kết thúc', badge: 'bg-purple-100 text-purple-900 border-purple-300' },
};

export const TeacherExamsGrading: React.FC<TeacherExamsGradingProps> = ({
  initialSubTab = 'overview',
}) => {
  const {
    exams,
    classes,
    questions,
    matrices,
    submissions,
    updateExam,
    deleteExam,
    duplicateExam,
    archiveExam,
    toggleExamShowScoreImmediately,
    publishSubmissionScore,
    publishEntireClassScores,
  } = useChemStore();

  const normalizeSubTab = (sub?: string): string => {
    if (!sub || sub === 'default') return 'overview';
    if (sub === 'assign-track' || sub === 'grading') return 'created-exams';
    return sub;
  };

  const [activeTab, setActiveTab] = useState<string>(normalizeSubTab(initialSubTab));
  const [selectedMatrixForGen, setSelectedMatrixForGen] = useState<ExamMatrix | undefined>(
    undefined
  );
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [focusedExamId, setFocusedExamId] = useState<string>(exams[0]?.id || '');
  const [exportModalExam, setExportModalExam] = useState<Exam | null>(null);

  // Tab 7 ("Đề đã lưu & Giao bài") filters & view toggle
  const [savedSubView, setSavedSubView] = useState<'exams' | 'submissions'>(
    initialSubTab === 'assign-track' ? 'submissions' : 'exams'
  );
  const [filterGrade, setFilterGrade] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Assign Exam Modal state
  const [assignModalExam, setAssignModalExam] = useState<Exam | null>(null);
  const [assignClasses, setAssignClasses] = useState<string[]>([]);
  const [assignOpensAt, setAssignOpensAt] = useState<string>('');
  const [assignDeadline, setAssignDeadline] = useState<string>('');
  const [assignDuration, setAssignDuration] = useState<number>(45);
  const [assignAttemptLimit, setAssignAttemptLimit] = useState<number>(1);
  const [assignShowScore, setAssignShowScore] = useState<boolean>(false);
  const [assignShowAnswers, setAssignShowAnswers] = useState<boolean>(false);

  // Submissions tracking filter
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedExamSubFilter, setSelectedExamSubFilter] = useState<string>('ALL');

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(normalizeSubTab(initialSubTab));
      if (initialSubTab === 'assign-track') {
        setSavedSubView('submissions');
      }
    }
  }, [initialSubTab]);

  // EXACTLY 7 requested tabs inside "Bài tập & Kiểm tra"
  const tabs = [
    { id: 'overview', label: 'Tổng quan đề kiểm tra', icon: LayoutDashboard },
    { id: 'create-exam', label: 'Tạo đề mới', icon: Sparkles },
    { id: 'matrix-spec', label: 'Ma trận & Bản đặc tả', icon: Layers },
    { id: 'question-bank', label: 'Ngân hàng câu hỏi', icon: BookOpen },
    { id: 'shuffle-variants', label: 'Trộn đề & Mã đề', icon: Shuffle },
    { id: 'rubrics-answers', label: 'Đáp án & Hướng dẫn chấm', icon: CheckCircle2 },
    {
      id: 'created-exams',
      label: 'Đề đã lưu & Giao bài',
      icon: FileText,
      badge: `${exams.filter((e) => !e.isArchived).length}`,
    },
  ];

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (!showArchived && e.isArchived) return false;
      if (filterGrade !== 0 && e.grade !== filterGrade) return false;
      if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        if (!e.title.toLowerCase().includes(s) && !(e.matrixTitle || '').toLowerCase().includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [exams, showArchived, filterGrade, filterStatus, searchTerm]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (selectedClassFilter !== 'ALL' && s.classId !== selectedClassFilter) return false;
      if (selectedExamSubFilter !== 'ALL' && s.examId !== selectedExamSubFilter) return false;
      return true;
    });
  }, [submissions, selectedClassFilter, selectedExamSubFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      DRAFT: 0,
      PENDING_REVIEW: 0,
      APPROVED: 0,
      ACTIVE_ASSIGNED: 0,
      CLOSED: 0,
      RESYNC_NEEDED: 0,
    };
    exams
      .filter((e) => !e.isArchived)
      .forEach((e) => {
        if (e.status === 'DRAFT') counts.DRAFT++;
        else if (e.status === 'PENDING_REVIEW') counts.PENDING_REVIEW++;
        else if (e.status === 'APPROVED') counts.APPROVED++;
        else if (e.status === 'ACTIVE' || e.status === 'ASSIGNED') counts.ACTIVE_ASSIGNED++;
        else if (e.status === 'CLOSED') counts.CLOSED++;
        if (e.needsResync) counts.RESYNC_NEEDED++;
      });
    return counts;
  }, [exams]);

  const handleOpenAssignModal = (exam: Exam) => {
    setAssignModalExam(exam);
    setAssignClasses(exam.assignedClassIds || []);
    setAssignOpensAt(exam.opensAt || new Date().toISOString().slice(0, 16));
    setAssignDeadline(exam.deadline ? exam.deadline.slice(0, 16) : '2026-12-30T23:59');
    setAssignDuration(exam.durationMinutes || 45);
    setAssignAttemptLimit(exam.attemptLimit || 1);
    setAssignShowScore(exam.allowShowScoreImmediately);
    setAssignShowAnswers(exam.allowShowAnswers);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalExam) return;
    updateExam(assignModalExam.id, {
      assignedClassIds: assignClasses,
      opensAt: assignOpensAt,
      deadline: assignDeadline,
      durationMinutes: assignDuration,
      attemptLimit: assignAttemptLimit,
      allowShowScoreImmediately: assignShowScore,
      allowShowAnswers: assignShowAnswers,
      status: 'ACTIVE',
    });
    setActionFeedback({
      ok: true,
      msg: `Đã giao đề "${assignModalExam.title}" cho ${assignClasses.length} lớp thành công!`,
    });
    setAssignModalExam(null);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleSafeDelete = (exam: Exam) => {
    const res = deleteExam(exam.id);
    setActionFeedback({ ok: res.ok, msg: res.message });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* 7 Sub-Tabs Bar (does NOT expand Sidebar) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2.5 text-[15px] font-bold rounded-xl transition-all flex items-center gap-2 min-h-[44px] ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    isActive ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =======================================================
          TAB 1: TỔNG QUAN ĐỀ KIỂM TRA
          ======================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800">
                Trung Tâm Tạo & Quản Lý Đề Kiểm Tra Hóa Học THPT (10 – 11 – 12)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Quy trình chuẩn GDPT 2018: Lập Ma trận & Đặc tả → Soạn Ngân hàng câu hỏi → Sinh đề → Trộn mã đề → Duyệt đáp án → Xuất Word/PDF & Giao bài.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingExam(null);
                setActiveTab('create-exam');
              }}
              className="px-5 py-2.5 text-sm font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-2 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Bắt đầu tạo đề mới</span>
            </button>
          </div>

          {statusCounts.RESYNC_NEEDED > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-rose-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  Có {statusCounts.RESYNC_NEEDED} đề kiểm tra cần đồng bộ lại mã đề vì câu hỏi gốc vừa được chỉnh sửa.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('shuffle-variants')}
                className="px-3.5 py-2 bg-rose-700 text-white rounded-xl"
              >
                Mở tab Trộn đề để đồng bộ
              </button>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase block">Đề Nháp / Chờ duyệt</span>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {statusCounts.DRAFT + statusCounts.PENDING_REVIEW}
              </div>
              <span className="text-xs text-slate-500">Chưa mở thi</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-teal-700 uppercase block">Đề Đã duyệt / Đã giao</span>
              <div className="text-2xl font-black text-teal-800 mt-1">
                {statusCounts.APPROVED + statusCounts.ACTIVE_ASSIGNED}
              </div>
              <span className="text-xs text-slate-500">Sẵn sàng / Đang thi</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-blue-700 uppercase block">Ma trận & Đặc tả</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{matrices.length}</div>
              <span className="text-xs text-slate-500">Khung chuẩn lưu trữ</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-emerald-700 uppercase block">Câu hỏi đã duyệt</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {questions.filter((q) => q.isApproved !== false).length} / {questions.length}
              </div>
              <span className="text-xs text-slate-500">Kho câu hỏi Hóa 10–12</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-amber-700 uppercase block">Bài học sinh đã nộp</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{submissions.length}</div>
              <span className="text-xs text-slate-500">Cần theo dõi / duyệt điểm</span>
            </div>
          </div>

          {/* Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: 'Bước 1',
                title: 'Thiết lập Ma trận & Bản đặc tả',
                desc: 'Chỉnh sửa trực tiếp số câu (hỗ trợ 0 câu), điểm thập phân từng ô, nhập file Excel/Word/PDF thật.',
                tab: 'matrix-spec',
                btn: 'Mở Ma trận & Đặc tả',
              },
              {
                step: 'Bước 2',
                title: 'Soạn & Duyệt Ngân hàng câu hỏi',
                desc: 'Đủ 4 dạng câu hỏi GDPT 2018, công thức LaTeX, sơ đồ thí nghiệm SVG và rubric chấm tự luận.',
                tab: 'question-bank',
                btn: 'Mở Ngân hàng câu hỏi',
              },
              {
                step: 'Bước 3',
                title: 'Trộn đề, Xuất Word & Giao bài',
                desc: 'Sinh mã đề 101–104, tự cập nhật đáp án mới, xuất tệp .docx chuẩn OMML và giao lớp trực tuyến.',
                tab: 'shuffle-variants',
                btn: 'Mở Trộn đề & Mã đề',
              },
            ].map((card) => (
              <div
                key={card.tab}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-teal-700 uppercase">{card.step}</span>
                  <h3 className="text-base font-black text-slate-800">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab(card.tab)}
                  className="px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl w-fit"
                >
                  {card.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 2: TẠO ĐỀ MỚI
          ======================================================= */}
      {activeTab === 'create-exam' && (
        <ExamGenerator
          initialMatrix={selectedMatrixForGen}
          editingExam={editingExam}
          onClearEditingExam={() => setEditingExam(null)}
          onExamSaved={(saved, goToTab) => {
            setFocusedExamId(saved.id);
            setActiveTab(goToTab || 'created-exams');
          }}
          onNavigateToMatrixTab={() => setActiveTab('matrix-spec')}
          onNavigateToQuestionBank={() => setActiveTab('question-bank')}
        />
      )}

      {/* =======================================================
          TAB 3: MA TRẬN & BẢN ĐẶC TẢ
          ======================================================= */}
      {activeTab === 'matrix-spec' && (
        <ExamMatrixSpecManager
          onUseMatrixForExam={(matrix) => {
            setSelectedMatrixForGen(matrix);
            setEditingExam(null);
            setActiveTab('create-exam');
          }}
        />
      )}

      {/* =======================================================
          TAB 4: NGÂN HÀNG CÂU HỎI
          ======================================================= */}
      {activeTab === 'question-bank' && <TeacherQuestionBank />}

      {/* =======================================================
          TAB 5: TRỘN ĐỀ & MÃ ĐỀ
          ======================================================= */}
      {activeTab === 'shuffle-variants' && (
        <ExamShuffleManager
          initialExamId={focusedExamId}
          onGoToAnswers={(examId) => {
            setFocusedExamId(examId);
            setActiveTab('rubrics-answers');
          }}
          onGoToExport={(examId) => {
            const ex = exams.find((item) => item.id === examId);
            if (ex) setExportModalExam(ex);
          }}
        />
      )}

      {/* =======================================================
          TAB 6: ĐÁP ÁN & HƯỚNG DẪN CHẤM
          ======================================================= */}
      {activeTab === 'rubrics-answers' && (
        <ExamRubricAnswers
          initialExamId={focusedExamId}
          onResyncInShuffleTab={(examId) => {
            setFocusedExamId(examId);
            setActiveTab('shuffle-variants');
          }}
          onOpenExportModal={(exam) => setExportModalExam(exam)}
        />
      )}

      {/* =======================================================
          TAB 7: ĐỀ ĐÃ LƯU & GIAO BÀI + THEO DÕI KẾT QUẢ
          ======================================================= */}
      {activeTab === 'created-exams' && (
        <div className="space-y-5">
          {actionFeedback && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                actionFeedback.ok
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {actionFeedback.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{actionFeedback.msg}</span>
            </div>
          )}

          {/* Switcher between Saved Exams and Student Submissions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setSavedSubView('exams')}
                className={`px-4 py-2 text-xs font-black rounded-lg flex items-center gap-1.5 ${
                  savedSubView === 'exams'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Kho Đề Đã Lưu & Giao Bài ({filteredExams.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSavedSubView('submissions')}
                className={`px-4 py-2 text-xs font-black rounded-lg flex items-center gap-1.5 ${
                  savedSubView === 'submissions'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Theo Dõi Bài Nộp & Công Bố Điểm ({submissions.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingExam(null);
                setActiveTab('create-exam');
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-1.5 min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo đề mới</span>
            </button>
          </div>

          {savedSubView === 'exams' ? (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {[0, 10, 11, 12].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFilterGrade(g)}
                        className={`px-3 py-1.5 font-bold rounded-lg ${
                          filterGrade === g
                            ? 'bg-white text-teal-800 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        {g === 0 ? 'Tất cả khối' : `Lớp ${g}`}
                      </button>
                    ))}
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="ALL">Mọi trạng thái</option>
                    <option value="DRAFT">Nháp</option>
                    <option value="PENDING_REVIEW">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="ASSIGNED">Đã giao</option>
                    <option value="ACTIVE">Đang mở thi</option>
                    <option value="CLOSED">Đã kết thúc</option>
                  </select>

                  <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span>Hiện đề lưu trữ</span>
                  </label>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên đề kiểm tra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Exams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredExams.map((exam) => {
                  const stInfo = STATUS_LABELS[exam.status] || STATUS_LABELS.DRAFT;
                  const subCount = submissions.filter((s) => s.examId === exam.id).length;
                  return (
                    <div
                      key={exam.id}
                      className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between space-y-4 ${
                        exam.isArchived ? 'opacity-75 border-slate-300 bg-slate-50' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-teal-100 text-teal-800">
                            Khối {exam.grade} · {exam.durationMinutes} phút
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${stInfo.badge}`}
                          >
                            {stInfo.label}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 leading-snug">
                          {exam.title}
                        </h3>

                        {exam.needsResync && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-bold text-rose-800">
                            ⚠ Cần trộn lại để cập nhật đáp án mới
                          </div>
                        )}

                        <p className="text-xs text-slate-600">
                          Số câu: <strong>{exam.questionIds.length}</strong> · Bài nộp:{' '}
                          <strong>{subCount}</strong> · Lớp:{' '}
                          <strong>
                            {exam.assignedClassIds
                              .map((cid) => classes.find((c) => c.id === cid)?.name)
                              .filter(Boolean)
                              .join(', ') || 'Chưa giao'}
                          </strong>
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {(exam.variants && exam.variants.length > 0
                            ? exam.variants
                            : [{ code: 'GỐC' }]
                          ).map((v) => (
                            <span
                              key={v.code}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold"
                            >
                              Mã {v.code}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {/* Quick score toggle */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Xem điểm ngay:</span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleExamShowScoreImmediately(
                                exam.id,
                                !exam.allowShowScoreImmediately
                              )
                            }
                            className="flex items-center gap-1 font-bold"
                          >
                            {exam.allowShowScoreImmediately ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <ToggleRight className="w-5 h-5 text-emerald-600" /> BẬT
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1">
                                <ToggleLeft className="w-5 h-5 text-slate-400" /> TẮT
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(exam)}
                            className="py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Giao bài cho lớp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExportModalExam(exam)}
                            className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Xuất Word / In</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExam(exam);
                              setActiveTab('create-exam');
                            }}
                            className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateExam(exam.id)}
                            className="px-2.5 py-1.5 text-amber-700 hover:bg-amber-50 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" /> Nhân bản
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFocusedExamId(exam.id);
                              setActiveTab('shuffle-variants');
                            }}
                            className="px-2.5 py-1.5 text-teal-700 hover:bg-teal-50 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Shuffle className="w-3.5 h-3.5" /> Trộn lại
                          </button>
                          <button
                            type="button"
                            onClick={() => archiveExam(exam.id, !exam.isArchived)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
                            title={exam.isArchived ? 'Khôi phục từ lưu trữ' : 'Lưu trữ đề'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSafeDelete(exam)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Xóa đề (Chặn nếu đã có bài nộp)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SUBMISSIONS TRACKING PANEL */
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="ALL">Tất cả lớp</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Lớp {cls.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedExamSubFilter}
                    onChange={(e) => setSelectedExamSubFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl max-w-xs"
                  >
                    <option value="ALL">Tất cả bài kiểm tra</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClassFilter !== 'ALL' && selectedExamSubFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() =>
                      publishEntireClassScores(selectedExamSubFilter, selectedClassFilter)
                    }
                    className="px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800"
                  >
                    Công bố điểm cả lớp đã chọn
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm">
                    Chưa có bài nộp phù hợp bộ lọc.
                  </div>
                ) : (
                  filteredSubmissions.map((s) => {
                    const isPublished = s.publishStatus === 'PUBLISHED';
                    return (
                      <div
                        key={s.id}
                        className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-slate-50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-black text-slate-900">
                              {s.studentName}
                            </strong>
                            <span className="font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                              {s.studentCode}
                            </span>
                            <span className="text-slate-500">({s.className})</span>
                            {s.variantCode && (
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold">
                                Mã {s.variantCode}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 font-medium">
                            Đề: <strong>{s.examTitle}</strong>
                          </p>
                          <span className="text-[11px] text-slate-400 block">
                            Nộp lúc {new Date(s.submittedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-base font-black text-slate-900 block font-mono">
                              {s.finalScore ?? s.autoGradedScore ?? 0} đ
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {isPublished ? '✓ Đã công bố' : '🔒 Chờ duyệt công bố'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => publishSubmissionScore(s.id, !isPublished)}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl border ${
                              isPublished
                                ? 'bg-white text-slate-700 border-slate-300'
                                : 'bg-teal-700 text-white border-teal-800'
                            }`}
                          >
                            {isPublished ? 'Khóa lại' : 'Duyệt & Công bố'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ASSIGN EXAM MODAL */}
      {assignModalExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-800">
                Giao Đề Kiểm Tra Cho Học Sinh
              </h3>
              <button
                type="button"
                onClick={() => setAssignModalExam(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-950">
                Đề: <strong>{assignModalExam.title}</strong> ({assignModalExam.questionIds.length} câu)
              </div>

              <div>
                <label className="block mb-1.5">Chọn lớp được giao:</label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((cls) => {
                    const checked = assignClasses.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() =>
                          setAssignClasses(
                            checked
                              ? assignClasses.filter((id) => id !== cls.id)
                              : [...assignClasses, cls.id]
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl border ${
                          checked
                            ? 'bg-teal-700 text-white border-teal-800'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        Lớp {cls.name} ({cls.studentCount} HS)
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Thời gian mở đề:</label>
                  <input
                    type="datetime-local"
                    value={assignOpensAt}
                    onChange={(e) => setAssignOpensAt(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1">Hạn đóng đề (Deadline):</label>
                  <input
                    type="datetime-local"
                    value={assignDeadline}
                    onChange={(e) => setAssignDeadline(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Thời lượng làm bài (phút):</label>
                  <input
                    type="number"
                    min={5}
                    value={assignDuration}
                    onChange={(e) => setAssignDuration(Number(e.target.value) || 45)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="block mb-1">Số lần làm tối đa:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={assignAttemptLimit}
                    onChange={(e) => setAssignAttemptLimit(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-center"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignShowScore}
                    onChange={(e) => setAssignShowScore(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Cho phép xem điểm ngay sau khi nộp (chỉ áp dụng nếu không có tự luận)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignShowAnswers}
                    onChange={(e) => setAssignShowAnswers(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Cho phép xem đáp án chi tiết sau khi công bố</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalExam(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800"
                >
                  Xác nhận Giao bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {exportModalExam && (
        <ExamExportModal
          exam={exportModalExam}
          matrix={matrices.find((m) => m.id === exportModalExam.matrixId)}
          questions={questions}
          onClose={() => setExportModalExam(null)}
        />
      )}
    </div>
  );
};
