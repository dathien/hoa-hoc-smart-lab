import React, { useState } from 'react';
import { ChemStoreProvider, useChemStore } from './services/store';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Teacher & Admin Views
import { TeacherOverview } from './components/teacher/TeacherOverview';
import { TeacherClassesStudents } from './components/teacher/TeacherClassesStudents';
import { TeacherExamsGrading } from './components/teacher/TeacherExamsGrading';
import { TeacherGradingReview } from './components/teacher/TeacherGradingReview';
import { TeacherZaloMessenger } from './components/teacher/TeacherZaloMessenger';
import { TeacherTeachingPlan } from './components/teacher/TeacherTeachingPlan';
import { TeacherLessons } from './components/teacher/TeacherLessons';

// Student & Interactive Views
import { StudentExamPortal } from './components/student/StudentExamPortal';
import { ScientificFlashcards, SCIENTIFIC_FLASHCARDS } from './components/flashcard/ScientificFlashcards';
import { MnemonicGame } from './components/game/MnemonicGame';
import { LabWorkspace, LabSubTabId } from './components/lab/LabWorkspace';
import { ParentPortal } from './components/parent/ParentPortal';

// Chemistry Core Modules
import { PeriodicTable118 } from './components/chemistry/PeriodicTable118';
import { Atom3DExplorer } from './components/chemistry/Atom3DExplorer';
import { Molecules3DExplorer } from './components/chemistry/Molecules3DExplorer';
import { ChemistryEncyclopedia } from './components/chemistry/ChemistryEncyclopedia';

import {
  Users,
  UserCheck,
  Calendar,
  BookOpen,
  Award,
  MessageSquare,
  Gamepad2,
  Bookmark,
  RotateCcw,
  Briefcase,
  Settings,
  TrendingUp,
  Grid3X3,
  Atom,
  Box,
} from 'lucide-react';

const LAB_SUB_IDS: LabSubTabId[] = [
  'virtual-lab',
  'reactions-ions',
  'electrochemistry',
  'titration',
  'stoichiometry',
];

