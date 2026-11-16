import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  GUIDE_CHAPTERS,
  GUIDE_FAQS,
  GuideChapter,
  QUICK_START_STEPS,
  ROLE_GUIDES,
  WORKED_EXAMPLES,
} from '../../data/userGuideData';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Compass,
  ExternalLink,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  ListChecks,
  MapPin,
  Search,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { UserRole } from '../../types/chem';

interface UserGuidePageProps {
  activeRole: UserRole;
  initialChapterId?: string | null;
  originLabel?: string | null;
  onReturnToWorkspace: () => void;
  onOpenFeature: (tab: string, sub?: string) => void;
}

type GuideSectionFilter = 'all' | 'quickstart' | 'chapters' | 'examples' | 'faq';

export const UserGuidePage: React.FC<UserGuidePageProps> = ({
  activeRole,
  initialChapterId,
  originLabel,
  onReturnToWorkspace,
  onOpenFeature,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<GuideSectionFilter>('all');
  const [selectedRoleTab, setSelectedRoleTab] = useState<'teacher' | 'student' | 'parent' | 'admin'>(() => {
    if (activeRole === 'STUDENT') return 'student';
    if (activeRole === 'PARENT') return 'parent';
    if (activeRole === 'ADMIN' || activeRole === 'DEPARTMENT_HEAD') return 'admin';
    return 'teacher';
  });

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    GUIDE_CHAPTERS.forEach((ch, idx) => {
      initial[ch.id] = initialChapterId ? ch.id === initialChapterId : idx === 0;
    });
    return initial;
  });

  const [expandedExamples, setExpandedExamples] = useState<Record<string, boolean>>({});
  const chapterRefs = useRef<Record<string, HTMLElement | null>>({});
  const topContainerRef = useRef<HTMLDivElement | null>(null);

  const isTeacherOrAdmin =
    activeRole === 'TEACHER' || activeRole === 'ADMIN' || activeRole === 'DEPARTMENT_HEAD';

  // Sync deep-linked chapter when opening guide from inside a module
  useEffect(() => {
    if (initialChapterId) {
      setSearchQuery('');
      setSectionFilter('all');
      setExpandedChapters((prev) => ({
        ...prev,
        [initialChapterId]: true,
      }));
      const timer = setTimeout(() => {
        const target = chapterRefs.current[initialChapterId];
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 90);
      return () => clearTimeout(timer);
    } else if (topContainerRef.current) {
      topContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialChapterId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredChapters = useMemo(() => {
    if (!normalizedQuery) return GUIDE_CHAPTERS;
    return GUIDE_CHAPTERS.filter((ch) => {
      const text = [
        ch.title,
        ch.purpose,
        ch.menuLocation,
        ...ch.prerequisites,
        ...ch.steps.map((s) => `${s.title} ${s.detail} ${(s.buttons || []).join(' ')}`),
        ch.example.title,
        ch.example.scenario,
        ch.example.outcome,
        ch.expectedResult,
        ...ch.troubleshooting.map((t) => `${t.issue} ${t.cause} ${t.solution}`),
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredExamples = useMemo(() => {
    if (!normalizedQuery) return WORKED_EXAMPLES;
    return WORKED_EXAMPLES.filter((ex) => {
      const text = [ex.title, ex.category, ex.goal, ...ex.steps, ex.expectedOutcome]
        .join(' ')
        .toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) return GUIDE_FAQS;
    return GUIDE_FAQS.filter((f) =>
      `${f.question} ${f.answer}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const allTroubleshootingRows = useMemo(() => {
    const items: { chapterId: string; chapterTitle: string; issue: string; cause: string; solution: string }[] = [];
    GUIDE_CHAPTERS.forEach((ch) => {
      ch.troubleshooting.forEach((t) => {
        items.push({
          chapterId: ch.id,
          chapterTitle: `Chương ${ch.chapterNumber}: ${ch.shortTitle}`,
          issue: t.issue,
          cause: t.cause,
          solution: t.solution,
        });
      });
    });
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      `${item.chapterTitle} ${item.issue} ${item.cause} ${item.solution}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllChapters = () => {
    const next: Record<string, boolean> = {};
    GUIDE_CHAPTERS.forEach((ch) => {
      next[ch.id] = true;
    });
    setExpandedChapters(next);
  };

  const collapseAllChapters = () => {
    const next: Record<string, boolean> = {};
    GUIDE_CHAPTERS.forEach((ch) => {
      next[ch.id] = false;
    });
    setExpandedChapters(next);
  };

  const jumpToChapter = (chapterId: string) => {
    setSectionFilter((prev) => (prev === 'quickstart' || prev === 'examples' || prev === 'faq' ? 'all' : prev));
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: true }));
    setTimeout(() => {
      const el = chapterRefs.current[chapterId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleOpenChapterFeature = (ch: GuideChapter) => {
    if (ch.targetRoute.teacherOnly && !isTeacherOrAdmin) {
      onOpenFeature('overview');
      return;
    }
    onOpenFeature(ch.targetRoute.tab, ch.targetRoute.sub);
  };

  const activeRoleGuide =
    ROLE_GUIDES.find((r) => r.id === selectedRoleTab) || ROLE_GUIDES[0];

  const showQuickStartAndRoles = sectionFilter === 'all' || sectionFilter === 'quickstart';
  const showChapters = sectionFilter === 'all' || sectionFilter === 'chapters';
  const showExamples = sectionFilter === 'all' || sectionFilter === 'examples';
  const showFaqAndErrors = sectionFilter === 'all' || sectionFilter === 'faq';

  return (
    <div ref={topContainerRef} className="space-y-6 text-slate-900">
      {/* Top Banner + Back to Workspace Button */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Tài liệu hướng dẫn sử dụng tích hợp trực tiếp</span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 leading-tight tracking-tight">
              Hướng Dẫn Sử Dụng CHEMISTRY EDU PRO
            </h1>
            <p className="text-[15px] sm:text-[16px] text-slate-600 leading-[1.6] max-w-3xl">
              Hướng dẫn từng bước từ cơ bản đến nâng cao cho Giáo viên, Học sinh, Phụ huynh và Quản trị viên. Mọi dữ liệu và nội dung bạn đang soạn ở màn hình trước luôn được giữ nguyên.
            </p>
          </div>

          <button
            type="button"
            onClick={onReturnToWorkspace}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-[15px] shadow-xs transition-colors min-h-[46px] shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>
              {originLabel ? `Quay lại: ${originLabel}` : 'Quay lại chức năng đang sử dụng'}
            </span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm hướng dẫn (VD: ma trận, trộn đề, H2SO4, ion, thí nghiệm 3D, BaSO4, phụ huynh...)"
              className="w-full pl-10 pr-10 py-2.5 text-[15px] bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'Tất cả' },
                { id: 'quickstart', label: 'Bắt đầu & Vai trò' },
                { id: 'chapters', label: `14 Chương (${filteredChapters.length})` },
                { id: 'examples', label: `13 Thực hành mẫu (${filteredExamples.length})` },
                { id: 'faq', label: 'Hỏi đáp & Lỗi' },
              ] as { id: GuideSectionFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSectionFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-[14px] font-bold transition-colors min-h-[40px] ${
                  sectionFilter === tab.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Sticky TOC Sidebar (Desktop) + Content Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table of Contents */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 lg:sticky lg:top-20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-700" />
              <span>Mục Lục Hướng Dẫn</span>
            </h2>
          </div>

          {/* Mobile/Tablet Quick Jump Dropdown */}
          <div className="lg:hidden">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
              Đi nhanh tới chương:
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) jumpToChapter(e.target.value);
              }}
              className="w-full px-3 py-2.5 text-[15px] font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            >
              <option value="">-- Chọn một chương từ 1 đến 14 --</option>
              {GUIDE_CHAPTERS.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Chương {ch.chapterNumber}: {ch.shortTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Chapter List */}
          <div className="hidden lg:block space-y-1 max-h-[65vh] overflow-y-auto pr-1">
            {GUIDE_CHAPTERS.map((ch) => {
              const isOpen = Boolean(expandedChapters[ch.id]);
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => jumpToChapter(ch.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[14px] transition-colors flex items-center gap-2.5 ${
                    isOpen
                      ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                      : 'text-slate-700 hover:bg-slate-100 font-medium border border-transparent'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                    {ch.chapterNumber}
                  </span>
                  <span className="truncate">{ch.shortTitle}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={expandAllChapters}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold min-h-[38px]"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>Mở tất cả</span>
            </button>
            <button
              type="button"
              onClick={collapseAllChapters}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold min-h-[38px]"
            >
              <ChevronsDownUp className="w-3.5 h-3.5" />
              <span>Thu gọn tất cả</span>
            </button>
          </div>
        </aside>

        {/* Guide Body */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* SECTION 1 & 2: QUICK START + ROLE GUIDES */}
          {showQuickStartAndRoles && !normalizedQuery && (
            <>
              {/* Quick Start */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-teal-700 shrink-0" />
                  <h2 className="text-[19px] sm:text-[20px] font-black text-slate-900">
                    Hướng dẫn bắt đầu nhanh (4 bước làm quen hệ thống)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUICK_START_STEPS.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-teal-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {st.stepNumber}
                        </span>
                        <h3 className="text-[16px] font-bold text-slate-900">{st.title}</h3>
                      </div>
                      <p className="text-[15px] text-slate-700 leading-[1.6]">{st.description}</p>
                      <div className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1.5 inline-block">
                        Thao tác tại: {st.actionHint}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Guides by Role */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-5 h-5 text-teal-700 shrink-0" />
                    <h2 className="text-[19px] sm:text-[20px] font-black text-slate-900">
                      Hướng dẫn theo vai trò người dùng
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {ROLE_GUIDES.map((rg) => (
                      <button
                        key={rg.id}
                        type="button"
                        onClick={() => setSelectedRoleTab(rg.id)}
                        className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition-colors min-h-[38px] ${
                          selectedRoleTab === rg.id
                            ? 'bg-white text-teal-800 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {rg.roleName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-1">
                    <h3 className="text-[18px] font-black text-teal-950">
                      Vai trò: {activeRoleGuide.roleName} — {activeRoleGuide.subtitle}
                    </h3>
                    <p className="text-[15px] sm:text-[16px] text-slate-700 leading-[1.6]">
                      {activeRoleGuide.summary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[16px] font-bold text-slate-900">
                      Lộ trình thao tác hằng ngày được khuyến nghị:
                    </h4>
                    <ol className="space-y-2">
                      {activeRoleGuide.dailyWorkflow.map((step, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[15px] text-slate-800 leading-[1.6]"
                        >
                          <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Chương nên xem trước:
                      </span>
                      {activeRoleGuide.recommendedChapters.map((cId) => {
                        const found = GUIDE_CHAPTERS.find((c) => c.id === cId);
                        if (!found) return null;
                        return (
                          <button
                            key={cId}
                            type="button"
                            onClick={() => jumpToChapter(cId)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-800 transition-colors"
                          >
                            Chương {found.chapterNumber}: {found.shortTitle}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeRoleGuide.quickSwitchNote}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* SECTION 3: 14 DETAILED CHAPTERS (8 REQUIRED PARTS PER CHAPTER) */}
          {showChapters && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <h2 className="text-[19px] sm:text-[20px] font-black text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-teal-700" />
                  <span>
                    Hướng dẫn chi tiết 14 chức năng (CHƯƠNG 1 đến CHƯƠNG 14)
                  </span>
                </h2>
                {normalizedQuery && (
                  <span className="text-sm font-bold text-teal-800">
                    Tìm thấy {filteredChapters.length} chương khớp từ khóa &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>

              {filteredChapters.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                  <p className="text-[16px] font-bold text-slate-700">
                    Không tìm thấy chương hướng dẫn phù hợp với từ khóa &quot;{searchQuery}&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-bold"
                  >
                    Hiện lại toàn bộ 14 chương
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChapters.map((ch) => {
                    const isExpanded = normalizedQuery ? true : Boolean(expandedChapters[ch.id]);
                    const roleRestrictedNotice = ch.targetRoute.teacherOnly && !isTeacherOrAdmin;

                    return (
                      <article
                        key={ch.id}
                        ref={(el) => {
                          chapterRefs.current[ch.id] = el;
                        }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-20"
                      >
                        {/* Chapter Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleChapter(ch.id)}
                          aria-expanded={isExpanded}
                          className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <span className="px-2.5 py-1 rounded-lg bg-teal-700 text-white text-xs font-black shrink-0 mt-0.5 sm:mt-0">
                              CHƯƠNG {ch.chapterNumber}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-[18px] sm:text-[19px] font-black text-slate-900 leading-snug">
                                {ch.shortTitle}
                              </h3>
                              <div className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                                <span>Dành cho: {ch.roles.join(', ')}</span>
                                <span>·</span>
                                <span className="truncate">{ch.menuLocation}</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 p-1.5 rounded-lg bg-slate-100 text-slate-700">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        </button>

                        {/* Chapter 8 Mandatory Parts */}
                        {isExpanded && (
                          <div className="px-5 pb-6 pt-3 border-t border-slate-100 space-y-5">
                            {/* 1. Mục đích sử dụng & 2. Vị trí trên menu */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                <h4 className="text-xs font-black text-teal-800 uppercase tracking-wider">
                                  1. Mục đích sử dụng
                                </h4>
                                <p className="text-[15px] text-slate-800 leading-[1.6]">
                                  {ch.purpose}
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                <h4 className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>2. Vị trí chức năng trên menu</span>
                                </h4>
                                <p className="text-[15px] font-bold text-slate-900 leading-[1.6]">
                                  {ch.menuLocation}
                                </p>
                              </div>
                            </div>

                            {/* 3. Điều kiện cần thiết trước khi thao tác */}
                            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                                3. Điều kiện cần thiết trước khi thao tác
                              </h4>
                              <ul className="space-y-1 text-[15px] text-amber-950 leading-[1.6] list-disc list-inside">
                                {ch.prerequisites.map((pre, idx) => (
                                  <li key={idx}>{pre}</li>
                                ))}
                              </ul>
                            </div>

                            {/* 4. Các bước thực hiện chi tiết */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                4. Các bước thực hiện chi tiết
                              </h4>
                              <ol className="space-y-3">
                                {ch.steps.map((st, sIdx) => (
                                  <li
                                    key={sIdx}
                                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5"
                                  >
                                    <span className="w-7 h-7 rounded-full bg-teal-700 text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <div className="space-y-2 flex-1 min-w-0">
                                      <div className="text-[16px] font-bold text-slate-900">
                                        {st.title}
                                      </div>
                                      <p className="text-[15px] text-slate-700 leading-[1.6]">
                                        {st.detail}
                                      </p>
                                      {st.buttons && st.buttons.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                          <span className="text-xs font-semibold text-slate-500 mr-1">
                                            Nút / mục thao tác:
                                          </span>
                                          {st.buttons.map((btnLabel, bIdx) => (
                                            <span
                                              key={bIdx}
                                              className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold"
                                            >
                                              {btnLabel}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* 5. Ví dụ cụ thể & 6. Kết quả mong muốn */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                                <h4 className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Lightbulb className="w-4 h-4 text-sky-700" />
                                  <span>5. Ví dụ cụ thể: {ch.example.title}</span>
                                </h4>
                                <p className="text-[15px] text-slate-800 leading-[1.6]">
                                  <strong>Tình huống:</strong> {ch.example.scenario}
                                </p>
                                <p className="text-[15px] text-sky-950 leading-[1.6]">
                                  <strong>Kết quả ví dụ:</strong> {ch.example.outcome}
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                  <span>6. Kết quả mong muốn</span>
                                </h4>
                                <p className="text-[15px] text-emerald-950 leading-[1.6]">
                                  {ch.expectedResult}
                                </p>
                              </div>
                            </div>

                            {/* 7. Lỗi thường gặp và cách xử lý */}
                            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2.5">
                              <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-rose-700" />
                                <span>7. Lỗi thường gặp và cách xử lý</span>
                              </h4>
                              <div className="space-y-2.5">
                                {ch.troubleshooting.map((err, eIdx) => (
                                  <div
                                    key={eIdx}
                                    className="p-3 rounded-xl bg-white border border-rose-200 text-[15px] leading-[1.6] space-y-1"
                                  >
                                    <div className="font-bold text-rose-900">
                                      Vấn đề: {err.issue}
                                    </div>
                                    <div className="text-slate-700">
                                      <strong>Nguyên nhân:</strong> {err.cause}
                                    </div>
                                    <div className="text-teal-900 font-medium">
                                      <strong>Cách xử lý:</strong> {err.solution}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 8. Nút "Mở trực tiếp chức năng" */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-xs font-semibold text-slate-500">
                                8. Thao tác thực hành ngay trên hệ thống:
                                {roleRestrictedNotice && (
                                  <span className="ml-2 text-amber-700 font-bold">
                                    (Chức năng này dành cho vai trò Giáo viên / Quản trị viên)
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenChapterFeature(ch)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-2xs transition-colors min-h-[42px]"
                              >
                                <ExternalLink className="w-4 h-4 shrink-0" />
                                <span>Mở trực tiếp chức năng</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* SECTION 4: 13 WORKED EXAMPLES */}
          {showExamples && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="w-5 h-5 text-teal-700 shrink-0" />
                  <h2 className="text-[19px] sm:text-[20px] font-black text-slate-900">
                    Thực hành mẫu (13 tình huống thao tác chuẩn từng bước)
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Nhấp vào từng bài mẫu để xem hướng dẫn hoặc mở nhanh chức năng
                </span>
              </div>

              {filteredExamples.length === 0 ? (
                <p className="text-[15px] text-slate-600 py-4 text-center">
                  Không có bài thực hành mẫu nào khớp từ khóa &quot;{searchQuery}&quot;.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredExamples.map((ex) => {
                    const isOpen = normalizedQuery ? true : Boolean(expandedExamples[ex.id]);
                    const disabledForRole = ex.targetRoute.teacherOnly && !isTeacherOrAdmin;

                    return (
                      <div
                        key={ex.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedExamples((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }))
                          }
                          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-teal-700 text-white text-xs font-black flex items-center justify-center shrink-0">
                              {ex.order}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[16px] font-bold text-slate-900">
                                {ex.title}
                              </div>
                              <div className="text-xs text-slate-500 font-semibold mt-0.5">
                                Nhóm: {ex.category}
                              </div>
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-200 bg-white space-y-3">
                            <p className="text-[15px] text-slate-700 leading-[1.6]">
                              <strong>Mục tiêu:</strong> {ex.goal}
                            </p>
                            <ol className="space-y-1.5 list-decimal list-inside text-[15px] text-slate-800 leading-[1.6]">
                              {ex.steps.map((st, idx) => (
                                <li key={idx}>{st}</li>
                              ))}
                            </ol>
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[15px] text-emerald-950 leading-[1.6]">
                              <strong>Kết quả đạt được:</strong> {ex.expectedOutcome}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => jumpToChapter(ex.chapterId)}
                                className="text-xs font-bold text-teal-800 hover:underline"
                              >
                                Xem lý thuyết chương liên quan →
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  disabledForRole
                                    ? onOpenFeature('overview')
                                    : onOpenFeature(ex.targetRoute.tab, ex.targetRoute.sub)
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold min-h-[38px]"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{ex.targetRoute.routeLabel}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* SECTION 5: FAQ & TROUBLESHOOTING INDEX */}
          {showFaqAndErrors && (
            <div className="space-y-6">
              {/* FAQ */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <HelpCircle className="w-5 h-5 text-teal-700 shrink-0" />
                  <h2 className="text-[19px] sm:text-[20px] font-black text-slate-900">
                    Câu hỏi thường gặp (FAQ)
                  </h2>
                </div>

                <div className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <h3 className="text-[16px] font-bold text-slate-900">{faq.question}</h3>
                      <p className="text-[15px] text-slate-700 leading-[1.6]">{faq.answer}</p>
                      {faq.relatedChapterId && (
                        <button
                          type="button"
                          onClick={() => jumpToChapter(faq.relatedChapterId!)}
                          className="text-xs font-bold text-teal-800 hover:underline inline-block pt-1"
                        >
                          Xem chi tiết trong chương hướng dẫn →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Consolidated Common Errors Index */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <h2 className="text-[19px] sm:text-[20px] font-black text-slate-900">
                    Bảng tra nhanh cách xử lý các lỗi thường gặp
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {allTroubleshootingRows.map((row, idx) => (
                    <div
                      key={`${row.chapterId}_${idx}`}
                      className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 text-[15px] leading-[1.6] space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-rose-950">{row.issue}</span>
                        <button
                          type="button"
                          onClick={() => jumpToChapter(row.chapterId)}
                          className="text-xs font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-teal-50"
                        >
                          {row.chapterTitle}
                        </button>
                      </div>
                      <p className="text-slate-700">
                        <strong>Nguyên nhân:</strong> {row.cause}
                      </p>
                      <p className="text-teal-900 font-medium">
                        <strong>Cách xử lý:</strong> {row.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Bottom Back Button for Easy Return */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onReturnToWorkspace}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-[15px] shadow-xs transition-colors min-h-[46px]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Quay lại chức năng đang sử dụng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
