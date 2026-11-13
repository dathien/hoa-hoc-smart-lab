import React, { useEffect, useMemo, useState } from 'react';
import { useChemStore } from '../../services/store';
import {
  CognitiveLevel,
  ExamMatrix,
  MatrixTopicRow,
  QuestionType,
  SpecificationItem,
} from '../../types/chem';
import {
  COGNITIVE_LEVELS,
  COGNITIVE_LEVEL_LABELS,
  DEFAULT_TF_SCORING_RULE,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  computeMatrixSummary,
  getMatrixCell,
  parseNonNegativeDecimalOrNull,
  parseNonNegativeIntOrNull,
  setMatrixCell,
  syncMatrixToSpecifications,
} from '../../utils/examUtils';
import {
  exportMatrixToDocx,
  exportMatrixToExcel,
  extractTextFromUploadedFile,
} from '../../utils/docxExportUtils';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Layers,
  MessageSquare,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';

interface ExamMatrixSpecManagerProps {
  onUseMatrixForExam?: (matrix: ExamMatrix) => void;
}

const DRAFT_STORAGE_KEY = 'chem_draft_matrix_v1';

const SHORT_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  NHAN_BIET: 'NB',
  THONG_HIEU: 'TH',
  VAN_DUNG: 'VD',
  VAN_DUNG_CAO: 'VDC',
};

const TYPE_GROUP_COLORS: Record<QuestionType, { header: string; cell: string; label: string }> = {
  MCQ: {
    header: 'bg-teal-50 text-teal-900 border-teal-200',
    cell: 'bg-teal-50/20',
    label: 'Trắc nghiệm 4 lựa chọn',
  },
  MULTIPLE_TRUE_FALSE: {
    header: 'bg-sky-50 text-sky-900 border-sky-200',
    cell: 'bg-sky-50/20',
    label: 'Đúng / Sai (theo ý)',
  },
  SHORT_ANSWER: {
    header: 'bg-amber-50 text-amber-900 border-amber-200',
    cell: 'bg-amber-50/20',
    label: 'Trả lời ngắn',
  },
  ESSAY: {
    header: 'bg-purple-50 text-purple-900 border-purple-200',
    cell: 'bg-purple-50/20',
    label: 'Tự luận',
  },
};