const AppContent: React.FC = () => {
  const { activeRole, currentUser, submissions, resetAllData } = useChemStore();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [subTab, setSubTab] = useState<string>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Shared cross-navigation element context (Periodic Table <-> Atom 3D <-> Encyclopedia)
  const [selectedElementZ, setSelectedElementZ] = useState<number>(11);
  const [atomFocusMode, setAtomFocusMode] = useState<'3d' | 'config'>('3d');

  // Reset tab when activeRole changes
  React.useEffect(() => {
    setCurrentTab('overview');
    setSubTab('default');
  }, [activeRole]);

  // Smart navigator that handles both 8 main tabs and legacy/deep-link sub-tabs
  const navigateTo = (tab: string, sub?: string) => {
    if (tab === 'overview') {
      setCurrentTab('overview');
      setSubTab('default');
      return;
    }

    // 2. Classes & Students
    if (tab === 'classes' || tab === 'class-list') {
      setCurrentTab('classes');
      setSubTab(sub || 'class-list');
      return;
    }
    if (tab === 'homeroom') {
      setCurrentTab('classes');
      setSubTab('homeroom');
      return;
    }

    // 3. Learning, Periodic Table, Atom 3D, Molecules 3D, Encyclopedia & Plans
    if (tab === 'learning') {
      setCurrentTab('learning');
      const normalized = sub === 'handbook' ? 'encyclopedia' : sub;
      setSubTab(normalized || 'lessons');
      return;
    }
    if (
      tab === 'lessons' ||
      tab === 'teaching-plan' ||
      tab === 'review-plan' ||
      tab === 'study-log' ||
      tab === 'periodic-table' ||
      tab === 'atoms-config' ||
      tab === 'molecules-3d' ||
      tab === 'encyclopedia'
    ) {
      setCurrentTab('learning');
      setSubTab(tab);
      return;
    }
    if (tab === 'handbook') {
      setCurrentTab('learning');
      setSubTab('encyclopedia');
      return;
    }

    // 4. Assignments & Assessments
    if (tab === 'assignments') {
      setCurrentTab('assignments');
      if (sub === 'overview') setSubTab('overview');
      else if (sub === 'matrix' || sub === 'matrix-spec') setSubTab('matrix-spec');
      else if (sub === 'create-exam') setSubTab('create-exam');
      else if (sub === 'questions' || sub === 'question-bank') setSubTab('question-bank');
      else if (sub === 'shuffle' || sub === 'shuffle-variants') setSubTab('shuffle-variants');
      else if (sub === 'created-exams' || sub === 'exams') setSubTab('created-exams');
      else if (sub === 'rubrics' || sub === 'rubrics-answers') setSubTab('rubrics-answers');
      else if (sub === 'grading' || sub === 'assign-track') setSubTab('assign-track');
      else setSubTab(sub || 'overview');
      return;
    }
    if (tab === 'exams' || tab === 'exercises') {
      setCurrentTab('assignments');
      setSubTab('created-exams');
      return;
    }
    if (tab === 'questions') {
      setCurrentTab('assignments');
      setSubTab('question-bank');
      return;
    }
    if (tab === 'grading') {
      setCurrentTab('assignments');
      setSubTab('assign-track');
      return;
    }

    // 5. Practical Lab 2D/3D & Interactive Simulations
    if (tab === 'lab') {
      setCurrentTab('lab');
      const validSub = sub && LAB_SUB_IDS.includes(sub as LabSubTabId) ? sub : 'virtual-lab';
      setSubTab(validSub);
      return;
    }
    if (LAB_SUB_IDS.includes(tab as LabSubTabId)) {
      setCurrentTab('lab');
      setSubTab(tab);
      return;
    }

    // 6. Flashcard Hóa học & Trò chơi
    if (tab === 'flashcard' || tab === 'flashcards' || tab === 'hero-cards') {
      setCurrentTab('flashcard');
      setSubTab(sub === 'mnemonic' ? 'mnemonic' : 'flashcard');
      return;
    }
    if (tab === 'mnemonic') {
      setCurrentTab('flashcard');
      setSubTab('mnemonic');
      return;
    }

    // 7. Results & Parents
    if (tab === 'results-parents') {
      setCurrentTab('results-parents');
      setSubTab(sub || 'results');
      return;
    }
    if (tab === 'results' || tab === 'zalo') {
      setCurrentTab('results-parents');
      setSubTab(tab);
      return;
    }

    // 8. Admin & System
    if (tab === 'admin-system') {
      setCurrentTab('admin-system');
      setSubTab(sub || 'department');
      return;
    }
    if (tab === 'department' || tab === 'settings') {
      setCurrentTab('admin-system');
      setSubTab(tab);
      return;
    }

    setCurrentTab(tab);
    if (sub) setSubTab(sub);
  };

  // Cross-module element deep links from Periodic Table
  const handleOpenAtomFromPeriodic = (z: number, mode: '3d' | 'config' = '3d') => {
    setSelectedElementZ(z);
    setAtomFocusMode(mode);
    navigateTo('learning', 'atoms-config');
  };

  const handleOpenKnowledgeFromPeriodic = (z: number) => {
    setSelectedElementZ(z);
    navigateTo('learning', 'encyclopedia');
  };

  // Render SubTab bar helper
  const renderSubTabs = (
    tabs: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[],
    activeSub: string,
    onSelect: (id: string) => void
  ) => {
    return (
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeSub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`px-3.5 py-2 text-[15px] font-bold rounded-xl transition-all flex items-center gap-2 min-h-[42px] ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
              {t.badge && (
                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full text-xs font-black ml-1 shadow-xs">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderLearningView = (isTeacher: boolean) => {
    const learningSubTabs = isTeacher
      ? [
          { id: 'lessons', label: 'Học liệu Hóa học (SGK)', icon: BookOpen },
          { id: 'periodic-table', label: 'Bảng tuần hoàn 118', icon: Grid3X3 },
          { id: 'atoms-config', label: 'Nguyên tử & Cấu hình e', icon: Atom },
          { id: 'molecules-3d', label: 'Phân tử & Cấu tạo 3D', icon: Box },
          { id: 'encyclopedia', label: 'Bách khoa Hóa học', icon: Bookmark },
          { id: 'teaching-plan', label: 'Kế hoạch dạy học', icon: Calendar },
          { id: 'review-plan', label: 'Kế hoạch ôn tập', icon: TrendingUp },
          { id: 'study-log', label: 'Nhật ký học tập', icon: Calendar },
        ]
      : [
          { id: 'lessons', label: 'Bài học Hóa học', icon: BookOpen },
          { id: 'periodic-table', label: 'Bảng tuần hoàn 118', icon: Grid3X3 },
          { id: 'atoms-config', label: 'Nguyên tử & Cấu hình e', icon: Atom },
          { id: 'molecules-3d', label: 'Phân tử & Cấu tạo 3D', icon: Box },
          { id: 'encyclopedia', label: 'Bách khoa Hóa học', icon: Bookmark },
        ];

    const normalizedSub = subTab === 'handbook' ? 'encyclopedia' : subTab;
    const currentLearningSub = normalizedSub === 'default' ? 'lessons' : normalizedSub;

    return (
      <div className="space-y-4">
        {renderSubTabs(learningSubTabs, currentLearningSub, setSubTab)}

        {currentLearningSub === 'lessons' && <TeacherLessons />}
        {currentLearningSub === 'periodic-table' && (
          <PeriodicTable118
            selectedZ={selectedElementZ}
            onSelectZ={setSelectedElementZ}
            onOpenAtom3D={handleOpenAtomFromPeriodic}
            onOpenKnowledge={(el) => handleOpenKnowledgeFromPeriodic(el.z)}
          />
        )}
        {currentLearningSub === 'atoms-config' && (
          <Atom3DExplorer
            selectedZ={selectedElementZ}
            onSelectZ={setSelectedElementZ}
            initialFocus={atomFocusMode}
          />
        )}
        {currentLearningSub === 'molecules-3d' && <Molecules3DExplorer />}
        {currentLearningSub === 'encyclopedia' && (
          <ChemistryEncyclopedia
            selectedElementZ={selectedElementZ}
            onSelectElementZ={setSelectedElementZ}
            onInspectAtom={(z) => handleOpenAtomFromPeriodic(z, '3d')}
            onOpenPeriodic={() => navigateTo('learning', 'periodic-table')}
          />
        )}
        {isTeacher && currentLearningSub === 'teaching-plan' && <TeacherTeachingPlan />}
        {isTeacher && currentLearningSub === 'review-plan' && <TeacherExamsGrading />}
        {isTeacher && currentLearningSub === 'study-log' && (
          <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Nhật Ký Học Tập &amp; Hoạt Động Giảng Dạy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ghi nhận tự động các hoạt động nộp bài, làm bài tập, chấm điểm và trao đổi với phụ huynh.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                Tự động ghi nhật ký
              </span>
            </div>
            <div className="space-y-3 pt-2">
              {submissions.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">{s.studentName}</span> ({s.studentCode})
                    đã nộp bài <strong>{s.examTitle}</strong> vào lúc{' '}
                    {new Date(s.submittedAt).toLocaleTimeString('vi-VN')} ngày{' '}
                    {new Date(s.submittedAt).toLocaleDateString('vi-VN')}.
                    <span className="text-teal-700 font-semibold block mt-0.5">
                      Trạng thái chấm: {s.submissionStatus} · Công bố điểm: {s.publishStatus}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                    {s.finalScore ? `${s.finalScore} điểm` : 'Chờ duyệt'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main content renderer based on tab and role
  const renderTabContent = () => {
    // ==========================================
    // 1. TEACHER, ADMIN, DEPARTMENT_HEAD PORTAL
    // ==========================================
    if (activeRole === 'TEACHER' || activeRole === 'ADMIN' || activeRole === 'DEPARTMENT_HEAD') {
      switch (currentTab) {
        // MỤC 1: TỔNG QUAN
        case 'overview':
          return <TeacherOverview onNavigate={navigateTo} />;

        // MỤC 2: LỚP HỌC & HỌC SINH
        case 'classes': {
          const classSubTabs = [
            { id: 'class-list', label: 'Quản lý Lớp học & Học sinh', icon: Users },
            { id: 'homeroom', label: 'Lớp Chủ Nhiệm (11A1)', icon: UserCheck },
          ];
          const currentClassSub = subTab === 'default' ? 'class-list' : subTab;

          return (
            <div className="space-y-4">
              {renderSubTabs(classSubTabs, currentClassSub, setSubTab)}

              {currentClassSub === 'homeroom' ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800">
                        Lớp Chủ Nhiệm 11A1 (39 Học Sinh)
                      </h2>
                      <p className="text-[17px] text-slate-600 mt-1 font-medium">
                        GVCN: Cô Trần Thị Mai Hương · Năm học 2024 - 2025 · Ban Tự nhiên KHTN
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-teal-50 text-teal-800 text-[16px] font-bold rounded-xl border border-teal-200">
                      Sĩ số: 39/39 (100% Chuyên cần)
                    </span>
                  </div>
                  <TeacherClassesStudents />
                </div>
              ) : (
                <TeacherClassesStudents />
              )}
            </div>
          );
        }

        // MỤC 3: HỌC LIỆU & KẾ HOẠCH (Tích hợp Bảng tuần hoàn 118, Nguyên tử 3D, Phân tử 3D, Bách khoa)
        case 'learning':
          return renderLearningView(true);

        // MỤC 4: BÀI TẬP & KIỂM TRA (7 phân hệ tích hợp)
        case 'assignments': {
          const currentAssignmentSub = subTab === 'default' ? 'overview' : subTab;
          return <TeacherExamsGrading initialSubTab={currentAssignmentSub} />;
        }

        // MỤC 5: PHÒNG THỰC HÀNH 2D/3D (5 phân hệ tích hợp)
        case 'lab': {
          const currentLabSub = LAB_SUB_IDS.includes(subTab as LabSubTabId)
            ? (subTab as LabSubTabId)
            : 'virtual-lab';
          return <LabWorkspace initialSubTab={currentLabSub} onSelectSubTab={setSubTab} />;
        }

        // MỤC 6: FLASHCARD HÓA HỌC & TRÒ CHƠI
        case 'flashcard': {
          const flashcardSubTabs = [
            { id: 'flashcard', label: 'Flashcard Hóa học', icon: BookOpen },
            { id: 'mnemonic', label: 'Trò Chơi Bí Kíp Dãy Hoạt Động', icon: Gamepad2 },
          ];
          const currentFlashcardSub = subTab === 'mnemonic' ? 'mnemonic' : 'flashcard';

          return (
            <div className="space-y-4">
              {renderSubTabs(flashcardSubTabs, currentFlashcardSub, setSubTab)}

              {currentFlashcardSub === 'flashcard' && <ScientificFlashcards />}
              {currentFlashcardSub === 'mnemonic' && <MnemonicGame />}
            </div>
          );
        }

        // MỤC 7: KẾT QUẢ & PHỤ HUYNH
        case 'results-parents': {
          const resultsSubTabs = [
            { id: 'results', label: 'Bảng Điểm & Kết Quả Công Bố', icon: Award },
            { id: 'zalo', label: 'Tin Nhắn Phụ Huynh (Zalo SMS)', icon: MessageSquare },
          ];
          const currentResultsSub = subTab === 'default' ? 'results' : subTab;

          return (
            <div className="space-y-4">
              {renderSubTabs(resultsSubTabs, currentResultsSub, setSubTab)}

              {currentResultsSub === 'results' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800">
                        Bảng Điểm Tổng Hợp &amp; Kết Quả Công Bố
                      </h2>
                      <p className="text-[17px] text-slate-600 mt-1 font-medium">
                        Theo dõi kết quả học tập của học sinh 3 khối 10, 11, 12 và liên kết thông báo phụ huynh.
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-teal-50 text-teal-800 text-[16px] font-bold rounded-xl border border-teal-200">
                      Chuẩn GDPT 2018
                    </span>
                  </div>
                  <TeacherGradingReview />
                </div>
              )}
              {currentResultsSub === 'zalo' && <TeacherZaloMessenger />}
            </div>
          );
        }

        // MỤC 8: QUẢN TRỊ HỆ THỐNG
        case 'admin-system': {
          const adminSubTabs = [
            { id: 'department', label: 'Quản Lý Chuyên Môn Tổ Hóa', icon: Briefcase },
            { id: 'settings', label: 'Cài Đặt Hệ Thống & Dữ Liệu', icon: Settings },
          ];
          const currentAdminSub = subTab === 'default' ? 'department' : subTab;

          return (
            <div className="space-y-4">
              {renderSubTabs(adminSubTabs, currentAdminSub, setSubTab)}

              {currentAdminSub === 'department' && (
                <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-2xl font-black text-slate-800">Quản Lý Chuyên Môn Tổ Hóa Học</h3>
                  <p className="text-[17px] text-slate-600 font-medium">
                    Tổ trưởng chuyên môn: ThS. Lê Vũ Phương · Phê duyệt kế hoạch dạy học và ngân hàng đề thi.
                  </p>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-[17px] text-emerald-950 font-semibold leading-relaxed">
                    ✓ Tất cả kế hoạch dạy học học kỳ I đã được thẩm định đúng chuẩn chương trình GDPT 2018.
                  </div>
                </div>
              )}

              {currentAdminSub === 'settings' && (
                <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
                  <h3 className="text-2xl font-black text-slate-800">Cài Đặt Hệ Thống &amp; Cơ Sở Dữ Liệu</h3>
                  <div className="space-y-4 text-[17px] text-slate-700">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <strong className="text-slate-900 block font-bold">Trạng thái dữ liệu:</strong>
                      <p>108 học sinh được phân bổ đầy đủ trên 3 lớp 10A1, 11A1, 12A1.</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <strong className="text-slate-900 block font-bold">Quy tắc bảo mật chấm điểm:</strong>
                      <p>Điểm chỉ được gửi đến học sinh &amp; phụ huynh khi giáo viên công bố chính thức.</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu gốc mẫu không?')) {
                          resetAllData();
                          alert('Đã khôi phục dữ liệu gốc thành công!');
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-3 text-[17px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors min-h-[44px]"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Khôi phục dữ liệu mẫu ban đầu</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }

        default:
          return <TeacherOverview onNavigate={navigateTo} />;
      }
    }

    // ==========================================
    // 2. STUDENT PORTAL
    // ==========================================
    if (activeRole === 'STUDENT') {
      switch (currentTab) {
        case 'overview':
          return (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-700 to-slate-900 p-6 rounded-2xl text-white shadow-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-widest block mb-1">
                    Cổng học tập học sinh
                  </span>
                  <h2 className="text-xl font-black">Xin chào {currentUser.name}!</h2>
                  <p className="text-xs text-teal-100 mt-1">
                    Lớp <strong>11A1</strong> · Bạn có <strong>2 bài kiểm tra</strong> đang mở làm bài.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('assignments')}
                  className="px-4 py-2 text-xs font-bold text-teal-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm"
                >
                  Làm bài kiểm tra ngay
                </button>
              </div>

              {/* Student Overview Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => navigateTo('learning', 'periodic-table')}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Bảng tuần hoàn &amp; 3D
                  </span>
                  <div className="text-2xl font-black text-teal-700 mt-1">118 nguyên tố</div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Cấu hình electron, xu hướng &amp; phân tử 3D
                  </span>
                </div>

                <div
                  onClick={() => navigateTo('flashcard')}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Flashcard Hóa học 3D
                  </span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {SCIENTIFIC_FLASHCARDS.length} thẻ
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Mô hình phân tử 3D tương tác</span>
                </div>

                <div
                  onClick={() => navigateTo('lab')}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Phòng thực hành 2D/3D
                  </span>
                  <div className="text-2xl font-black text-purple-600 mt-1">Mô phỏng 2D/3D</div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Hóa học 10, 11, 12 GDPT 2018</span>
                </div>
              </div>

              <StudentExamPortal />
            </div>
          );

        case 'learning':
          return renderLearningView(false);

        case 'assignments':
        case 'results-parents':
          return <StudentExamPortal />;

        case 'lab': {
          const currentLabSub = LAB_SUB_IDS.includes(subTab as LabSubTabId)
            ? (subTab as LabSubTabId)
            : 'virtual-lab';
          return <LabWorkspace initialSubTab={currentLabSub} onSelectSubTab={setSubTab} />;
        }

        case 'flashcard': {
          const studentFlashcardTabs = [
            { id: 'flashcard', label: 'Flashcard Hóa học', icon: BookOpen },
            { id: 'mnemonic', label: 'Trò Chơi Dãy Hoạt Động', icon: Gamepad2 },
          ];
          const curFlashcardSub = subTab === 'mnemonic' ? 'mnemonic' : 'flashcard';
          return (
            <div className="space-y-4">
              {renderSubTabs(studentFlashcardTabs, curFlashcardSub, setSubTab)}
              {curFlashcardSub === 'flashcard' && <ScientificFlashcards />}
              {curFlashcardSub === 'mnemonic' && <MnemonicGame />}
            </div>
          );
        }

        case 'profile':
          return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-md space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Hồ Sơ Học Sinh</h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Họ và tên:</span>
                  <span className="font-bold text-slate-800">{currentUser.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Mã định danh:</span>
                  <span className="font-mono font-bold text-teal-800">HS11015</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Lớp:</span>
                  <span className="font-bold text-slate-800">11A1</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Bộ sách theo học:</span>
                  <span className="font-semibold text-slate-700">Kết nối tri thức với cuộc sống</span>
                </div>
              </div>
            </div>
          );

        default:
          return <StudentExamPortal />;
      }
    }

    // ==========================================
    // 3. PARENT PORTAL
    // ==========================================
    if (activeRole === 'PARENT') {
      return <ParentPortal />;
    }

    return <TeacherOverview onNavigate={navigateTo} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Streamlined 8-Item Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          currentSubTab={subTab}
          onSelectTab={(tabId, subId) => navigateTo(tabId, subId)}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto space-y-6 w-full flex-1">
            {renderTabContent()}
          </div>

          {/* Footer Toàn Ứng Dụng: Hiển thị thống nhất cho Giáo viên, Học sinh và Phụ huynh */}
          <footer className="w-full mt-12 py-5 border-t border-slate-200 text-center text-[15px] md:text-[16px] text-slate-500 font-medium select-none">
            Copyright © 2026 – Phát triển bởi Thầy Hồ Nguyễn Đa Thiện
          </footer>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ChemStoreProvider>
      <AppContent />
    </ChemStoreProvider>
  );
}
