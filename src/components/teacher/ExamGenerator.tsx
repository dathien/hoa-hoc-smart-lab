import React, { useEffect, useMemo, useState } from 'react';
import { useChemStore } from '../../services/store';
import {
  Exam,
  ExamMatrix,
  ExamSectionConfig,
  Question,
  TrueFalseScoringRule,
} from '../../types/chem';
import {
  COGNITIVE_LEVEL_LABELS,
  DEFAULT_TF_SCORING_RULE,
  QUESTION_TYPE_LABELS,
  buildShuffledVariants,
  calculateExamMaxScore,
  computeMatrixSummary,
  createDefaultSections,
  selectQuestionsFromMatrix,
} from '../../utils/examUtils';
import { ChemFormula } from '../common/ChemFormula';
import { SmartChemEditor } from '../common/SmartChemEditor';
import { richHtmlToPlainText } from '../../utils/chemSyntax';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Edit2,
  FileText,
  Layers,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Shuffle,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface ExamGeneratorProps {
  initialMatrix?: ExamMatrix;
  editingExam?: Exam | null;
  onClearEditingExam?: () => void;
  onExamSaved?: (exam: Exam, goToTab?: string) => void;
  onNavigateToMatrixTab?: () => void;
  onNavigateToQuestionBank?: () => void;
}