export const ExamMatrixSpecManager: React.FC<ExamMatrixSpecManagerProps> = ({
  onUseMatrixForExam,
}) => {
  const {
    matrices,
    referenceSources,
    questions,
    addMatrix,
    updateMatrix,
    cloneMatrix,
    deleteMatrix,
  } = useChemStore();

  const [subMode, setSubMode] = useState<'spreadsheet' | 'library' | 'import'>('spreadsheet');
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(matrices[0]?.id || '');
  const [workingMatrix, setWorkingMatrix] = useState<ExamMatrix | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [showAllTypeCols, setShowAllTypeCols] = useState<boolean>(true);
  const [confirmReverseSync, setConfirmReverseSync] = useState<boolean>(false);

  // Import state (NO fake generation - displays exact extracted text/rows)
  const [importFileName, setImportFileName] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedExcelRows, setExtractedExcelRows] = useState<any[][] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importTitle, setImportTitle] = useState<string>('');
  const [importGrade, setImportGrade] = useState<10 | 11 | 12>(11);

  const currentStoredMatrix = useMemo(
    () => matrices.find((m) => m.id === selectedMatrixId) || matrices[0],
    [matrices, selectedMatrixId]
  );

  // Load selected matrix into inline editable working copy
  useEffect(() => {
    if (currentStoredMatrix && (!workingMatrix || workingMatrix.id !== currentStoredMatrix.id)) {
      setWorkingMatrix(JSON.parse(JSON.stringify(currentStoredMatrix)));
      setHasUnsavedChanges(false);
    }
  }, [currentStoredMatrix, workingMatrix]);

  // Check localStorage draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ExamMatrix;
        if (parsed && parsed.title && Array.isArray(parsed.topics)) {
          setDraftNotice(`Phát hiện bản nháp ma trận chưa lưu: "${parsed.title}"`);
        }
      }
    } catch {
      // ignore invalid draft
    }
  }, []);

  // Auto-save workingMatrix draft whenever edited
  useEffect(() => {
    if (hasUnsavedChanges && workingMatrix) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(workingMatrix));
      } catch {
        // ignore storage quota errors
      }
    }
  }, [hasUnsavedChanges, workingMatrix]);

  const activeMatrix = workingMatrix || currentStoredMatrix;

  const summary = useMemo(() => {
    if (!activeMatrix) return null;
    return computeMatrixSummary(activeMatrix);
  }, [activeMatrix]);

  const updateWorking = (updater: (prev: ExamMatrix) => ExamMatrix) => {
    if (!activeMatrix) return;
    setWorkingMatrix((prev) => {
      const base = prev || JSON.parse(JSON.stringify(activeMatrix));
      const next = updater(base);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveWorkingMatrix = () => {
    if (!activeMatrix || !summary) return;
    const finalized: ExamMatrix = {
      ...activeMatrix,
      totalQuestions: summary.totalQuestions,
      totalScore: summary.totalScore,
      updatedAt: new Date().toISOString(),
    };
    if (matrices.some((m) => m.id === finalized.id)) {
      updateMatrix(finalized.id, finalized);
    } else {
      addMatrix(finalized);
    }
    setSelectedMatrixId(finalized.id);
    setWorkingMatrix(JSON.parse(JSON.stringify(finalized)));
    setHasUnsavedChanges(false);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setDraftNotice(null);
    setSaveToast('Đã lưu ma trận & bản đặc tả thành công!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ExamMatrix;
        setWorkingMatrix(parsed);
        setHasUnsavedChanges(true);
        setDraftNotice(null);
      }
    } catch {
      setDraftNotice(null);
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setDraftNotice(null);
    if (currentStoredMatrix) {
      setWorkingMatrix(JSON.parse(JSON.stringify(currentStoredMatrix)));
      setHasUnsavedChanges(false);
    }
  };

  const handleCreateBlankMatrix = () => {
    const newId = `matrix_${Date.now()}`;
    const topId = `top_${Date.now()}_1`;
    const blankRow: MatrixTopicRow = {
      id: topId,
      topicName: 'Chủ đề 1 (Nhập tên chương/chủ đề)',
      unitLesson: 'Bài học / Nội dung kiến thức SGK KNTT',
      requiredCompetency: 'Nhập yêu cầu cần đạt theo Chương trình GDPT 2018',
      mcq_nb: 0,
      mcq_th: 0,
      mcq_vd: 0,
      mcq_vdc: 0,
      tf_nb: 0,
      tf_th: 0,
      tf_vd: 0,
      tf_vdc: 0,
      short_nb: 0,
      short_th: 0,
      short_vd: 0,
      short_vdc: 0,
      essay_nb: 0,
      essay_th: 0,
      essay_vd: 0,
      essay_vdc: 0,
      totalScore: 0,
    };
    const newMatrix: ExamMatrix = {
      id: newId,
      title: 'Ma trận & Đặc tả Đề kiểm tra Hóa học mới',
      grade: 11,
      schoolYear: '2026 - 2027',
      semester: 1,
      examType: 'GIUA_KY',
      textbook: 'KNTT',
      durationMinutes: 45,
      totalScore: 0,
      totalQuestions: 0,
      tfScoringRule: { ...DEFAULT_TF_SCORING_RULE },
      sourceReference: 'Giáo viên biên soạn trực tiếp',
      isVerifiedContent: true,
      topics: [blankRow],
      specifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addMatrix(newMatrix);
    setSelectedMatrixId(newMatrix.id);
    setWorkingMatrix(JSON.parse(JSON.stringify(newMatrix)));
    setHasUnsavedChanges(false);
    setSubMode('spreadsheet');
  };

  const handleCellCountChange = (
    rowIdx: number,
    type: QuestionType,
    level: CognitiveLevel,
    rawValue: string
  ) => {
    const parsedCount = parseNonNegativeIntOrNull(rawValue);
    updateWorking((prev) => {
      const row = prev.topics[rowIdx];
      if (!row) return prev;
      const existingCell = getMatrixCell(row, type, level, prev.tfScoringRule);
      const tfRule = prev.tfScoringRule || DEFAULT_TF_SCORING_RULE;

      // Auto-calculate default points only if user enters a positive count and points wasn't manually set non-zero,
      // or scales cleanly if switching count to 0 -> 0 points.
      let nextPoints = existingCell.points;
      if (parsedCount === null) {
        nextPoints = existingCell.points;
      } else if (parsedCount === 0) {
        nextPoints = 0;
      } else {
        const unit =
          type === 'MCQ'
            ? 0.25
            : type === 'MULTIPLE_TRUE_FALSE'
            ? tfRule.pointsFor4
            : type === 'SHORT_ANSWER'
            ? 0.5
            : 1.0;
        if ((existingCell.count ?? 0) === 0 || existingCell.points === null || existingCell.points === 0) {
          nextPoints = Math.round(parsedCount * unit * 1000) / 1000;
        }
      }

      const nextSubItems =
        type === 'MULTIPLE_TRUE_FALSE'
          ? parsedCount === null
            ? null
            : parsedCount * 4
          : existingCell.subItemCount;

      const updatedRow = setMatrixCell(
        row,
        type,
        level,
        {
          count: parsedCount,
          subItemCount: nextSubItems,
          points: nextPoints,
        },
        prev.tfScoringRule
      );

      const updatedTopics = prev.topics.map((t, i) => (i === rowIdx ? updatedRow : t));
      const draftWithTopics: ExamMatrix = { ...prev, topics: updatedTopics };
      // Automatically sync Matrix -> Specifications (preserving spec text descriptions!)
      const syncedSpecs = syncMatrixToSpecifications(draftWithTopics);
      return {
        ...draftWithTopics,
        specifications: syncedSpecs,
      };
    });
  };

  const handleCellPointsChange = (
    rowIdx: number,
    type: QuestionType,
    level: CognitiveLevel,
    rawValue: string
  ) => {
    const parsedPts = parseNonNegativeDecimalOrNull(rawValue);
    updateWorking((prev) => {
      const row = prev.topics[rowIdx];
      if (!row) return prev;
      const updatedRow = setMatrixCell(
        row,
        type,
        level,
        { points: parsedPts },
        prev.tfScoringRule
      );
      const updatedTopics = prev.topics.map((t, i) => (i === rowIdx ? updatedRow : t));
      const draftWithTopics: ExamMatrix = { ...prev, topics: updatedTopics };
      return {
        ...draftWithTopics,
        specifications: syncMatrixToSpecifications(draftWithTopics),
      };
    });
  };

  const handleCellSubItemChange = (
    rowIdx: number,
    level: CognitiveLevel,
    rawValue: string
  ) => {
    const parsedSubs = parseNonNegativeIntOrNull(rawValue);
    updateWorking((prev) => {
      const row = prev.topics[rowIdx];
      if (!row) return prev;
      const updatedRow = setMatrixCell(
        row,
        'MULTIPLE_TRUE_FALSE',
        level,
        { subItemCount: parsedSubs },
        prev.tfScoringRule
      );
      const updatedTopics = prev.topics.map((t, i) => (i === rowIdx ? updatedRow : t));
      const draftWithTopics: ExamMatrix = { ...prev, topics: updatedTopics };
      return {
        ...draftWithTopics,
        specifications: syncMatrixToSpecifications(draftWithTopics),
      };
    });
  };

  const handleCellNoteChange = (
    rowIdx: number,
    type: QuestionType,
    level: CognitiveLevel,
    note: string
  ) => {
    updateWorking((prev) => {
      const row = prev.topics[rowIdx];
      if (!row) return prev;
      const updatedRow = setMatrixCell(row, type, level, { note }, prev.tfScoringRule);
      return {
        ...prev,
        topics: prev.topics.map((t, i) => (i === rowIdx ? updatedRow : t)),
      };
    });
  };

  const handleMoveTopic = (rowIdx: number, direction: -1 | 1) => {
    if (!activeMatrix) return;
    const targetIdx = rowIdx + direction;
    if (targetIdx < 0 || targetIdx >= activeMatrix.topics.length) return;
    updateWorking((prev) => {
      const nextTopics = [...prev.topics];
      const [moved] = nextTopics.splice(rowIdx, 1);
      nextTopics.splice(targetIdx, 0, moved);
      const next = { ...prev, topics: nextTopics };
      return { ...next, specifications: syncMatrixToSpecifications(next) };
    });
  };

  const handleCloneTopic = (rowIdx: number) => {
    updateWorking((prev) => {
      const src = prev.topics[rowIdx];
      if (!src) return prev;
      const cloned: MatrixTopicRow = {
        ...JSON.parse(JSON.stringify(src)),
        id: `top_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        topicName: `${src.topicName} (Bản sao)`,
      };
      const nextTopics = [...prev.topics];
      nextTopics.splice(rowIdx + 1, 0, cloned);
      const next = { ...prev, topics: nextTopics };
      return { ...next, specifications: syncMatrixToSpecifications(next) };
    });
  };

  const handleAddTopicRow = () => {
    updateWorking((prev) => {
      const newRow: MatrixTopicRow = {
        id: `top_${Date.now()}`,
        topicName: `Chủ đề ${prev.topics.length + 1}`,
        unitLesson: 'Nội dung bài học SGK',
        requiredCompetency: 'Yêu cầu cần đạt theo chương trình GDPT 2018',
        mcq_nb: 0,
        mcq_th: 0,
        mcq_vd: 0,
        mcq_vdc: 0,
        tf_nb: 0,
        tf_th: 0,
        tf_vd: 0,
        tf_vdc: 0,
        short_nb: 0,
        short_th: 0,
        short_vd: 0,
        short_vdc: 0,
        essay_nb: 0,
        essay_th: 0,
        essay_vd: 0,
        essay_vdc: 0,
        totalScore: 0,
      };
      return { ...prev, topics: [...prev.topics, newRow] };
    });
  };

  const handleDeleteTopicRow = (topId: string) => {
    updateWorking((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== topId),
      specifications: prev.specifications.filter((s) => s.topicId !== topId),
    }));
  };

  // Inline specification row update (Notice: Spec edits do NOT auto-overwrite Matrix unless teacher explicitly confirms reverse sync!)
  const handleSpecFieldChange = (specIdx: number, patch: Partial<SpecificationItem>) => {
    updateWorking((prev) => ({
      ...prev,
      specifications: prev.specifications.map((s, i) => (i === specIdx ? { ...s, ...patch } : s)),
    }));
  };

  const handleAddSpecRow = () => {
    updateWorking((prev) => {
      const firstTopic = prev.topics[0];
      const newSpec: SpecificationItem = {
        id: `spec_${Date.now()}`,
        topicId: firstTopic?.id || '',
        chapterName: firstTopic?.topicName || 'Chương / Chủ đề',
        lessonName: firstTopic?.unitLesson || 'Bài học',
        topicName: firstTopic?.topicName || 'Chủ đề mới',
        knowledgeContent: firstTopic?.unitLesson || '',
        requiredCompetency: 'Nhập yêu cầu cần đạt...',
        assessmentContent: 'Mô tả yêu cầu đánh giá...',
        cognitiveLevel: 'NHAN_BIET',
        questionType: 'MCQ',
        questionCount: 0,
        scorePerQuestion: 0.25,
        totalItemScore: 0,
        linkedQuestionIds: [],
        questionNumbersPreview: '0 câu',
      };
      return {
        ...prev,
        specifications: [...prev.specifications, newSpec],
      };
    });
  };

  const handleSyncMatrixToSpec = () => {
    updateWorking((prev) => ({
      ...prev,
      specifications: syncMatrixToSpecifications(prev),
    }));
  };

  const handleApplySpecNumbersToMatrix = () => {
    updateWorking((prev) => {
      const updatedTopics = prev.topics.map((row) => {
        let nextRow = { ...row };
        for (const qt of QUESTION_TYPES) {
          for (const lv of COGNITIVE_LEVELS) {
            const matching = prev.specifications.filter(
              (s) =>
                (s.topicId === row.id || s.topicName === row.topicName) &&
                s.questionType === qt &&
                s.cognitiveLevel === lv
            );
            if (matching.length > 0) {
              const totalCount = matching.reduce((a, s) => a + (s.questionCount ?? 0), 0);
              const totalPts = matching.reduce(
                (a, s) =>
                  a + (s.totalItemScore ?? (s.questionCount ?? 0) * (s.scorePerQuestion ?? 0)),
                0
              );
              const totalSubs = matching.reduce((a, s) => a + (s.subItemCount ?? 0), 0);
              nextRow = setMatrixCell(
                nextRow,
                qt,
                lv,
                {
                  count: totalCount,
                  points: Math.round(totalPts * 1000) / 1000,
                  subItemCount: qt === 'MULTIPLE_TRUE_FALSE' ? totalSubs || totalCount * 4 : undefined,
                },
                prev.tfScoringRule
              );
            }
          }
        }
        return nextRow;
      });
      return { ...prev, topics: updatedTopics };
    });
    setConfirmReverseSync(false);
  };

  // Real File Upload Parser (NEVER invents fake matrices!)
  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportFileName(file.name);
    setImportTitle(`Ma trận từ tệp: ${file.name.replace(/\.[^/.]+$/, '')}`);
    setImportGrade(file.name.includes('10') ? 10 : file.name.includes('12') ? 12 : 11);

    try {
      const res = await extractTextFromUploadedFile(file);
      if (!res.text.trim() && (!res.excelRows || res.excelRows.length === 0)) {
        setImportError(
          'Không trích xuất được nội dung văn bản từ tệp (có thể là tệp PDF dạng ảnh scan hoặc tệp .doc nhị phân cũ). Hệ thống KHÔNG tự tạo dữ liệu giả. Vui lòng chuyển sang .docx/.xlsx hoặc tự tạo bảng bên tab Bảng tính.'
        );
        setExtractedText('');
        setExtractedExcelRows(null);
        return;
      }
      setExtractedText(res.text);
      setExtractedExcelRows(res.excelRows || null);
    } catch (err) {
      setImportError(
        `Lỗi đọc tệp "${file.name}". Vui lòng kiểm tra định dạng .xlsx, .docx, .csv hoặc .pdf chứa lớp văn bản.`
      );
    }
  };

  // Create Matrix from verified extracted rows/lines (never invents missing cells!)
  const handleCreateMatrixFromExtracted = () => {
    const topics: MatrixTopicRow[] = [];

    if (extractedExcelRows && extractedExcelRows.length > 0) {
      // Find rows that look like data (non-empty)
      extractedExcelRows.forEach((row, idx) => {
        if (!Array.isArray(row) || row.every((c) => String(c || '').trim() === '')) return;
        const textCols = row.filter((c) => typeof c === 'string' && c.trim().length > 2);
        if (textCols.length === 0) return;
        // Skip obvious title rows if idx === 0
        if (idx === 0 && /MA TRẬN|KHỐI|HÓA HỌC/i.test(String(textCols[0]))) return;

        topics.push({
          id: `top_imp_${Date.now()}_${idx}`,
          topicName: String(row[1] ?? row[0] ?? `Chủ đề ${topics.length + 1}`).trim(),
          unitLesson: String(row[2] ?? '').trim(),
          requiredCompetency: String(row[3] ?? '').trim(),
          mcq_nb: parseNonNegativeIntOrNull(String(row[4] ?? '')) ?? 0,
          mcq_th: parseNonNegativeIntOrNull(String(row[5] ?? '')) ?? 0,
          mcq_vd: parseNonNegativeIntOrNull(String(row[6] ?? '')) ?? 0,
          mcq_vdc: parseNonNegativeIntOrNull(String(row[7] ?? '')) ?? 0,
          tf_nb: parseNonNegativeIntOrNull(String(row[8] ?? '')) ?? 0,
          tf_th: parseNonNegativeIntOrNull(String(row[9] ?? '')) ?? 0,
          tf_vd: parseNonNegativeIntOrNull(String(row[10] ?? '')) ?? 0,
          tf_vdc: parseNonNegativeIntOrNull(String(row[11] ?? '')) ?? 0,
          short_nb: parseNonNegativeIntOrNull(String(row[12] ?? '')) ?? 0,
          short_th: parseNonNegativeIntOrNull(String(row[13] ?? '')) ?? 0,
          short_vd: parseNonNegativeIntOrNull(String(row[14] ?? '')) ?? 0,
          short_vdc: parseNonNegativeIntOrNull(String(row[15] ?? '')) ?? 0,
          essay_nb: parseNonNegativeIntOrNull(String(row[16] ?? '')) ?? 0,
          essay_th: parseNonNegativeIntOrNull(String(row[17] ?? '')) ?? 0,
          essay_vd: parseNonNegativeIntOrNull(String(row[18] ?? '')) ?? 0,
          essay_vdc: parseNonNegativeIntOrNull(String(row[19] ?? '')) ?? 0,
          totalScore: parseNonNegativeDecimalOrNull(String(row[20] ?? '')) ?? 0,
        });
      });
    } else if (extractedText.trim()) {
      const lines = extractedText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 5 && /chương|bài|chủ đề|nội dung/i.test(l));
      const candidateLines =
        lines.length > 0
          ? lines.slice(0, 12)
          : extractedText
              .split('\n')
              .map((l) => l.trim())
              .filter((l) => l.length > 6)
              .slice(0, 8);

      candidateLines.forEach((line, idx) => {
        topics.push({
          id: `top_txt_${Date.now()}_${idx}`,
          topicName: line.slice(0, 90),
          unitLesson: 'Kiểm tra và điền số câu/điểm theo tài liệu gốc',
          mcq_nb: 0,
          mcq_th: 0,
          mcq_vd: 0,
          mcq_vdc: 0,
          tf_nb: 0,
          tf_th: 0,
          tf_vd: 0,
          tf_vdc: 0,
          short_nb: 0,
          short_th: 0,
          short_vd: 0,
          short_vdc: 0,
          essay_nb: 0,
          essay_th: 0,
          essay_vd: 0,
          essay_vdc: 0,
          totalScore: 0,
        });
      });
    }

    if (topics.length === 0) {
      setImportError(
        'Không tìm thấy dòng chủ đề hợp lệ trong nội dung đã đọc. Vui lòng tạo bảng thủ công để đảm bảo chính xác.'
      );
      return;
    }

    const newM: ExamMatrix = {
      id: `matrix_imp_${Date.now()}`,
      title: importTitle || `Ma trận nhập từ ${importFileName}`,
      grade: importGrade,
      schoolYear: '2026 - 2027',
      semester: 1,
      examType: 'GIUA_KY',
      textbook: 'KNTT',
      durationMinutes: 45,
      totalScore: 0,
      totalQuestions: 0,
      tfScoringRule: { ...DEFAULT_TF_SCORING_RULE },
      sourceReference: `Trích xuất trực tiếp từ tệp: ${importFileName}`,
      isVerifiedContent: false,
      topics,
      specifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newM.specifications = syncMatrixToSpecifications(newM);
    const s = computeMatrixSummary(newM);
    newM.totalQuestions = s.totalQuestions;
    newM.totalScore = s.totalScore;

    addMatrix(newM);
    setSelectedMatrixId(newM.id);
    setWorkingMatrix(JSON.parse(JSON.stringify(newM)));
    setHasUnsavedChanges(false);
    setSubMode('spreadsheet');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              Ma Trận & Bản Đặc Tả Đề Kiểm Tra (Dạng Bảng Tính)
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Chỉnh sửa trực tiếp từng ô: hỗ trợ giá trị 0 câu, điểm thập phân, đồng bộ chỉ tiêu sang Bản đặc tả & xuất Word/Excel.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubMode('spreadsheet')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold min-h-[44px] flex items-center gap-2 transition-all ${
              subMode === 'spreadsheet'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bảng tính Ma trận & Đặc tả</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode('import')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold min-h-[44px] flex items-center gap-2 transition-all ${
              subMode === 'import'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Nhập Excel / Word / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode('library')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold min-h-[44px] flex items-center gap-2 transition-all ${
              subMode === 'library'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Thư viện tham khảo ({referenceSources.length})</span>
          </button>
        </div>
      </div>

      {/* Draft & Save notifications */}
      {draftNotice && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-950 font-bold">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <span>{draftNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3.5 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700"
            >
              Khôi phục bản nháp
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3.5 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 rounded-xl"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {saveToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-900 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* =================================================================
          SUBMODE 1: INLINE SPREADSHEET EDITOR FOR MATRIX & SPECIFICATION
          ================================================================= */}
      {subMode === 'spreadsheet' && activeMatrix && summary && (
        <div className="space-y-5">
          {/* Matrix Selector & Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Ma trận đang mở:
              </span>
              <select
                value={activeMatrix.id}
                onChange={(e) => {
                  const found = matrices.find((m) => m.id === e.target.value);
                  setSelectedMatrixId(e.target.value);
                  if (found) {
                    setWorkingMatrix(JSON.parse(JSON.stringify(found)));
                    setHasUnsavedChanges(false);
                  }
                }}
                className="px-3.5 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl min-h-[44px] max-w-md"
              >
                {matrices.map((m) => (
                  <option key={m.id} value={m.id}>
                    [Lớp {m.grade}] {m.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleCreateBlankMatrix}
                className="px-3.5 py-2 text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 rounded-xl flex items-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo ma trận trống mới</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const cloned = cloneMatrix(activeMatrix.id);
                  setSelectedMatrixId(cloned.id);
                  setWorkingMatrix(JSON.parse(JSON.stringify(cloned)));
                  setHasUnsavedChanges(false);
                }}
                className="px-3.5 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 min-h-[44px]"
              >
                <Copy className="w-4 h-4 text-amber-600" />
                <span>Sao chép cấu hình</span>
              </button>

              {matrices.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const remaining = matrices.filter((m) => m.id !== activeMatrix.id);
                    deleteMatrix(activeMatrix.id);
                    if (remaining[0]) {
                      setSelectedMatrixId(remaining[0].id);
                      setWorkingMatrix(JSON.parse(JSON.stringify(remaining[0])));
                    }
                  }}
                  className="p-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl min-h-[44px]"
                  title="Xóa ma trận này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportMatrixToDocx(activeMatrix)}
                className="px-3.5 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 min-h-[44px]"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Xuất Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => exportMatrixToExcel(activeMatrix)}
                className="px-3.5 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 min-h-[44px]"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Xuất Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveWorkingMatrix}
                className={`px-4 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 min-h-[44px] shadow-xs transition-all ${
                  hasUnsavedChanges
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{hasUnsavedChanges ? 'Lưu thay đổi*' : 'Đã lưu'}</span>
              </button>

              {onUseMatrixForExam && (
                <button
                  type="button"
                  onClick={() => {
                    if (hasUnsavedChanges) handleSaveWorkingMatrix();
                    onUseMatrixForExam({
                      ...activeMatrix,
                      totalQuestions: summary.totalQuestions,
                      totalScore: summary.totalScore,
                    });
                  }}
                  className="px-4 py-2 text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1.5 min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sinh đề từ ma trận này</span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Metadata Config */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-bold text-slate-700">
            <div className="lg:col-span-2">
              <label className="block mb-1 text-slate-500">Tên ma trận / kỳ kiểm tra:</label>
              <input
                type="text"
                value={activeMatrix.title}
                onChange={(e) => updateWorking((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-500">Khối lớp:</label>
              <select
                value={activeMatrix.grade}
                onChange={(e) =>
                  updateWorking((p) => ({
                    ...p,
                    grade: Number(e.target.value) as 10 | 11 | 12,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value={10}>Hóa học 10</option>
                <option value={11}>Hóa học 11</option>
                <option value={12}>Hóa học 12</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-500">Kỳ kiểm tra:</label>
              <select
                value={activeMatrix.examType}
                onChange={(e) =>
                  updateWorking((p) => ({
                    ...p,
                    examType: e.target.value as ExamMatrix['examType'],
                  }))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="THUONG_XUYEN">Thường xuyên</option>
                <option value="GIUA_KY">Giữa học kỳ</option>
                <option value="CUOI_KY">Cuối học kỳ</option>
                <option value="LUYEN_THI_THPT">Luyện thi THPT</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-500">Học kỳ & Năm học:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={activeMatrix.semester}
                  onChange={(e) =>
                    updateWorking((p) => ({ ...p, semester: Number(e.target.value) as 1 | 2 }))
                  }
                  className="px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value={1}>HK I</option>
                  <option value={2}>HK II</option>
                </select>
                <input
                  type="text"
                  value={activeMatrix.schoolYear}
                  onChange={(e) => updateWorking((p) => ({ ...p, schoolYear: e.target.value }))}
                  className="px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-slate-500">Thời gian (phút):</label>
              <input
                type="number"
                min={5}
                max={180}
                value={activeMatrix.durationMinutes}
                onChange={(e) =>
                  updateWorking((p) => ({
                    ...p,
                    durationMinutes: Math.max(1, Number(e.target.value) || 45),
                  }))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center"
              />
            </div>
          </div>

          {/* Analytics Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Tổng số câu</span>
              <div className="text-xl font-black text-slate-800">{summary.totalQuestions} câu</div>
              <span className="text-[11px] text-slate-500">
                Đ/S: {summary.byType.MULTIPLE_TRUE_FALSE.subItems} ý
              </span>
            </div>

            <div
              className={`p-3.5 bg-white rounded-2xl shadow-2xs border ${
                Math.abs(summary.totalScore - 10) < 0.001
                  ? 'border-emerald-300'
                  : 'border-amber-300'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Tổng điểm</span>
              <div
                className={`text-xl font-black ${
                  Math.abs(summary.totalScore - 10) < 0.001 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {summary.totalScore} đ
              </div>
              <span className="text-[11px] text-slate-500">
                {Math.abs(summary.totalScore - 10) < 0.001 ? 'Khớp thang 10.0' : 'Khác 10.0 đ'}
              </span>
            </div>

            {COGNITIVE_LEVELS.map((lv) => (
              <div key={lv} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-bold text-teal-700 uppercase block">
                  {COGNITIVE_LEVEL_LABELS[lv]}
                </span>
                <div className="text-lg font-black text-slate-800">
                  {summary.byLevel[lv].count} câu · {summary.byLevel[lv].score} đ
                </div>
                <span className="text-[11px] text-slate-500">
                  Tỷ lệ: {summary.byLevel[lv].percent}%
                </span>
              </div>
            ))}
          </div>

          {/* Warnings: Blank cells vs 0, Total score mismatch, Matrix <-> Spec mismatch */}
          {summary.hasBlankCells && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs font-bold text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Có ô đang để trống (chưa nhập). Nếu một mức độ không có câu hỏi, vui lòng nhập rõ số <strong>0</strong> thay vì bỏ trống.
              </span>
            </div>
          )}

          {summary.mismatches.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>
                    Cảnh báo lệch dữ liệu giữa Ma trận và Bản đặc tả ({summary.mismatches.length} mục)!
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncMatrixToSpec}
                    className="px-3.5 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Đồng bộ từ Ma trận sang Bản đặc tả</span>
                  </button>
                  {!confirmReverseSync ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReverseSync(true)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-white text-rose-800 border border-rose-300 rounded-xl"
                    >
                      Cập nhật ngược từ Đặc tả vào Ma trận...
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplySpecNumbersToMatrix}
                      className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-xl"
                    >
                      Xác nhận ghi đè số liệu Ma trận theo Đặc tả
                    </button>
                  )}
                </div>
              </div>
              <ul className="text-xs text-rose-800 space-y-1 pl-6 list-disc">
                {summary.mismatches.slice(0, 5).map((m, i) => (
                  <li key={i}>
                    <strong>{m.topicName}</strong> ({QUESTION_TYPE_LABELS[m.questionType]} -{' '}
                    {COGNITIVE_LEVEL_LABELS[m.cognitiveLevel]}): {m.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* =================================================================
              PART I: INLINE EDITABLE MATRIX SPREADSHEET TABLE
              ================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  I. BẢNG MA TRẬN ĐỀ KIỂM TRA (CHỈNH SỬA TRỰC TIẾP TỪNG Ô)
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập trực tiếp Số câu (cho phép 0 câu), Số ý (Đúng/Sai), Điểm thập phân và Ghi chú từng ô.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllTypeCols(!showAllTypeCols)}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-700"
                >
                  {showAllTypeCols ? 'Thu gọn cột' : 'Mở rộng đủ 16 ô mức độ'}
                </button>
                <button
                  type="button"
                  onClick={handleAddTopicRow}
                  className="px-3.5 py-2 text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm dòng chủ đề</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-3">
              <table className="w-full text-xs border-collapse min-w-[1150px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="p-2 border border-slate-300 text-center w-10" rowSpan={2}>
                      TT
                    </th>
                    <th className="p-2 border border-slate-300 text-left min-w-[240px]" rowSpan={2}>
                      Chương / Chủ đề & Nội dung kiến thức & Yêu cầu cần đạt
                    </th>
                    {QUESTION_TYPES.map((qt) => (
                      <th
                        key={qt}
                        colSpan={showAllTypeCols ? 4 : 1}
                        className={`p-2 border border-slate-300 text-center font-black ${TYPE_GROUP_COLORS[qt].header}`}
                      >
                        {TYPE_GROUP_COLORS[qt].label}
                      </th>
                    ))}
                    <th className="p-2 border border-slate-300 text-center w-24" rowSpan={2}>
                      Tổng câu / Điểm dòng
                    </th>
                    <th className="p-2 border border-slate-300 text-center w-24" rowSpan={2}>
                      Thao tác dòng
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-600">
                    {QUESTION_TYPES.map((qt) =>
                      showAllTypeCols ? (
                        COGNITIVE_LEVELS.map((lv) => (
                          <th
                            key={`${qt}_${lv}`}
                            className="p-1.5 border border-slate-300 text-center font-bold w-20"
                          >
                            {SHORT_LEVEL_LABELS[lv]}
                          </th>
                        ))
                      ) : (
                        <th key={qt} className="p-1.5 border border-slate-300 text-center font-bold">
                          Tổng câu & Điểm
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {activeMatrix.topics.map((row, rIdx) => {
                    const rowStat = summary.byTopic[row.id] || { count: 0, score: 0 };
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/70 align-top">
                        <td className="p-2 border border-slate-300 text-center font-bold text-slate-600">
                          {rIdx + 1}
                        </td>
                        <td className="p-2 border border-slate-300 space-y-1.5">
                          <input
                            type="text"
                            value={row.topicName}
                            placeholder="Chương / Chủ đề..."
                            onChange={(e) =>
                              updateWorking((p) => ({
                                ...p,
                                topics: p.topics.map((t, i) =>
                                  i === rIdx ? { ...t, topicName: e.target.value } : t
                                ),
                              }))
                            }
                            className="w-full px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-500"
                          />
                          <input
                            type="text"
                            value={row.unitLesson}
                            placeholder="Nội dung kiến thức / Bài học..."
                            onChange={(e) =>
                              updateWorking((p) => ({
                                ...p,
                                topics: p.topics.map((t, i) =>
                                  i === rIdx ? { ...t, unitLesson: e.target.value } : t
                                ),
                              }))
                            }
                            className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700"
                          />
                          <input
                            type="text"
                            value={row.requiredCompetency || ''}
                            placeholder="Yêu cầu cần đạt..."
                            onChange={(e) =>
                              updateWorking((p) => ({
                                ...p,
                                topics: p.topics.map((t, i) =>
                                  i === rIdx ? { ...t, requiredCompetency: e.target.value } : t
                                ),
                              }))
                            }
                            className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-600 italic"
                          />
                        </td>

                        {QUESTION_TYPES.map((qt) =>
                          showAllTypeCols ? (
                            COGNITIVE_LEVELS.map((lv) => {
                              const cell = getMatrixCell(row, qt, lv, activeMatrix.tfScoringRule);
                              const noteKey = `${row.id}_${qt}_${lv}`;
                              const isEditingNote = editingNoteKey === noteKey;
                              return (
                                <td
                                  key={noteKey}
                                  className={`p-1.5 border border-slate-300 ${TYPE_GROUP_COLORS[qt].cell} space-y-1`}
                                >
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400 w-4">C:</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={1}
                                      value={cell.count === null ? '' : cell.count}
                                      placeholder="0"
                                      onChange={(e) =>
                                        handleCellCountChange(rIdx, qt, lv, e.target.value)
                                      }
                                      className="w-full px-1 py-0.5 text-center font-bold text-slate-900 bg-white border border-slate-300 rounded text-xs"
                                      title="Số câu hỏi (nhập 0 nếu không có)"
                                    />
                                  </div>

                                  {qt === 'MULTIPLE_TRUE_FALSE' && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-sky-600 w-4">Ý:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={cell.subItemCount === null || cell.subItemCount === undefined ? '' : cell.subItemCount}
                                        placeholder="0"
                                        onChange={(e) =>
                                          handleCellSubItemChange(rIdx, lv, e.target.value)
                                        }
                                        className="w-full px-1 py-0.5 text-center text-sky-900 bg-white border border-sky-200 rounded text-[11px]"
                                        title="Số ý Đúng/Sai"
                                      />
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400 w-4">Đ:</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={0.05}
                                      value={cell.points === null ? '' : cell.points}
                                      placeholder="0"
                                      onChange={(e) =>
                                        handleCellPointsChange(rIdx, qt, lv, e.target.value)
                                      }
                                      className="w-full px-1 py-0.5 text-center font-semibold text-teal-800 bg-white border border-slate-200 rounded text-[11px]"
                                      title="Điểm số ô"
                                    />
                                  </div>

                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingNoteKey(isEditingNote ? null : noteKey)
                                      }
                                      className={`text-[10px] px-1 rounded flex items-center gap-0.5 ${
                                        cell.note
                                          ? 'text-amber-700 bg-amber-100 font-bold'
                                          : 'text-slate-400 hover:text-slate-600'
                                      }`}
                                      title={cell.note || 'Thêm ghi chú ô'}
                                    >
                                      <MessageSquare className="w-2.5 h-2.5" />
                                      {cell.note ? 'Ghi chú' : ''}
                                    </button>
                                  </div>

                                  {isEditingNote && (
                                    <input
                                      type="text"
                                      value={cell.note || ''}
                                      placeholder="Ghi chú ô..."
                                      onChange={(e) =>
                                        handleCellNoteChange(rIdx, qt, lv, e.target.value)
                                      }
                                      onBlur={() => setEditingNoteKey(null)}
                                      autoFocus
                                      className="w-full px-1.5 py-0.5 text-[10px] bg-amber-50 border border-amber-300 rounded"
                                    />
                                  )}
                                </td>
                              );
                            })
                          ) : (
                            <td
                              key={`${row.id}_${qt}_compact`}
                              className={`p-2 border border-slate-300 text-center ${TYPE_GROUP_COLORS[qt].cell}`}
                            >
                              {(() => {
                                const qSum = COGNITIVE_LEVELS.reduce(
                                  (a, lv) => a + (getMatrixCell(row, qt, lv).count ?? 0),
                                  0
                                );
                                const pSum = COGNITIVE_LEVELS.reduce(
                                  (a, lv) => a + (getMatrixCell(row, qt, lv).points ?? 0),
                                  0
                                );
                                return (
                                  <div>
                                    <div className="font-black text-slate-800">{qSum} câu</div>
                                    <div className="text-[11px] text-teal-800 font-bold">
                                      {Math.round(pSum * 100) / 100} đ
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                          )
                        )}

                        <td className="p-2 border border-slate-300 text-center bg-slate-50 font-black">
                          <div className="text-slate-900 text-sm">{rowStat.count} câu</div>
                          <div className="text-teal-800">{rowStat.score} đ</div>
                        </td>

                        <td className="p-2 border border-slate-300 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveTopic(rIdx, -1)}
                              disabled={rIdx === 0}
                              className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                              title="Chuyển lên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveTopic(rIdx, 1)}
                              disabled={rIdx === activeMatrix.topics.length - 1}
                              className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                              title="Chuyển xuống"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCloneTopic(rIdx)}
                              className="p-1 rounded border border-slate-200 text-amber-700 hover:bg-amber-50"
                              title="Nhân bản chủ đề"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTopicRow(row.id)}
                              className="p-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50"
                              title="Xóa dòng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-900">
                    <td colSpan={2} className="p-2.5 border border-slate-300 text-right uppercase">
                      Tổng cộng theo dạng & mức độ:
                    </td>
                    {QUESTION_TYPES.map((qt) =>
                      showAllTypeCols ? (
                        COGNITIVE_LEVELS.map((lv) => {
                          const cCount = activeMatrix.topics.reduce(
                            (s, r) => s + (getMatrixCell(r, qt, lv).count ?? 0),
                            0
                          );
                          const cPts = activeMatrix.topics.reduce(
                            (s, r) => s + (getMatrixCell(r, qt, lv).points ?? 0),
                            0
                          );
                          return (
                            <td
                              key={`foot_${qt}_${lv}`}
                              className="p-1.5 border border-slate-300 text-center"
                            >
                              <div>{cCount} câu</div>
                              <div className="text-[11px] text-teal-800">
                                {Math.round(cPts * 100) / 100}đ
                              </div>
                            </td>
                          );
                        })
                      ) : (
                        <td
                          key={`foot_${qt}`}
                          className="p-2 border border-slate-300 text-center"
                        >
                          {summary.byType[qt].count} câu ({summary.byType[qt].score}đ)
                        </td>
                      )
                    )}
                    <td className="p-2 border border-slate-300 text-center bg-teal-50 text-teal-950">
                      <div>{summary.totalQuestions} câu</div>
                      <div>{summary.totalScore} đ</div>
                    </td>
                    <td className="p-2 border border-slate-300 bg-slate-100" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* =================================================================
              PART II: INLINE EDITABLE SPECIFICATION TABLE
              ================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  II. BẢN ĐẶC TẢ ĐỀ KIỂM TRA (CHỈNH SỬA TRỰC TIẾP TRÊN BẢNG)
                </h3>
                <p className="text-xs text-slate-500">
                  Thay đổi trên Ma trận tự động cập nhật chỉ tiêu Bản đặc tả; chỉnh sửa mô tả văn bản ở Đặc tả không làm hỏng số liệu Ma trận.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncMatrixToSpec}
                  className="px-3.5 py-2 text-xs font-bold bg-white text-teal-800 border border-teal-300 hover:bg-teal-50 rounded-xl flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đồng bộ chỉ tiêu từ Ma trận</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="px-3.5 py-2 text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm dòng đặc tả</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-3">
              <table className="w-full text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-2 border border-slate-300 text-center w-10">TT</th>
                    <th className="p-2 border border-slate-300 text-left w-44">Chương / Bài học</th>
                    <th className="p-2 border border-slate-300 text-left min-w-[200px]">
                      Yêu cầu cần đạt (GDPT 2018)
                    </th>
                    <th className="p-2 border border-slate-300 text-left min-w-[180px]">
                      Mô tả yêu cầu đánh giá
                    </th>
                    <th className="p-2 border border-slate-300 text-center w-32">Mức độ</th>
                    <th className="p-2 border border-slate-300 text-center w-36">Dạng câu hỏi</th>
                    <th className="p-2 border border-slate-300 text-center w-28">Số câu / Ý</th>
                    <th className="p-2 border border-slate-300 text-center w-24">Điểm</th>
                    <th className="p-2 border border-slate-300 text-center w-32">Mã câu liên kết</th>
                    <th className="p-2 border border-slate-300 text-center w-12">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMatrix.specifications.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                        Chưa có dòng đặc tả nào. Nhập số câu vào Ma trận hoặc nhấn &quot;Đồng bộ chỉ tiêu từ Ma trận&quot;.
                      </td>
                    </tr>
                  ) : (
                    activeMatrix.specifications.map((spec, sIdx) => {
                      const bankMatches = questions.filter(
                        (q) =>
                          q.grade === activeMatrix.grade &&
                          q.type === spec.questionType &&
                          q.cognitiveLevel === spec.cognitiveLevel
                      );
                      return (
                        <tr key={spec.id} className="hover:bg-slate-50/70 align-top">
                          <td className="p-2 border border-slate-300 text-center font-bold text-slate-500">
                            {sIdx + 1}
                          </td>
                          <td className="p-2 border border-slate-300 space-y-1">
                            <input
                              type="text"
                              value={spec.topicName}
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, {
                                  topicName: e.target.value,
                                  chapterName: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded"
                            />
                            <input
                              type="text"
                              value={spec.lessonName || spec.knowledgeContent || ''}
                              placeholder="Bài học / Nội dung..."
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, {
                                  lessonName: e.target.value,
                                  knowledgeContent: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2 border border-slate-300">
                            <textarea
                              rows={2}
                              value={spec.requiredCompetency}
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, { requiredCompetency: e.target.value })
                              }
                              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded leading-snug"
                            />
                          </td>
                          <td className="p-2 border border-slate-300">
                            <textarea
                              rows={2}
                              value={spec.assessmentContent}
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, { assessmentContent: e.target.value })
                              }
                              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded leading-snug"
                            />
                          </td>
                          <td className="p-2 border border-slate-300">
                            <select
                              value={spec.cognitiveLevel}
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, {
                                  cognitiveLevel: e.target.value as CognitiveLevel,
                                })
                              }
                              className="w-full p-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded"
                            >
                              {COGNITIVE_LEVELS.map((lv) => (
                                <option key={lv} value={lv}>
                                  {COGNITIVE_LEVEL_LABELS[lv]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 border border-slate-300">
                            <select
                              value={spec.questionType}
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, {
                                  questionType: e.target.value as QuestionType,
                                })
                              }
                              className="w-full p-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded"
                            >
                              {QUESTION_TYPES.map((qt) => (
                                <option key={qt} value={qt}>
                                  {QUESTION_TYPE_LABELS[qt]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 border border-slate-300 space-y-1">
                            <input
                              type="number"
                              min={0}
                              value={spec.questionCount === null ? '' : spec.questionCount}
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, {
                                  questionCount: parseNonNegativeIntOrNull(e.target.value),
                                })
                              }
                              className="w-full px-1.5 py-1 text-center font-bold bg-white border border-slate-300 rounded"
                            />
                            {spec.questionType === 'MULTIPLE_TRUE_FALSE' && (
                              <input
                                type="number"
                                min={0}
                                value={spec.subItemCount ?? ''}
                                placeholder="Số ý"
                                onChange={(e) =>
                                  handleSpecFieldChange(sIdx, {
                                    subItemCount: parseNonNegativeIntOrNull(e.target.value),
                                  })
                                }
                                className="w-full px-1.5 py-0.5 text-center text-[11px] bg-sky-50 border border-sky-200 rounded"
                              />
                            )}
                          </td>
                          <td className="p-2 border border-slate-300">
                            <input
                              type="number"
                              min={0}
                              step={0.05}
                              value={
                                spec.totalItemScore ??
                                Math.round(
                                  (spec.questionCount ?? 0) * (spec.scorePerQuestion ?? 0) * 1000
                                ) / 1000
                              }
                              onChange={(e) => {
                                const pts = parseNonNegativeDecimalOrNull(e.target.value) ?? 0;
                                const cnt = spec.questionCount ?? 0;
                                handleSpecFieldChange(sIdx, {
                                  totalItemScore: pts,
                                  scorePerQuestion: cnt > 0 ? Math.round((pts / cnt) * 1000) / 1000 : 0,
                                });
                              }}
                              className="w-full px-1.5 py-1 text-center font-bold text-teal-800 bg-white border border-slate-300 rounded"
                            />
                          </td>
                          <td className="p-2 border border-slate-300 text-center space-y-1">
                            <input
                              type="text"
                              value={spec.questionNumbersPreview || ''}
                              onChange={(e) =>
                                handleSpecFieldChange(sIdx, {
                                  questionNumbersPreview: e.target.value,
                                })
                              }
                              placeholder="VD: Câu 1-3"
                              className="w-full px-1.5 py-1 text-center text-[11px] bg-slate-50 border border-slate-200 rounded"
                            />
                            <span className="text-[10px] text-slate-400 block">
                              Kho khớp: {bankMatches.length} câu
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                updateWorking((p) => ({
                                  ...p,
                                  specifications: p.specifications.filter((_, i) => i !== sIdx),
                                }))
                              }
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          SUBMODE 2: REAL FILE IMPORT (EXCEL / WORD / PDF)
          ================================================================= */}
      {subMode === 'import' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Nhập Ma Trận & Bản Đặc Tả Từ Tệp Thực Tế (Excel / Word / PDF)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống đọc dữ liệu thật từ tệp giáo viên tải lên để xem trước và nạp vào trình biên tập — tuyệt đối không bịa dữ liệu giả.
              </p>
            </div>
          </div>

          <div className="p-8 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/30 rounded-2xl text-center space-y-3 relative cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.docx,.doc,.pdf,.txt"
              onChange={handleRealFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-10 h-10 text-teal-700 mx-auto" />
            <div className="text-sm font-bold text-slate-800">
              Chọn hoặc kéo thả tệp Ma trận (.xlsx, .docx, .pdf, .csv)
            </div>
            {importFileName && (
              <div className="text-xs font-bold text-teal-800">
                Tệp đã chọn: {importFileName}
              </div>
            )}
          </div>

          {importError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs font-bold text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {extractedText && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold">
                <div className="md:col-span-2">
                  <label className="block mb-1 text-slate-600">Tên ma trận mới sau khi nạp:</label>
                  <input
                    type="text"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-600">Khối lớp:</label>
                  <select
                    value={importGrade}
                    onChange={(e) => setImportGrade(Number(e.target.value) as 10 | 11 | 12)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value={10}>Hóa học 10</option>
                    <option value={11}>Hóa học 11</option>
                    <option value={12}>Hóa học 12</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-xs font-black text-slate-700 uppercase block mb-1.5">
                  Nội dung trích xuất thực tế từ tệp (Giáo viên đối chiếu trước khi tạo bảng):
                </span>
                <textarea
                  rows={8}
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCreateMatrixFromExtracted}
                  className="px-5 py-2.5 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-2 min-h-[44px]"
                >
                  <Check className="w-4 h-4" />
                  <span>Tạo Ma trận từ dữ liệu đã trích xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================
          SUBMODE 3: REFERENCE LIBRARY
          ================================================================= */}
      {subMode === 'library' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Nguồn tham khảo chính thống:</strong> Giáo viên có thể mở cổng trường hoặc tải tệp thực tế lên ở tab Nhập tệp để đối chiếu chính xác từng số liệu.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {referenceSources.map((ref) => (
              <div
                key={ref.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-teal-100 text-teal-800">
                      Khối {ref.grade} · {ref.schoolYear}
                    </span>
                    <span className="text-xs text-slate-500">Công bố: {ref.publishDate}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-800">{ref.schoolName}</h4>
                  <p className="text-xs text-slate-600">{ref.verificationNote}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={ref.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <span>Xem nguồn tham khảo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubMode('import')}
                    className="px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 rounded-xl hover:bg-teal-100"
                  >
                    Tải tệp trường lên
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
