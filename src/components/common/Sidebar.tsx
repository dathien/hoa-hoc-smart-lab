import React, { useEffect, useState } from 'react';
import { useChemStore } from '../../services/store';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCheck,
  FlaskConical,
  Layers,
  GraduationCap,
  Settings,
  UserCheck,
  Award,
  MessageSquare,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SubMenuItem {
  id: string;
  label: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  currentTab: string;
  currentSubTab?: string;
  onSelectTab: (tab: string, sub?: string) => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  currentSubTab = 'default',
  onSelectTab,
  isOpen = true,
  onCloseMobile,
}) => {
  const { activeRole, submissions } = useChemStore();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(currentTab);

  // By default only the currently active main group stays expanded
  useEffect(() => {
    setExpandedGroup(currentTab);
  }, [currentTab]);

  const pendingGradingCount = submissions.filter(
    (s) => s.submissionStatus === 'NEEDS_REVIEW'
  ).length;

  // TEACHER & ADMIN: EXACTLY 8 MAIN ITEMS WITHOUT NUMBER PREFIXES
  const teacherMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    {
      id: 'classes',
      label: 'Lớp học & Học sinh',
      icon: Users,
      subItems: [
        { id: 'class-list', label: 'Danh sách lớp & học sinh' },
        { id: 'homeroom', label: 'Lớp chủ nhiệm (11A1)' },
      ],
    },
    {
      id: 'learning',
      label: 'Học liệu & Kế hoạch',
      icon: BookOpen,
      subItems: [
        { id: 'lessons', label: 'Học liệu Hóa học (SGK)' },
        { id: 'periodic-table', label: 'Bảng tuần hoàn 118 nguyên tố' },
        { id: 'atoms-config', label: 'Nguyên tử & Cấu hình electron' },
        { id: 'molecules-3d', label: 'Phân tử & Cấu tạo 3D' },
        { id: 'encyclopedia', label: 'Bách khoa Hóa học' },
        { id: 'teaching-plan', label: 'Kế hoạch dạy học' },
        { id: 'review-plan', label: 'Kế hoạch ôn tập' },
        { id: 'study-log', label: 'Nhật ký học tập' },
      ],
    },
    {
      id: 'assignments',
      label: 'Bài tập & Kiểm tra',
      icon: FileCheck,
      badge: pendingGradingCount > 0 ? `${pendingGradingCount} bài` : undefined,
      subItems: [
        { id: 'overview', label: 'Tổng quan đề kiểm tra' },
        { id: 'create-exam', label: 'Tạo đề mới' },
        { id: 'matrix-spec', label: 'Ma trận & Bản đặc tả' },
        { id: 'question-bank', label: 'Ngân hàng câu hỏi' },
        { id: 'shuffle-variants', label: 'Trộn đề & Mã đề' },
        { id: 'rubrics-answers', label: 'Đáp án & Hướng dẫn chấm' },
        { id: 'created-exams', label: 'Đề đã lưu & Giao bài' },
      ],
    },
    {
      id: 'lab',
      label: 'Phòng thực hành 2D/3D',
      icon: FlaskConical,
      subItems: [
        { id: 'virtual-lab', label: 'Phòng thí nghiệm ảo 2D/3D' },
        { id: 'reactions-ions', label: 'Phản ứng & Ion' },
        { id: 'electrochemistry', label: 'Điện hóa & Pin' },
        { id: 'titration', label: 'Dung dịch & Chuẩn độ' },
        { id: 'stoichiometry', label: 'Phương trình & Tính toán' },
      ],
    },
    {
      id: 'flashcard',
      label: 'Flashcard Hóa học',
      icon: Layers,
      subItems: [
        { id: 'flashcard', label: 'Flashcard Hóa học' },
        { id: 'mnemonic', label: 'Bí kíp Dãy Hoạt Động' },
      ],
    },
    {
      id: 'results-parents',
      label: 'Kết quả & Phụ huynh',
      icon: GraduationCap,
      subItems: [
        { id: 'results', label: 'Bảng điểm & Công bố' },
        { id: 'zalo', label: 'Tin nhắn Phụ huynh' },
      ],
    },
    {
      id: 'admin-system',
      label: 'Quản trị hệ thống',
      icon: Settings,
      subItems: [
        { id: 'department', label: 'Chuyên môn Tổ Hóa' },
        { id: 'settings', label: 'Cài đặt & Dữ liệu' },
      ],
    },
  ];

  // STUDENT MENU: No number prefixes
  const studentMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    {
      id: 'learning',
      label: 'Học liệu & Bài học',
      icon: BookOpen,
      subItems: [
        { id: 'lessons', label: 'Bài học Hóa học' },
        { id: 'periodic-table', label: 'Bảng tuần hoàn 118 nguyên tố' },
        { id: 'atoms-config', label: 'Nguyên tử & Cấu hình electron' },
        { id: 'molecules-3d', label: 'Phân tử & Cấu tạo 3D' },
        { id: 'encyclopedia', label: 'Bách khoa Hóa học' },
      ],
    },
    { id: 'assignments', label: 'Bài tập & Kiểm tra', icon: FileCheck },
    {
      id: 'lab',
      label: 'Phòng thực hành 2D/3D',
      icon: FlaskConical,
      subItems: [
        { id: 'virtual-lab', label: 'Phòng thí nghiệm ảo 2D/3D' },
        { id: 'reactions-ions', label: 'Phản ứng & Ion' },
        { id: 'electrochemistry', label: 'Điện hóa & Pin' },
        { id: 'titration', label: 'Dung dịch & Chuẩn độ' },
        { id: 'stoichiometry', label: 'Phương trình & Tính toán' },
      ],
    },
    {
      id: 'flashcard',
      label: 'Flashcard Hóa học',
      icon: Layers,
      subItems: [
        { id: 'flashcard', label: 'Flashcard Hóa học' },
        { id: 'mnemonic', label: 'Trò chơi Dãy Hoạt Động' },
      ],
    },
    { id: 'results-parents', label: 'Tiến độ & Kết quả', icon: Award },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserCheck },
  ];

  // PARENT MENU: No number prefixes
  const parentMenuItems: MenuItem[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'assignments', label: 'Bài tập & Kiểm tra', icon: FileCheck },
    { id: 'results-parents', label: 'Kết quả học tập', icon: Award },
    { id: 'feedback', label: 'Nhận xét & Tin nhắn', icon: MessageSquare },
    { id: 'profile', label: 'Hồ sơ học sinh', icon: Users },
  ];

  let items = teacherMenuItems;
  if (activeRole === 'STUDENT') items = studentMenuItems;
  if (activeRole === 'PARENT') items = parentMenuItems;

  const resolveDefaultSub = (item: MenuItem): string | undefined => {
    if (!item.subItems || item.subItems.length === 0) return undefined;
    return item.subItems[0].id;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && onCloseMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Panel - Single scroll container, collapsible on Desktop */}
      <aside
        className={`${
          isCollapsed ? 'md:w-20' : 'md:w-72'
        } w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static inset-y-0 left-0 pt-16 md:pt-0 shadow-lg md:shadow-none overflow-hidden`}
      >
        {/* Header Badge + Collapse Toggle */}
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider truncate">
                {activeRole === 'TEACHER'
                  ? 'CỔNG GIÁO VIÊN'
                  : activeRole === 'STUDENT'
                  ? 'CỔNG HỌC SINH'
                  : activeRole === 'PARENT'
                  ? 'CỔNG PHỤ HUYNH'
                  : 'CỔNG QUẢN TRỊ'}
              </span>
            </div>
          )}

          <div className={`flex items-center gap-1.5 ${isCollapsed ? 'w-full justify-center' : ''}`}>
            {!isCollapsed && (
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                {activeRole === 'TEACHER'
                  ? 'Giáo viên'
                  : activeRole === 'STUDENT'
                  ? 'Học sinh'
                  : activeRole === 'PARENT'
                  ? 'Phụ huynh'
                  : activeRole}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed((c) => !c)}
              title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
              className="hidden md:flex p-1.5 text-slate-500 hover:text-teal-800 hover:bg-slate-200/70 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation List - Single scroll area, zero horizontal overflow */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto overflow-x-hidden">
          {items.map((item) => {
            const Icon = item.icon;
            const isActiveGroup = currentTab === item.id;
            const hasSub = Boolean(item.subItems && item.subItems.length > 0);
            const isExpanded = !isCollapsed && hasSub && expandedGroup === item.id;

            const resolvedSub =
              currentSubTab === 'default'
                ? resolveDefaultSub(item)
                : currentSubTab === 'handbook'
                ? 'encyclopedia'
                : currentSubTab;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (isCollapsed) {
                      onSelectTab(item.id, resolveDefaultSub(item));
                      if (onCloseMobile) onCloseMobile();
                      return;
                    }
                    if (!isActiveGroup) {
                      setExpandedGroup(item.id);
                      onSelectTab(item.id, resolveDefaultSub(item));
                      if (!hasSub && onCloseMobile) onCloseMobile();
                    } else if (hasSub) {
                      setExpandedGroup((prev) => (prev === item.id ? null : item.id));
                    }
                  }}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
                  } py-2.5 rounded-xl text-[16px] font-semibold transition-all text-left min-h-[46px] ${
                    isActiveGroup
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActiveGroup ? 'text-teal-700' : 'text-slate-400'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="text-[11px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                      {hasSub &&
                        (isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-teal-700" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        ))}
                    </div>
                  )}
                </button>

                {/* Collapsible Sub-menu items */}
                {isExpanded && item.subItems && (
                  <div className="ml-4 pl-3 border-l-2 border-teal-100 space-y-0.5 py-0.5">
                    {item.subItems.map((sub) => {
                      const isSubActive = isActiveGroup && resolvedSub === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            onSelectTab(item.id, sub.id);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[14px] transition-all flex items-center gap-2 ${
                            isSubActive
                              ? 'bg-teal-700 text-white font-bold shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isSubActive ? 'bg-amber-300' : 'bg-slate-300'
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer info banner */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="font-semibold text-slate-600">
              {activeRole === 'TEACHER' || activeRole === 'ADMIN' || activeRole === 'DEPARTMENT_HEAD'
                ? '8 phân hệ chính'
                : 'Hóa học THPT'}
            </span>
            <span>Chuẩn GDPT 2018</span>
          </div>
        )}
      </aside>
    </>
  );
};