const DRAFT_CONFIG_KEY = 'chem_draft_exam_config_v1';

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  initialMatrix,
  editingExam,
  onClearEditingExam,
  onExamSaved,
  onNavigateToMatrixTab,
  onNavigateToQuestionBank,
}) => {
  const { matrices, questions, classes, createExam, updateExam, updateQuestion } = useChemStore();

  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(
    editingExam?.matrixId || initialMatrix?.id || matrices[0]?.id || ''
  );
  const selectedMatrix = useMemo(
    () => matrices.find((m) => m.id === selectedMatrixId) || matrices[0],
    [matrices, selectedMatrixId]
  );

  // Full Metadata State (Section II)
  const [examTitle, setExamTitle] = useState<string>(
    editingExam?.title ||
      (selectedMatrix ? `${selectedMatrix.title} – Đề chính thức` : 'Đề kiểm tra Hóa học GDPT 2018')
  );
  const [subjectName, setSubjectName] = useState<string>(editingExam?.subjectName || 'Hóa học');
  const [grade, setGrade] = useState<10 | 11 | 12>(editingExam?.grade || selectedMatrix?.grade || 11);
  const [schoolYear, setSchoolYear] = useState<string>(
    editingExam?.schoolYear || selectedMatrix?.schoolYear || '2026 - 2027'
  );
  const [semester, setSemester] = useState<1 | 2>(
    editingExam?.semester || selectedMatrix?.semester || 1
  );
  const [examCategory, setExamCategory] = useState<
    'THUONG_XUYEN' | 'GIUA_KY' | 'CUOI_KY' | 'LUYEN_THI_THPT'
  >(editingExam?.examCategory || selectedMatrix?.examType || 'GIUA_KY');
  const [textbook, setTextbook] = useState<'KNTT' | 'CANH_DIEU' | 'CHAN_TROI' | 'CHUNG'>(
    editingExam?.textbook || selectedMatrix?.textbook || 'KNTT'
  );
  const [lessonScope, setLessonScope] = useState<string>(
    editingExam?.lessonScope || 'Theo phân phối chương trình HK hiện tại'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    editingExam?.durationMinutes || selectedMatrix?.durationMinutes || 45
  );
  const [targetTotalScore, setTargetTotalScore] = useState<number>(
    editingExam?.targetTotalScore || editingExam?.totalScore || 10.0
  );
  const [schoolName, setSchoolName] = useState<string>(
    editingExam?.schoolName || 'Trường THPT Võ Trường Toản'
  );
  const [departmentName, setDepartmentName] = useState<string>(
    editingExam?.departmentName || 'Tổ Hóa học'
  );
  const [variantCount, setVariantCount] = useState<number>(editingExam?.variantCount || 4);
  const [requireApprovedQuestions, setRequireApprovedQuestions] = useState<boolean>(
    editingExam?.requireApprovedQuestions ?? true
  );
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>(
    editingExam?.assignedClassIds || ['class_11a1']
  );

  // 4-Part Structure (allows 0 questions in any section!)
  const [sections, setSections] = useState<ExamSectionConfig[]>(
    editingExam?.sections || createDefaultSections()
  );

  // True/False Scoring Rule (Section VIII)
  const [tfRule, setTfRule] = useState<TrueFalseScoringRule>(
    editingExam?.tfScoringRule || selectedMatrix?.tfScoringRule || { ...DEFAULT_TF_SCORING_RULE }
  );

  // Selected questions & per-question scores
  const [selectedIds, setSelectedIds] = useState<string[]>(editingExam?.questionIds || []);
  const [questionScores, setQuestionScores] = useState<Record<string, number>>(
    editingExam?.questionScores || {}
  );
  const [missingReport, setMissingReport] = useState<ReturnType<typeof selectQuestionsFromMatrix> | null>(
    null
  );
  // Exam-local question overrides (so editing inside an exam does NOT overwrite Question Bank by default)
  const [questionOverrides, setQuestionOverrides] = useState<Record<string, Question>>(
    editingExam?.questionOverrides || {}
  );
  const [hasOverrideAnswerWarning, setHasOverrideAnswerWarning] = useState<boolean>(
    Boolean(editingExam?.needsResync)
  );
  const [swapTargetIndex, setSwapTargetIndex] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Question | null>(null);
  const [editOptIdx, setEditOptIdx] = useState<number | null>(null);
  const [editTfIdx, setEditTfIdx] = useState<number | null>(null);
  const [editShortRich, setEditShortRich] = useState<boolean>(false);
  const [alsoUpdateBank, setAlsoUpdateBank] = useState<boolean>(false);
  const [draftFoundNotice, setDraftFoundNotice] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Sync when initialMatrix or editingExam changes externally
  useEffect(() => {
    if (editingExam) {
      setSelectedMatrixId(editingExam.matrixId || matrices[0]?.id || '');
      setExamTitle(editingExam.title);
      setGrade(editingExam.grade);
      setSchoolYear(editingExam.schoolYear || '2026 - 2027');
      setSemester(editingExam.semester || 1);
      setExamCategory(editingExam.examCategory || 'GIUA_KY');
      setDurationMinutes(editingExam.durationMinutes);
      setTargetTotalScore(editingExam.targetTotalScore || editingExam.totalScore || 10);
      setSections(editingExam.sections || createDefaultSections());
      setTfRule(editingExam.tfScoringRule || { ...DEFAULT_TF_SCORING_RULE });
      setSelectedIds(editingExam.questionIds || []);
      setQuestionScores(editingExam.questionScores || {});
      setQuestionOverrides(editingExam.questionOverrides || {});
      setHasOverrideAnswerWarning(Boolean(editingExam.needsResync));
      setAssignedClassIds(editingExam.assignedClassIds || []);
      setEditingQuestionId(null);
      setEditingDraft(null);
    }
  }, [editingExam, matrices]);

  useEffect(() => {
    if (initialMatrix && !editingExam) {
      setSelectedMatrixId(initialMatrix.id);
      setGrade(initialMatrix.grade);
      setDurationMinutes(initialMatrix.durationMinutes);
      setExamTitle(`${initialMatrix.title} – Đề chính thức`);
    }
  }, [initialMatrix, editingExam]);

  useEffect(() => {
    if (!editingExam) {
      try {
        const raw = localStorage.getItem(DRAFT_CONFIG_KEY);
        if (raw) setDraftFoundNotice(true);
      } catch {}
    }
  }, [editingExam]);

  // Auto-save draft config
  useEffect(() => {
    if (!editingExam) {
      try {
        localStorage.setItem(
          DRAFT_CONFIG_KEY,
          JSON.stringify({
            examTitle,
            grade,
            durationMinutes,
            targetTotalScore,
            selectedMatrixId,
            sections,
            tfRule,
            selectedIds,
            questionScores,
          })
        );
      } catch {}
    }
  }, [
    editingExam,
    examTitle,
    grade,
    durationMinutes,
    targetTotalScore,
    selectedMatrixId,
    sections,
    tfRule,
    selectedIds,
    questionScores,
  ]);

  const qMap = useMemo(() => {
    const map: Record<string, Question> = {};
    questions.forEach((q) => (map[q.id] = q));
    return map;
  }, [questions]);

  const effectiveQMap = useMemo(() => {
    const map: Record<string, Question> = { ...qMap };
    Object.entries(questionOverrides).forEach(([qId, override]) => {
      if (override) map[qId] = override;
    });
    return map;
  }, [qMap, questionOverrides]);

  const matrixSummary = useMemo(
    () => (selectedMatrix ? computeMatrixSummary(selectedMatrix, tfRule) : null),
    [selectedMatrix, tfRule]
  );

  // Auto-sync sections from matrix counts
  const handleSyncSectionsFromMatrix = () => {
    if (!matrixSummary) return;
    setSections((prev) =>
      prev.map((sec) => {
        const tInfo = matrixSummary.byType[sec.questionType];
        return {
          ...sec,
          enabled: tInfo.count > 0,
          questionCount: tInfo.count,
          totalScore: tInfo.score,
          scorePerQuestion:
            tInfo.count > 0 ? Math.round((tInfo.score / tInfo.count) * 1000) / 1000 : 0,
        };
      })
    );
    setTargetTotalScore(matrixSummary.totalScore || 10);
  };

  // Run matrix-based question selection engine
  const handleGenerateFromMatrix = () => {
    if (!selectedMatrix) return;
    const res = selectQuestionsFromMatrix(selectedMatrix, questions, {
      requireApproved: requireApprovedQuestions,
      allowDuplicate: false,
      sections,
    });
    setMissingReport(res);
    setSelectedIds(res.selectedQuestions.map((q) => q.id));
    setQuestionScores(res.questionScores);
    if (res.success) {
      setStatusNotice(
        `Đã tuyển chọn đủ ${res.selectedQuestions.length} câu hỏi khớp chính xác Ma trận (Tổng điểm tính được: ${res.calculatedTotalScore} đ).`
      );
    } else {
      setStatusNotice(
        `Ngân hàng hiện mới khớp ${res.totalMatched}/${res.totalRequired} câu theo ma trận. Còn ${res.missingCells.length} ô thiếu câu hỏi — không tạo câu hỏi giả.`
      );
    }
  };

  // Move question order up/down
  const handleMoveQuestion = (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= selectedIds.length) return;
    const copy = [...selectedIds];
    const [moved] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, moved);
    setSelectedIds(copy);
  };

  // Swap question with another eligible bank question
  const handleSwapQuestion = (idx: number, replacementId: string) => {
    const oldId = selectedIds[idx];
    const copy = [...selectedIds];
    copy[idx] = replacementId;
    setSelectedIds(copy);
    setQuestionScores((prev) => {
      const next = { ...prev };
      next[replacementId] = next[oldId] ?? qMap[replacementId]?.maxScore ?? 0.25;
      return next;
    });
    setSwapTargetIndex(null);
  };

  const calculatedMaxScore = useMemo(() => {
    return calculateExamMaxScore(
      {
        questionIds: selectedIds,
        questionScores,
        tfScoringRule: tfRule,
        questionOverrides,
      },
      effectiveQMap
    );
  }, [selectedIds, questionScores, tfRule, questionOverrides, effectiveQMap]);

  const sectionsSumScore = useMemo(() => {
    return Math.round(
      sections.filter((s) => s.enabled && s.questionCount > 0).reduce((acc, s) => acc + s.totalScore, 0) *
        1000
    ) / 1000;
  }, [sections]);

  const handleSaveExam = (goToTabAfter?: string) => {
    if (selectedIds.length === 0) {
      setStatusNotice('Vui lòng bấm "Sinh bộ câu hỏi theo Ma trận" hoặc thêm câu hỏi trước khi lưu.');
      return;
    }

    const mappedType: Exam['type'] =
      examCategory === 'GIUA_KY'
        ? 'MID_TERM'
        : examCategory === 'CUOI_KY'
        ? 'FINAL_TERM'
        : examCategory === 'LUYEN_THI_THPT'
        ? '50_MIN_THPT'
        : '15_MIN';

    const generatedVariants = buildShuffledVariants(selectedIds, effectiveQMap, {
      count: variantCount,
      rule: '101_SERIES',
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTfStatements: false,
      lockedQuestionIds: editingExam?.lockedQuestionIds || [],
      lockedGroups: editingExam?.lockedGroups || [],
    });

    const payload: Omit<Exam, 'id' | 'createdAt'> = {
      title: examTitle,
      subjectName,
      grade,
      schoolYear,
      semester,
      examCategory,
      textbook,
      lessonScope,
      type: mappedType,
      durationMinutes,
      assignedClassIds,
      questionIds: selectedIds,
      totalScore: calculatedMaxScore,
      targetTotalScore,
      sections,
      deadline: editingExam?.deadline || '2026-12-30T23:59',
      allowShowScoreImmediately: editingExam?.allowShowScoreImmediately ?? false,
      allowShowAnswers: editingExam?.allowShowAnswers ?? false,
      allowShowExplanations: editingExam?.allowShowExplanations ?? false,
      allowShowFeedback: editingExam?.allowShowFeedback ?? true,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTfStatements: false,
      variantCount,
      variantRule: '101_SERIES',
      requireApprovedQuestions,
      questionScores,
      questionOverrides: Object.keys(questionOverrides).length > 0 ? questionOverrides : undefined,
      tfScoringRule: tfRule,
      matrixId: selectedMatrix?.id,
      matrixTitle: selectedMatrix?.title,
      variants: generatedVariants,
      schoolName,
      departmentName,
      academicYear: schoolYear,
      status: editingExam?.status || 'DRAFT',
      needsResync: false,
      createdBy: 'user_teacher',
    };
    setHasOverrideAnswerWarning(false);

    let saved: Exam;
    if (editingExam) {
      updateExam(editingExam.id, payload);
      saved = { ...editingExam, ...payload };
      if (onClearEditingExam) onClearEditingExam();
    } else {
      saved = createExam(payload);
      try {
        localStorage.removeItem(DRAFT_CONFIG_KEY);
      } catch {}
    }

    setStatusNotice(`Đã lưu đề "${saved.title}" (${generatedVariants.length} mã đề) thành công!`);
    if (onExamSaved) {
      onExamSaved(saved, goToTabAfter);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {editingExam ? `Đang Chỉnh Sửa Đề: ${editingExam.title}` : 'Tạo Đề Kiểm Tra Mới & Cấu Hình Thang Điểm'}
            </h2>
            <p className="text-sm text-slate-500">
              Cấu hình đầy đủ 4 phần (hỗ trợ 0 câu), quy tắc Đúng/Sai GDPT 2025, sinh đề bám sát Ma trận & xem trước hoán đổi từng câu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editingExam && onClearEditingExam && (
            <button
              type="button"
              onClick={onClearEditingExam}
              className="px-3.5 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
            >
              Chuyển sang tạo đề mới
            </button>
          )}
          <select
            value={selectedMatrixId}
            onChange={(e) => setSelectedMatrixId(e.target.value)}
            className="px-3.5 py-2 text-xs md:text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl min-h-[44px]"
          >
            {matrices.map((m) => (
              <option key={m.id} value={m.id}>
                Ma trận: [Lớp {m.grade}] {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Draft recovery notice */}
      {draftFoundNotice && !editingExam && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-950">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Đã khôi phục tự động cấu hình nháp trước đó của bạn (tự lưu khi thao tác).</span>
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(DRAFT_CONFIG_KEY);
              } catch {}
              setDraftFoundNotice(false);
            }}
            className="px-3 py-1 bg-white border border-amber-300 rounded-lg"
          >
            Ẩn thông báo
          </button>
        </div>
      )}

      {statusNotice && (
        <div className="p-4 bg-teal-50 border border-teal-300 rounded-2xl flex items-center gap-2.5 text-sm font-bold text-teal-950">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Missing Matrix Cells Alert (NO fake questions!) */}
      {missingReport && !missingReport.success && (
        <div className="p-5 bg-rose-50 border border-rose-300 rounded-2xl space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-black text-rose-950">
                Ngân hàng câu hỏi chưa đủ cho {missingReport.missingCells.length} ô trong Ma trận (Không tự bịa câu hỏi giả)
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Hệ thống không thay thế sai mức độ nhận thức. Vui lòng bổ sung đúng mức độ còn thiếu hoặc điều chỉnh lại số câu trong Ma trận:
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {missingReport.missingCells.map((mc, i) => (
              <div key={i} className="p-3 bg-white border border-rose-200 rounded-xl text-xs space-y-1">
                <strong className="text-slate-900 block">{mc.topicName}</strong>
                <span className="text-slate-600 block">
                  {QUESTION_TYPE_LABELS[mc.questionType]} · {COGNITIVE_LEVEL_LABELS[mc.cognitiveLevel]}
                </span>
                <span className="font-black text-rose-700 block">
                  Cần: {mc.needed} · Hiện có: {mc.available} · Thiếu: {mc.missing} câu
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {onNavigateToQuestionBank && (
              <button
                type="button"
                onClick={onNavigateToQuestionBank}
                className="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-xl flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Mở Ngân hàng câu hỏi để thêm câu thiếu</span>
              </button>
            )}
            {onNavigateToMatrixTab && (
              <button
                type="button"
                onClick={onNavigateToMatrixTab}
                className="px-4 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 rounded-xl"
              >
                Chỉnh sửa lại Ma trận
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Metadata + 4-Part Structure + Scoring Rules */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Exam Information */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs font-bold text-slate-700">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              1. Thông Tin Đề Kiểm Tra (GDPT 2018)
            </h3>

            <div>
              <label className="block mb-1">Tên đề kiểm tra:</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Môn học:</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block mb-1">Bộ sách:</label>
                <select
                  value={textbook}
                  onChange={(e) => setTextbook(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="KNTT">Kết nối tri thức (KNTT)</option>
                  <option value="CANH_DIEU">Cánh diều</option>
                  <option value="CHAN_TROI">Chân trời sáng tạo</option>
                  <option value="CHUNG">Dùng chung GDPT 2018</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block mb-1">Khối lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value) as 10 | 11 | 12)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value={10}>Lớp 10</option>
                  <option value={11}>Lớp 11</option>
                  <option value={12}>Lớp 12</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Học kỳ:</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value={1}>Học kỳ I</option>
                  <option value={2}>Học kỳ II</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Năm học:</label>
                <input
                  type="text"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block mb-1">Loại kỳ kiểm tra:</label>
                <select
                  value={examCategory}
                  onChange={(e) => setExamCategory(e.target.value as any)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="THUONG_XUYEN">Thường xuyên</option>
                  <option value="GIUA_KY">Giữa học kỳ</option>
                  <option value="CUOI_KY">Cuối học kỳ</option>
                  <option value="LUYEN_THI_THPT">Luyện thi THPT</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Thời gian (phút):</label>
                <input
                  type="number"
                  min={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value) || 45)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center"
                />
              </div>
              <div>
                <label className="block mb-1">Thang điểm đích:</label>
                <input
                  type="number"
                  step={0.5}
                  min={1}
                  value={targetTotalScore}
                  onChange={(e) => setTargetTotalScore(Number(e.target.value) || 10)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Phạm vi chương / bài học:</label>
              <input
                type="text"
                value={lessonScope}
                onChange={(e) => setLessonScope(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1">Trường THPT:</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block mb-1">Tổ chuyên môn:</label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block mb-1">Số mã đề sinh tự động:</label>
                <select
                  value={variantCount}
                  onChange={(e) => setVariantCount(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {[1, 2, 4, 6, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} mã đề ({Array.from({ length: n }, (_, i) => 101 + i).join(', ')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={requireApprovedQuestions}
                    onChange={(e) => setRequireApprovedQuestions(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Chỉ dùng câu Đã duyệt</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Section Configuration (Allows 0 questions!) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                2. Cấu Trúc 4 Phần (Hỗ trợ 0 câu)
              </h3>
              <button
                type="button"
                onClick={handleSyncSectionsFromMatrix}
                className="px-2.5 py-1 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-lg hover:bg-teal-100 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Lấy từ Ma trận
              </button>
            </div>

            <div className="space-y-2.5">
              {sections.map((sec, sIdx) => (
                <div
                  key={sec.partKey}
                  className={`p-3 rounded-xl border space-y-2 ${
                    sec.enabled && sec.questionCount > 0
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-100/70 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 font-black text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sec.enabled}
                        onChange={(e) =>
                          setSections(
                            sections.map((s, i) =>
                              i === sIdx
                                ? {
                                    ...s,
                                    enabled: e.target.checked,
                                    questionCount: e.target.checked ? s.questionCount : 0,
                                    totalScore: e.target.checked ? s.totalScore : 0,
                                  }
                                : s
                            )
                          )
                        }
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <span>{sec.title}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Số câu (0 để tắt):</span>
                      <input
                        type="number"
                        min={0}
                        value={sec.questionCount}
                        onChange={(e) => {
                          const cnt = Math.max(0, Number(e.target.value) || 0);
                          setSections(
                            sections.map((s, i) =>
                              i === sIdx
                                ? {
                                    ...s,
                                    questionCount: cnt,
                                    enabled: cnt > 0 ? true : s.enabled,
                                    totalScore:
                                      cnt === 0 ? 0 : Math.round(cnt * s.scorePerQuestion * 1000) / 1000,
                                  }
                                : s
                            )
                          );
                        }}
                        className="w-full px-2 py-1 text-center font-bold bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Điểm / câu:</span>
                      <input
                        type="number"
                        min={0}
                        step={0.05}
                        value={sec.scorePerQuestion}
                        onChange={(e) => {
                          const spq = Math.max(0, Number(e.target.value) || 0);
                          setSections(
                            sections.map((s, i) =>
                              i === sIdx
                                ? {
                                    ...s,
                                    scorePerQuestion: spq,
                                    totalScore: Math.round(s.questionCount * spq * 1000) / 1000,
                                  }
                                : s
                            )
                          );
                        }}
                        className="w-full px-2 py-1 text-center font-bold bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Tổng điểm phần:</span>
                      <input
                        type="number"
                        min={0}
                        step={0.05}
                        value={sec.totalScore}
                        onChange={(e) => {
                          const ts = Math.max(0, Number(e.target.value) || 0);
                          setSections(
                            sections.map((s, i) =>
                              i === sIdx
                                ? {
                                    ...s,
                                    totalScore: ts,
                                    scorePerQuestion:
                                      s.questionCount > 0
                                        ? Math.round((ts / s.questionCount) * 1000) / 1000
                                        : 0,
                                  }
                                : s
                            )
                          );
                        }}
                        className="w-full px-2 py-1 text-center font-black text-teal-800 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Math.abs(sectionsSumScore - targetTotalScore) > 0.001 && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Cảnh báo: Tổng điểm 4 phần là <strong>{sectionsSumScore} đ</strong> khác với thang điểm đích{' '}
                  <strong>{targetTotalScore} đ</strong>. Hệ thống không tự ý sửa điểm của bạn.
                </span>
              </div>
            )}
          </div>

          {/* 3. True/False Scoring Rule */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b border-slate-100 pb-2">
              3. Quy Tắc Chấm Câu Đúng/Sai Nhiều Ý
            </h3>
            <select
              value={tfRule.mode}
              onChange={(e) => {
                const mode = e.target.value as TrueFalseScoringRule['mode'];
                if (mode === 'MOET_2025') {
                  setTfRule({ ...DEFAULT_TF_SCORING_RULE });
                } else {
                  setTfRule({ ...tfRule, mode });
                }
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
            >
              <option value="MOET_2025">Chuẩn Bộ GD&ĐT (0.1 → 0.25 → 0.5 → 1.0 đ)</option>
              <option value="EQUAL_PER_ITEM">Chia đều điểm theo từng ý (1/4 điểm tối đa mỗi ý)</option>
              <option value="CUSTOM">Tự cấu hình bậc điểm riêng</option>
            </select>

            {tfRule.mode !== 'EQUAL_PER_ITEM' && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Đúng 1 ý', key: 'pointsFor1' as const },
                  { label: 'Đúng 2 ý', key: 'pointsFor2' as const },
                  { label: 'Đúng 3 ý', key: 'pointsFor3' as const },
                  { label: 'Đúng 4 ý', key: 'pointsFor4' as const },
                ].map((item) => (
                  <div key={item.key}>
                    <span className="text-[11px] text-slate-500 block">{item.label}</span>
                    <input
                      type="number"
                      step={0.05}
                      min={0}
                      disabled={tfRule.mode === 'MOET_2025'}
                      value={tfRule[item.key]}
                      onChange={(e) =>
                        setTfRule({
                          ...tfRule,
                          mode: 'CUSTOM',
                          [item.key]: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full p-1.5 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerateFromMatrix}
            className="w-full py-3.5 px-4 text-sm font-black text-white bg-teal-700 hover:bg-teal-800 rounded-2xl shadow-sm flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Shuffle className="w-5 h-5 text-amber-300" />
            <span>Tuyển Chọn Câu Hỏi Bám Sát Ma Trận</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Question Pool Preview, Swap, Reorder, Save Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Danh Sách Câu Hỏi Đề Gốc ({selectedIds.length} câu · Tổng {calculatedMaxScore} đ)
                </h3>
                <p className="text-xs text-slate-500">
                  Hỗ trợ đổi thứ tự lên/xuống, thay câu khác cùng mức độ hoặc chỉnh điểm riêng từng câu.
                </p>
              </div>
              {Math.abs(calculatedMaxScore - targetTotalScore) > 0.001 && selectedIds.length > 0 && (
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
                  Chênh lệch thang điểm đích: {calculatedMaxScore} / {targetTotalScore} đ
                </span>
              )}
            </div>

            {selectedIds.length === 0 ? (
              <div className="p-12 text-center space-y-3 text-slate-400">
                <Layers className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-bold text-slate-600">
                  Chưa có câu hỏi nào trong đề đang soạn
                </p>
                <p className="text-xs max-w-md mx-auto">
                  Nhấn nút &quot;Tuyển Chọn Câu Hỏi Bám Sát Ma Trận&quot; bên trái để tự động lấy đúng câu hỏi theo từng ô Ma trận.
                </p>
              </div>
            ) : (
              <>
                {hasOverrideAnswerWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-xs font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Bạn vừa thay đổi nội dung / phương án hoặc đáp án của câu hỏi trong đề. Nhấn &quot;Cập nhật đề kiểm tra&quot; hoặc &quot;Lưu &amp; Sang Trộn Đề&quot; để đồng bộ lại đáp án các mã đề!
                    </span>
                  </div>
                )}

              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                {selectedIds.map((qId, idx) => {
                  const q = effectiveQMap[qId];
                  if (!q) return null;
                  const isOverridden = Boolean(questionOverrides[qId]);
                  const score = questionScores[qId] ?? q.maxScore;
                  const swapPool = questions.filter(
                    (cand) =>
                      cand.grade === grade &&
                      cand.type === q.type &&
                      cand.cognitiveLevel === q.cognitiveLevel &&
                      !selectedIds.includes(cand.id)
                  );

                  return (
                    <div
                      key={`${qId}_${idx}`}
                      className={`p-4 border rounded-xl space-y-2.5 text-xs ${
                        isOverridden
                          ? 'bg-teal-50/40 border-teal-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-lg">
                            Câu {idx + 1}
                          </span>
                          <span className="font-bold text-slate-700">
                            {QUESTION_TYPE_LABELS[q.type]} · {COGNITIVE_LEVEL_LABELS[q.cognitiveLevel]}
                          </span>
                          <span className="text-slate-400">({q.chapter})</span>
                          {isOverridden && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-[10px]">
                              Đã chỉnh sửa riêng trong đề
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Điểm:</span>
                          <input
                            type="number"
                            step={0.05}
                            min={0}
                            value={score}
                            onChange={(e) =>
                              setQuestionScores({
                                ...questionScores,
                                [qId]: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="w-16 px-1.5 py-0.5 text-center font-black bg-white border border-slate-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30"
                            title="Lên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(idx, 1)}
                            disabled={idx === selectedIds.length - 1}
                            className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30"
                            title="Xuống"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingQuestionId === q.id) {
                                setEditingQuestionId(null);
                                setEditingDraft(null);
                              } else {
                                setEditingQuestionId(q.id);
                                setEditingDraft(JSON.parse(JSON.stringify(q)));
                                setEditOptIdx(null);
                                setEditTfIdx(null);
                                setEditShortRich(false);
                                setAlsoUpdateBank(false);
                              }
                            }}
                            className={`px-2 py-1 border font-bold rounded flex items-center gap-1 ${
                              editingQuestionId === q.id
                                ? 'bg-teal-700 text-white border-teal-800'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Chỉnh sửa đầy đủ nội dung, phương án, đáp án & hướng dẫn chấm"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{editingQuestionId === q.id ? 'Đóng sửa' : 'Sửa'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSwapTargetIndex(swapTargetIndex === idx ? null : idx)
                            }
                            className="px-2 py-1 bg-white border border-teal-300 text-teal-800 font-bold rounded hover:bg-teal-50"
                          >
                            Đổi câu ({swapPool.length})
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedIds(selectedIds.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {editingQuestionId === q.id && editingDraft ? (
                        <div className="space-y-3 pt-2 p-3.5 bg-white border border-teal-300 rounded-xl">
                          <SmartChemEditor
                            compact
                            minHeight={110}
                            label={`Chỉnh sửa Câu ${idx + 1} trực tiếp trong đề`}
                            value={editingDraft.content}
                            onChange={(val) =>
                              setEditingDraft((prev) => (prev ? { ...prev, content: val } : prev))
                            }
                            draftKey={`exam_q_${q.id}`}
                          />

                          {/* MCQ Options editor */}
                          {editingDraft.type === 'MCQ' && editingDraft.options && (
                            <div className="p-3 bg-teal-50/40 border border-teal-200 rounded-xl space-y-2">
                              <span className="font-black text-teal-900 block">
                                Phương án A, B, C, D &amp; Đáp án đúng:
                              </span>
                              {editingDraft.options.map((opt, oIdx) => (
                                <div
                                  key={opt.id}
                                  className="space-y-1.5 bg-white p-2 rounded-lg border border-slate-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`exam_mcq_${q.id}`}
                                      checked={Boolean(opt.isCorrect)}
                                      onChange={() =>
                                        setEditingDraft((prev) =>
                                          prev && prev.options
                                            ? {
                                                ...prev,
                                                options: prev.options.map((o, i) => ({
                                                  ...o,
                                                  isCorrect: i === oIdx,
                                                })),
                                              }
                                            : prev
                                        )
                                      }
                                      className="w-4 h-4 text-teal-600"
                                    />
                                    <span className="font-black text-teal-800">{opt.id}.</span>
                                    <div className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded min-h-[30px] flex items-center">
                                      <ChemFormula formula={opt.content} />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditOptIdx(editOptIdx === oIdx ? null : oIdx)
                                      }
                                      className={`px-2 py-1 text-[11px] font-bold rounded border ${
                                        editOptIdx === oIdx
                                          ? 'bg-teal-700 text-white border-teal-800'
                                          : 'bg-slate-100 text-teal-800 border-slate-300'
                                      }`}
                                    >
                                      {editOptIdx === oIdx ? 'Xong' : 'Soạn CT'}
                                    </button>
                                  </div>
                                  {editOptIdx === oIdx && (
                                    <SmartChemEditor
                                      compact
                                      minHeight={75}
                                      value={opt.content}
                                      onChange={(val) =>
                                        setEditingDraft((prev) =>
                                          prev && prev.options
                                            ? {
                                                ...prev,
                                                options: prev.options.map((o, i) =>
                                                  i === oIdx ? { ...o, content: val } : o
                                                ),
                                              }
                                            : prev
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* True/False Statements editor */}
                          {editingDraft.type === 'MULTIPLE_TRUE_FALSE' &&
                            editingDraft.tfStatements && (
                              <div className="p-3 bg-sky-50/50 border border-sky-200 rounded-xl space-y-2">
                                <span className="font-black text-sky-900 block">
                                  Các ý phát biểu Đúng / Sai (a, b, c, d):
                                </span>
                                {editingDraft.tfStatements.map((st, sIdx) => (
                                  <div
                                    key={st.id}
                                    className="space-y-1.5 bg-white p-2 rounded-lg border border-slate-200"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-sky-800 w-5">
                                        {['a)', 'b)', 'c)', 'd)'][sIdx] || `${sIdx + 1})`}
                                      </span>
                                      <div className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded min-h-[30px] flex items-center">
                                        <ChemFormula formula={st.statement} />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditTfIdx(editTfIdx === sIdx ? null : sIdx)
                                        }
                                        className="px-2 py-1 text-[11px] font-bold rounded border bg-slate-100 text-teal-800 border-slate-300"
                                      >
                                        {editTfIdx === sIdx ? 'Xong' : 'Soạn CT'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingDraft((prev) =>
                                            prev && prev.tfStatements
                                              ? {
                                                  ...prev,
                                                  tfStatements: prev.tfStatements.map((it, i) =>
                                                    i === sIdx
                                                      ? { ...it, isCorrect: !it.isCorrect }
                                                      : it
                                                  ),
                                                }
                                              : prev
                                          )
                                        }
                                        className={`px-2.5 py-1 rounded font-black text-[11px] ${
                                          st.isCorrect
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-rose-600 text-white'
                                        }`}
                                      >
                                        {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                      </button>
                                    </div>
                                    {editTfIdx === sIdx && (
                                      <SmartChemEditor
                                        compact
                                        minHeight={75}
                                        value={st.statement}
                                        onChange={(val) =>
                                          setEditingDraft((prev) =>
                                            prev && prev.tfStatements
                                              ? {
                                                  ...prev,
                                                  tfStatements: prev.tfStatements.map((it, i) =>
                                                    i === sIdx ? { ...it, statement: val } : it
                                                  ),
                                                }
                                              : prev
                                          )
                                        }
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* Short Answer editor */}
                          {editingDraft.type === 'SHORT_ANSWER' && (
                            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-amber-950">Đáp án ngắn chuẩn:</span>
                                <button
                                  type="button"
                                  onClick={() => setEditShortRich(!editShortRich)}
                                  className="px-2 py-0.5 text-[11px] font-bold bg-white border border-amber-300 rounded text-teal-800"
                                >
                                  {editShortRich ? 'Nhập nhanh' : 'Soạn công thức'}
                                </button>
                              </div>
                              {!editShortRich ? (
                                <input
                                  type="text"
                                  value={editingDraft.correctAnswer || ''}
                                  onChange={(e) =>
                                    setEditingDraft((prev) =>
                                      prev ? { ...prev, correctAnswer: e.target.value } : prev
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                                />
                              ) : (
                                <SmartChemEditor
                                  compact
                                  minHeight={65}
                                  value={editingDraft.correctAnswer || ''}
                                  onChange={(val) =>
                                    setEditingDraft((prev) =>
                                      prev ? { ...prev, correctAnswer: val } : prev
                                    )
                                  }
                                />
                              )}
                            </div>
                          )}

                          {/* Essay Rubric editor */}
                          {editingDraft.type === 'ESSAY' && (
                            <SmartChemEditor
                              compact
                              minHeight={90}
                              label="Hướng dẫn chấm / Biểu điểm Tự luận"
                              value={editingDraft.rubricGuide || ''}
                              onChange={(val) =>
                                setEditingDraft((prev) =>
                                  prev ? { ...prev, rubricGuide: val } : prev
                                )
                              }
                            />
                          )}

                          {/* Explanation editor */}
                          <SmartChemEditor
                            compact
                            minHeight={90}
                            label="Đáp án & Lời giải chi tiết"
                            value={editingDraft.explanation || ''}
                            onChange={(val) =>
                              setEditingDraft((prev) =>
                                prev ? { ...prev, explanation: val } : prev
                              )
                            }
                          />

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoUpdateBank}
                                onChange={(e) => setAlsoUpdateBank(e.target.checked)}
                                className="w-4 h-4 text-teal-600 rounded"
                              />
                              <span>Đồng thời cập nhật câu gốc trong Ngân hàng câu hỏi</span>
                            </label>

                            <div className="flex items-center gap-2">
                              {isOverridden && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextOverrides = { ...questionOverrides };
                                    delete nextOverrides[q.id];
                                    setQuestionOverrides(nextOverrides);
                                    if (editingExam) {
                                      updateExam(editingExam.id, {
                                        questionOverrides:
                                          Object.keys(nextOverrides).length > 0
                                            ? nextOverrides
                                            : undefined,
                                      });
                                    }
                                    setEditingQuestionId(null);
                                    setEditingDraft(null);
                                    setStatusNotice(
                                      `Đã khôi phục Câu ${idx + 1} về phiên bản gốc trong Ngân hàng.`
                                    );
                                  }}
                                  className="px-2.5 py-1.5 text-[11px] font-bold bg-amber-50 border border-amber-300 rounded-lg text-amber-900"
                                >
                                  Khôi phục câu gốc
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestionId(null);
                                  setEditingDraft(null);
                                }}
                                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-700"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!editingDraft) return;
                                  const answerChanged =
                                    JSON.stringify(editingDraft.options) !==
                                      JSON.stringify(q.options) ||
                                    JSON.stringify(editingDraft.tfStatements) !==
                                      JSON.stringify(q.tfStatements) ||
                                    editingDraft.correctAnswer !== q.correctAnswer;

                                  const updatedItem: Question = {
                                    ...editingDraft,
                                    updatedAt: new Date().toISOString(),
                                  };
                                  const nextOverrides: Record<string, Question> = {
                                    ...questionOverrides,
                                    [q.id]: updatedItem,
                                  };
                                  setQuestionOverrides(nextOverrides);

                                  if (alsoUpdateBank) {
                                    updateQuestion(q.id, updatedItem);
                                  }
                                  if (editingExam) {
                                    const needSync =
                                      answerChanged &&
                                      Boolean(editingExam.variants && editingExam.variants.length > 0);
                                    if (needSync) setHasOverrideAnswerWarning(true);
                                    updateExam(editingExam.id, {
                                      questionOverrides: nextOverrides,
                                      ...(needSync ? { needsResync: true } : {}),
                                    });
                                  } else if (answerChanged) {
                                    setHasOverrideAnswerWarning(true);
                                  }

                                  try {
                                    localStorage.removeItem(`smart_chem_draft_v1_exam_q_${q.id}`);
                                  } catch {}

                                  setEditingQuestionId(null);
                                  setEditingDraft(null);
                                  setStatusNotice(
                                    alsoUpdateBank
                                      ? `Đã cập nhật Câu ${idx + 1} cho đề này và đồng bộ vào Ngân hàng câu hỏi.`
                                      : `Đã lưu chỉnh sửa riêng cho Câu ${idx + 1} trong đề (Ngân hàng câu hỏi gốc được giữ nguyên).`
                                  );
                                }}
                                className="px-3.5 py-1.5 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-lg"
                              >
                                Lưu chỉnh sửa câu hỏi
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-slate-800 font-medium">
                            <ChemFormula formula={q.content} />
                          </div>
                          {q.type === 'MCQ' && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt) => (
                                <div
                                  key={opt.id}
                                  className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center justify-between ${
                                    opt.isCorrect
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <span>
                                    <strong>{opt.id}.</strong> <ChemFormula formula={opt.content} />
                                  </span>
                                  {opt.isCorrect && (
                                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.type === 'MULTIPLE_TRUE_FALSE' && q.tfStatements && (
                            <div className="space-y-1">
                              {q.tfStatements.map((st, sIdx) => (
                                <div
                                  key={st.id}
                                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[11px]"
                                >
                                  <span>
                                    <strong>{['a)', 'b)', 'c)', 'd)'][sIdx]}</strong>{' '}
                                    <ChemFormula formula={st.statement} />
                                  </span>
                                  <span
                                    className={`font-black px-1.5 py-0.5 rounded ${
                                      st.isCorrect
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {q.type === 'SHORT_ANSWER' && (
                            <div className="text-[11px] text-sky-900 font-bold">
                              Đáp án ngắn: <ChemFormula formula={q.correctAnswer || ''} />
                            </div>
                          )}
                        </div>
                      )}

                      {swapTargetIndex === idx && (
                        <div className="p-3 bg-white border border-teal-300 rounded-xl space-y-2">
                          <span className="font-bold text-teal-900 block">
                            Chọn câu hỏi thay thế (cùng khối {grade}, dạng & mức độ):
                          </span>
                          {swapPool.length === 0 ? (
                            <p className="text-slate-400 italic">
                              Không còn câu dự phòng nào cùng mức độ trong ngân hàng.
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {swapPool.map((cand) => (
                                <button
                                  key={cand.id}
                                  type="button"
                                  onClick={() => handleSwapQuestion(idx, cand.id)}
                                  className="w-full text-left p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                                >
                                  <span className="truncate">{richHtmlToPlainText(cand.content)}</span>
                                  <span className="text-teal-700 font-bold shrink-0">Chọn</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              </>
            )}

            {/* Save Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600">
                Tổng câu: <strong>{selectedIds.length}</strong> · Tổng điểm thực tế:{' '}
                <strong className="text-teal-800">{calculatedMaxScore} đ</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveExam('created-exams')}
                  className="px-4 py-2.5 text-xs font-bold bg-white text-teal-800 border border-teal-300 hover:bg-teal-50 rounded-xl flex items-center gap-1.5 min-h-[44px]"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingExam ? 'Cập nhật đề kiểm tra' : 'Lưu Đề Vào Kho'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveExam('shuffle-variants')}
                  className="px-5 py-2.5 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs flex items-center gap-1.5 min-h-[44px]"
                >
                  <Shuffle className="w-4 h-4 text-amber-300" />
                  <span>Lưu & Sang Trộn Đề / Sinh Mã Đề</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
