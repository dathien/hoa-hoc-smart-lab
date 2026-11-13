import React, { useMemo, useState } from 'react';
import { useChemStore } from '../../services/store';
import {
  CognitiveLevel,
  EssayRubricStep,
  Question,
  QuestionOption,
  QuestionType,
  TrueFalseStatement,
} from '../../types/chem';
import { COGNITIVE_LEVEL_LABELS, QUESTION_TYPE_LABELS } from '../../utils/examUtils';
import {
  extractTextFromUploadedFile,
  parseQuestionsFromText,
} from '../../utils/docxExportUtils';
import { ChemFormula } from '../common/ChemFormula';
import { SmartChemEditor } from '../common/SmartChemEditor';
import { richHtmlToPlainText } from '../../utils/chemSyntax';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  CheckCircle2,
  Copy,
  Edit2,
  FileQuestion,
  Image as ImageIcon,
  Lock,
  Plus,
  PlusCircle,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

const PRESET_EXPERIMENT_SVGS: { id: string; label: string; svg: string }[] = [
  {
    id: 'none',
    label: 'Không đính kèm sơ đồ',
    svg: '',
  },
  {
    id: 'co2_prep',
    label: 'Điều chế & thu khí CO₂ (CaCO₃ + HCl)',
    svg: `<svg viewBox="0 0 320 220" width="320" height="220" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="200" width="100" height="8" rx="2" fill="#334155"/><rect x="35" y="40" width="6" height="160" fill="#475569"/><rect x="35" y="90" width="35" height="5" fill="#64748b"/><rect x="73" y="62" width="20" height="4" fill="#94a3b8"/><path d="M75 66V150C75 158 79 164 83 164C87 164 91 158 91 150V66" stroke="#475569" stroke-width="2" fill="#f8fafc"/><path d="M76 125V150C76 157 79 163 83 163C87 163 90 157 90 150V125Z" fill="#38bdf8" fill-opacity="0.35"/><path d="M83 68V45C83 40 88 35 95 35H195C202 35 207 40 207 45V165" stroke="#0284c7" stroke-width="3" fill="none"/><path d="M202 124V190C202 194 205 198 209 198H227C231 198 234 194 234 190V124" stroke="#475569" stroke-width="2" fill="#f8fafc"/><text x="218" y="170" text-anchor="middle" fill="#0369a1" font-size="12" font-weight="bold">CO2</text><text x="55" y="190" fill="#475569" font-size="11" font-weight="bold">CaCO3 + dd HCl</text></svg>`,
  },
  {
    id: 'titration',
    label: 'Chuẩn độ Acid – Base (Buret + Bình tam giác)',
    svg: `<svg viewBox="0 0 320 220" width="320" height="220" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="200" width="120" height="8" rx="2" fill="#334155"/><rect x="70" y="20" width="6" height="180" fill="#475569"/><rect x="70" y="60" width="55" height="5" fill="#64748b"/><rect x="124" y="20" width="8" height="130" stroke="#475569" stroke-width="1.5" fill="#f8fafc"/><rect x="124.5" y="50" width="7" height="99" fill="#38bdf8" fill-opacity="0.4"/><path d="M124 148V162L110 200C108 205 112 208 116 208H142C146 208 150 205 148 200L134 162V148" stroke="#475569" stroke-width="2" fill="#f8fafc"/><text x="145" y="80" fill="#0369a1" font-size="11" font-weight="bold">Buret (dd chuan)</text><text x="165" y="180" fill="#be123c" font-size="11" font-weight="bold">Binh tam giac</text></svg>`,
  },
];

export const TeacherQuestionBank: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useChemStore();

  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFormulaEditor, setShowFormulaEditor] = useState<boolean>(false);

  // Create / Edit Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formType, setFormType] = useState<QuestionType>('MCQ');
  const [formGrade, setFormGrade] = useState<10 | 11 | 12>(11);
  const [formChapter, setFormChapter] = useState<string>('Chương 1: Cân bằng hoá học');
  const [formTopic, setFormTopic] = useState<string>('Cân bằng hóa học');
  const [formCompetency, setFormCompetency] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formLevel, setFormLevel] = useState<CognitiveLevel>('THONG_HIEU');
  const [formMaxScore, setFormMaxScore] = useState<number>(0.25);
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formFormula, setFormFormula] = useState<string>('');
  const [formDiagramSvg, setFormDiagramSvg] = useState<string>('');
  const [formTableHtml, setFormTableHtml] = useState<string>('');
  const [formLockGroup, setFormLockGroup] = useState<string>('');
  const [formIsApproved, setFormIsApproved] = useState<boolean>(true);

  // MCQ Options
  const [formOptions, setFormOptions] = useState<QuestionOption[]>([
    { id: 'A', content: '', isCorrect: true },
    { id: 'B', content: '', isCorrect: false },
    { id: 'C', content: '', isCorrect: false },
    { id: 'D', content: '', isCorrect: false },
  ]);

  // True/False 4 statements
  const [formTfStatements, setFormTfStatements] = useState<TrueFalseStatement[]>([
    { id: 'st_1', statement: '', isCorrect: true },
    { id: 'st_2', statement: '', isCorrect: false },
    { id: 'st_3', statement: '', isCorrect: true },
    { id: 'st_4', statement: '', isCorrect: false },
  ]);

  // Short Answer
  const [formCorrectShort, setFormCorrectShort] = useState<string>('');

  // Essay Rubrics
  const [formRubricSteps, setFormRubricSteps] = useState<EssayRubricStep[]>([
    { id: 'step_1', description: 'Viết đúng phương trình hóa học / công thức tính', score: 0.5 },
    { id: 'step_2', description: 'Tính toán chính xác kết quả và kết luận', score: 0.5 },
  ]);
  const [formRubricGuide, setFormRubricGuide] = useState<string>('');

  // Import Word/Excel/PDF modal state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importGrade, setImportGrade] = useState<10 | 11 | 12>(11);
  const [importChapter, setImportChapter] = useState<string>('Chương 1: Nhập từ tài liệu');
  const [importRawText, setImportRawText] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<Partial<Question>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importAmbiguousCount, setImportAmbiguousCount] = useState<number>(0);
  const [scratchEditorHtml, setScratchEditorHtml] = useState<string>('');
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingTfIndex, setEditingTfIndex] = useState<number | null>(null);
  const [editingShortAnswer, setEditingShortAnswer] = useState<boolean>(false);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedGrade !== 0 && q.grade !== selectedGrade) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (selectedLevel !== 'all' && q.cognitiveLevel !== selectedLevel) return false;
      if (approvalFilter === 'approved' && q.isApproved === false) return false;
      if (approvalFilter === 'draft' && q.isApproved !== false) return false;
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const plainContent = richHtmlToPlainText(q.content).toLowerCase();
        return (
          plainContent.includes(s) ||
          q.chapter.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          q.id.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [questions, selectedGrade, selectedType, selectedLevel, approvalFilter, searchQuery]);

  const approvedCount = useMemo(() => questions.filter((q) => q.isApproved !== false).length, [questions]);
  const draftCount = questions.length - approvedCount;

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormType('MCQ');
    setFormGrade(selectedGrade === 0 ? 11 : (selectedGrade as 10 | 11 | 12));
    setFormChapter('Chương 1: Cân bằng hoá học');
    setFormTopic('Cân bằng hóa học');
    setFormCompetency('');
    setFormContent('');
    setFormLevel('NHAN_BIET');
    setFormMaxScore(0.25);
    setFormExplanation('');
    setFormFormula('');
    setFormDiagramSvg('');
    setFormTableHtml('');
    setFormLockGroup('');
    setFormIsApproved(true);
    setFormOptions([
      { id: 'A', content: '', isCorrect: true },
      { id: 'B', content: '', isCorrect: false },
      { id: 'C', content: '', isCorrect: false },
      { id: 'D', content: '', isCorrect: false },
    ]);
    setFormTfStatements([
      { id: `st_${Date.now()}_a`, statement: '', isCorrect: true },
      { id: `st_${Date.now()}_b`, statement: '', isCorrect: false },
      { id: `st_${Date.now()}_c`, statement: '', isCorrect: true },
      { id: `st_${Date.now()}_d`, statement: '', isCorrect: false },
    ]);
    setFormCorrectShort('');
    setFormRubricSteps([
      { id: 'step_1', description: 'Phương trình / Lập luận đúng', score: 0.5 },
      { id: 'step_2', description: 'Tính toán & kết quả chuẩn', score: 0.5 },
    ]);
    setFormRubricGuide('');
    setEditingOptionIndex(null);
    setEditingTfIndex(null);
    setEditingShortAnswer(false);
    setShowModal(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormType(q.type);
    setFormGrade(q.grade);
    setFormChapter(q.chapter);
    setFormTopic(q.topic);
    setFormCompetency(q.requiredCompetency || '');
    setFormContent(q.content);
    setFormLevel(q.cognitiveLevel);
    setFormMaxScore(q.maxScore);
    setFormExplanation(q.explanation);
    setFormFormula(q.chemicalFormula || '');
    setFormDiagramSvg(q.diagramSvg || '');
    setFormTableHtml(q.tableHtml || '');
    setFormLockGroup(q.lockShuffleGroup || '');
    setFormIsApproved(q.isApproved !== false);
    setFormOptions(
      q.options && q.options.length === 4
        ? JSON.parse(JSON.stringify(q.options))
        : [
            { id: 'A', content: '', isCorrect: true },
            { id: 'B', content: '', isCorrect: false },
            { id: 'C', content: '', isCorrect: false },
            { id: 'D', content: '', isCorrect: false },
          ]
    );
    setFormTfStatements(
      q.tfStatements && q.tfStatements.length > 0
        ? JSON.parse(JSON.stringify(q.tfStatements))
        : [
            { id: `st_${Date.now()}_a`, statement: '', isCorrect: true },
            { id: `st_${Date.now()}_b`, statement: '', isCorrect: false },
            { id: `st_${Date.now()}_c`, statement: '', isCorrect: true },
            { id: `st_${Date.now()}_d`, statement: '', isCorrect: false },
          ]
    );
    setFormCorrectShort(q.correctAnswer || '');
    setFormRubricSteps(
      q.rubricSteps && q.rubricSteps.length > 0
        ? JSON.parse(JSON.stringify(q.rubricSteps))
        : [{ id: 'step_1', description: q.rubricGuide || 'Theo hướng dẫn chấm', score: q.maxScore }]
    );
    setFormRubricGuide(q.rubricGuide || '');
    setEditingOptionIndex(null);
    setEditingTfIndex(null);
    setEditingShortAnswer(false);
    setShowModal(true);
  };

  const handleDuplicateQuestion = (q: Question) => {
    addQuestion({
      ...JSON.parse(JSON.stringify(q)),
      topic: `${q.topic} (Bản sao)`,
      isApproved: false,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!richHtmlToPlainText(formContent).trim() && !formContent.includes('<img') && !formContent.includes('data-chem-node')) {
      setImportError('Vui lòng nhập nội dung câu hỏi trước khi lưu.');
      return;
    }
    const compiledRubricText =
      formType === 'ESSAY'
        ? formRubricGuide.trim() ||
          formRubricSteps.map((s, idx) => `${idx + 1}. ${s.description} (${s.score} đ)`).join('\n')
        : undefined;

    const payload: Omit<Question, 'id'> = {
      type: formType,
      grade: formGrade,
      chapter: formChapter,
      topic: formTopic,
      requiredCompetency: formCompetency || undefined,
      content: formContent,
      cognitiveLevel: formLevel,
      maxScore: Number(formMaxScore),
      explanation: formExplanation,
      chemicalFormula: formFormula || undefined,
      diagramSvg: formDiagramSvg || undefined,
      tableHtml: formTableHtml || undefined,
      lockShuffleGroup: formLockGroup.trim() || undefined,
      options: formType === 'MCQ' ? formOptions : undefined,
      tfStatements: formType === 'MULTIPLE_TRUE_FALSE' ? formTfStatements : undefined,
      correctAnswer: formType === 'SHORT_ANSWER' ? formCorrectShort.trim() : undefined,
      rubricGuide: compiledRubricText,
      rubricSteps: formType === 'ESSAY' ? formRubricSteps : undefined,
      isApproved: formIsApproved,
      authorId: 'user_teacher',
      updatedAt: new Date().toISOString(),
    };

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, payload);
    } else {
      addQuestion({
        ...payload,
        createdAt: new Date().toISOString(),
      });
    }
    try {
      const draftKey = `qb_${editingQuestion ? editingQuestion.id : 'new'}`;
      localStorage.removeItem(`smart_chem_draft_v1_${draftKey}_content`);
      localStorage.removeItem(`smart_chem_draft_v1_${draftKey}_explanation`);
      localStorage.removeItem(`smart_chem_draft_v1_${draftKey}_rubric`);
    } catch {}
    setShowModal(false);
    setEditingOptionIndex(null);
    setEditingTfIndex(null);
    setEditingShortAnswer(false);
  };

  const handleUploadImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportAmbiguousCount(0);
    try {
      const { text, ambiguousCount = 0 } = await extractTextFromUploadedFile(file);
      if (!text.trim()) {
        setImportError(
          'Không trích xuất được văn bản từ tệp này (có thể là PDF dạng ảnh scan). Bạn có thể dán trực tiếp văn bản câu hỏi vào ô bên dưới.'
        );
        return;
      }
      setImportAmbiguousCount(ambiguousCount);
      setImportRawText(text);
      const parsed = parseQuestionsFromText(text, importGrade);
      setParsedPreview(parsed);
    } catch {
      setImportError('Không đọc được tệp. Hỗ trợ .docx, .xlsx, .csv, .txt hoặc .pdf có lớp văn bản.');
    }
  };

  const handleAnalyzeRawText = () => {
    setImportError(null);
    const parsed = parseQuestionsFromText(importRawText, importGrade);
    if (parsed.length === 0) {
      setImportError(
        'Chưa tách được câu hỏi nào. Hãy đảm bảo mỗi câu bắt đầu bằng "Câu 1:", "Câu 2:" và có các lựa chọn A. B. C. D. hoặc a) b) c) d).'
      );
      return;
    }
    setParsedPreview(parsed);
  };

  const handleConfirmImportQuestions = (markApproved: boolean) => {
    if (parsedPreview.length === 0) return;
    parsedPreview.forEach((pq) => {
      addQuestion({
        type: pq.type || 'MCQ',
        grade: importGrade,
        chapter: importChapter || pq.chapter || 'Chủ đề nhập từ tài liệu',
        topic: pq.topic || 'Câu hỏi nhập từ tệp',
        content: pq.content || '',
        cognitiveLevel: pq.cognitiveLevel || 'THONG_HIEU',
        options: pq.options,
        tfStatements: pq.tfStatements,
        correctAnswer: pq.correctAnswer,
        maxScore: pq.maxScore || 0.25,
        explanation: pq.explanation || '',
        isApproved: markApproved,
        authorId: 'user_teacher',
        createdAt: new Date().toISOString(),
      });
    });
    setShowImportModal(false);
    setParsedPreview([]);
    setImportRawText('');
    setImportNotice(
      `Đã nhập thành công ${parsedPreview.length} câu hỏi (${markApproved ? 'Đã duyệt' : 'Trạng thái Nháp để kiểm tra lại'})!`
    );
    setTimeout(() => setImportNotice(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-teal-600" />
            <span>Ngân Hàng Câu Hỏi Hóa Học (4 Dạng – 4 Mức Độ)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Tổng số: <strong>{questions.length}</strong> câu · Đã duyệt chính thức:{' '}
            <strong className="text-emerald-700">{approvedCount}</strong> · Bản nháp:{' '}
            <strong className="text-amber-700">{draftCount}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFormulaEditor(!showFormulaEditor)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl border min-h-[44px] transition-all ${
              showFormulaEditor
                ? 'bg-teal-50 text-teal-900 border-teal-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{showFormulaEditor ? 'Đóng Bộ Soạn Công Thức' : 'Soạn Công Thức & Sơ Đồ'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl min-h-[44px]"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Nhập từ Word / PDF / Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm câu hỏi mới</span>
          </button>
        </div>
      </div>

      {importNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-900 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{importNotice}</span>
        </div>
      )}

      {showFormulaEditor && (
        <div className="space-y-2">
          <SmartChemEditor
            value={scratchEditorHtml}
            onChange={setScratchEditorHtml}
            label="Trình Soạn Thảo Hóa Học Thông Minh (Soạn nhanh văn bản, công thức, phương trình & cấu tạo 2D)"
            draftKey="qb_scratchpad"
            minHeight={130}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[0, 10, 11, 12].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedGrade === g
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g === 0 ? 'Tất cả khối' : `Lớp ${g}`}
              </button>
            ))}
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-bold min-h-[40px]"
          >
            <option value="all">Tất cả 4 dạng câu</option>
            <option value="MCQ">Trắc nghiệm ABCD</option>
            <option value="MULTIPLE_TRUE_FALSE">Đúng / Sai nhiều ý</option>
            <option value="SHORT_ANSWER">Trả lời ngắn</option>
            <option value="ESSAY">Tự luận</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-bold min-h-[40px]"
          >
            <option value="all">Tất cả 4 mức độ</option>
            <option value="NHAN_BIET">Nhận biết</option>
            <option value="THONG_HIEU">Thông hiểu</option>
            <option value="VAN_DUNG">Vận dụng</option>
            <option value="VAN_DUNG_CAO">Vận dụng cao</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value as 'all' | 'approved' | 'draft')}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-bold min-h-[40px]"
          >
            <option value="all">Mọi trạng thái duyệt</option>
            <option value="approved">Đã duyệt ({approvedCount})</option>
            <option value="draft">Bản nháp ({draftCount})</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm nội dung, chương, chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3.5">
        {filteredQuestions.map((q, idx) => {
          const approved = q.isApproved !== false;
          return (
            <div
              key={q.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-teal-300 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    #{idx + 1} · {q.id}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                    {QUESTION_TYPE_LABELS[q.type]}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    {COGNITIVE_LEVEL_LABELS[q.cognitiveLevel]}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                      approved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {approved ? '✓ Đã duyệt' : 'Nháp'}
                  </span>
                  {q.lockShuffleGroup && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Nhóm: {q.lockShuffleGroup}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    Khối {q.grade} · {q.chapter}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-teal-800 mr-2">{q.maxScore} điểm</span>
                  <button
                    type="button"
                    onClick={() => updateQuestion(q.id, { isApproved: !approved })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                      approved
                        ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                    }`}
                  >
                    {approved ? 'Chuyển Nháp' : 'Duyệt câu hỏi'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateQuestion(q)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                    title="Nhân bản câu hỏi"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-teal-50"
                    title="Sửa câu hỏi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(q.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Body */}
              <div className="text-sm text-slate-800 font-medium leading-relaxed">
                <ChemFormula formula={q.content} />
              </div>

              {/* Diagram SVG / Image if any */}
              {q.diagramSvg && (
                <div
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-sm"
                  dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                />
              )}
              {q.imageUrl && (
                <img
                  src={q.imageUrl}
                  alt="Hình minh họa câu hỏi"
                  className="max-h-48 rounded-xl border border-slate-200"
                />
              )}

              {/* Preview by Type */}
              {q.type === 'MCQ' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        opt.isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="flex-1">
                        <strong>{opt.id}.</strong> <ChemFormula formula={opt.content} />
                      </span>
                      {opt.isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'MULTIPLE_TRUE_FALSE' && q.tfStatements && (
                <div className="space-y-1.5">
                  {q.tfStatements.map((st, sIdx) => (
                    <div
                      key={st.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span>
                        <strong>{['a)', 'b)', 'c)', 'd)'][sIdx]}</strong>{' '}
                        <ChemFormula formula={st.statement} />
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[11px] ${
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
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs flex items-center gap-2">
                  <span className="font-bold text-sky-900">Đáp án ngắn chuẩn:</span>
                  <span className="font-mono font-black text-sky-950 bg-white px-2.5 py-0.5 rounded border border-sky-200">
                    <ChemFormula formula={q.correctAnswer || ''} />
                  </span>
                </div>
              )}

              {q.type === 'ESSAY' && (q.rubricSteps?.length || q.rubricGuide) && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <strong className="text-amber-900 block">Hướng dẫn chấm thành phần:</strong>
                  {q.rubricSteps && q.rubricSteps.length > 0 && (
                    <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                      {q.rubricSteps.map((s) => (
                        <li key={s.id}>
                          <ChemFormula formula={s.description} /> — <strong>{s.score} đ</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.rubricGuide && (
                    <div className="text-slate-700 pt-1">
                      <ChemFormula formula={q.rubricGuide} isBlock />
                    </div>
                  )}
                </div>
              )}

              {q.explanation && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <strong>Lời giải chi tiết:</strong> <ChemFormula formula={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =================================================================
          MODAL: FULL CREATE / EDIT QUESTION (ALL 4 TYPES + DIAGRAM)
          ================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-800 text-base">
                {editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới (Chuẩn GDPT 2018)'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value) as 10 | 11 | 12)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dạng câu hỏi:</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const nextT = e.target.value as QuestionType;
                      setFormType(nextT);
                      if (nextT === 'MCQ') setFormMaxScore(0.25);
                      else if (nextT === 'MULTIPLE_TRUE_FALSE') setFormMaxScore(1.0);
                      else if (nextT === 'SHORT_ANSWER') setFormMaxScore(0.5);
                      else setFormMaxScore(1.5);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="MCQ">Trắc nghiệm 4 lựa chọn</option>
                    <option value="MULTIPLE_TRUE_FALSE">Đúng / Sai nhiều ý</option>
                    <option value="SHORT_ANSWER">Trả lời ngắn</option>
                    <option value="ESSAY">Tự luận</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức độ nhận thức:</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as CognitiveLevel)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="NHAN_BIET">Nhận biết</option>
                    <option value="THONG_HIEU">Thông hiểu</option>
                    <option value="VAN_DUNG">Vận dụng</option>
                    <option value="VAN_DUNG_CAO">Vận dụng cao</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm tối đa:</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chương / Chủ đề:</label>
                  <input
                    type="text"
                    required
                    value={formChapter}
                    onChange={(e) => setFormChapter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bài học / Chuyên đề:</label>
                  <input
                    type="text"
                    required
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <SmartChemEditor
                  label="Nội dung câu hỏi (Chèn công thức Hóa, PT phản ứng, Ion, Ký hiệu, Bảng biểu & Cấu tạo 2D)"
                  value={formContent}
                  onChange={setFormContent}
                  draftKey={`qb_${editingQuestion ? editingQuestion.id : 'new'}_content`}
                  minHeight={135}
                />
              </div>

              {/* Type-specific answers editor */}
              {formType === 'MCQ' && (
                <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2.5">
                  <span className="font-black text-teal-900 block">
                    4 Phương án lựa chọn (Chọn nút tròn đánh dấu Đáp án đúng · bấm &quot;CT&quot; để soạn công thức trực quan):
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {formOptions.map((opt, oIdx) => (
                      <div key={opt.id} className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="mcqCorrect"
                            checked={Boolean(opt.isCorrect)}
                            onChange={() =>
                              setFormOptions(
                                formOptions.map((o, i) => ({ ...o, isCorrect: i === oIdx }))
                              )
                            }
                            className="w-4 h-4 text-teal-600"
                          />
                          <span className="font-black text-teal-800">{opt.id}.</span>
                          <div className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 min-h-[34px] flex items-center">
                            {opt.content ? (
                              <ChemFormula formula={opt.content} />
                            ) : (
                              <span className="text-slate-400">Chưa nhập phương án {opt.id}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingOptionIndex(editingOptionIndex === oIdx ? null : oIdx)
                            }
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                              editingOptionIndex === oIdx
                                ? 'bg-teal-700 text-white border-teal-800'
                                : 'bg-slate-100 text-teal-800 border-slate-300'
                            }`}
                          >
                            {editingOptionIndex === oIdx ? 'Xong' : 'Soạn CT'}
                          </button>
                        </div>
                        {editingOptionIndex === oIdx && (
                          <SmartChemEditor
                            compact
                            minHeight={85}
                            value={opt.content}
                            onChange={(val) =>
                              setFormOptions(
                                formOptions.map((o, i) =>
                                  i === oIdx ? { ...o, content: val } : o
                                )
                              )
                            }
                            placeholder={`Nhập phương án ${opt.id}...`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formType === 'MULTIPLE_TRUE_FALSE' && (
                <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl space-y-2.5">
                  <span className="font-black text-sky-900 block">
                    4 Ý phát biểu Đúng / Sai (a, b, c, d):
                  </span>
                  <div className="space-y-2">
                    {formTfStatements.map((st, sIdx) => (
                      <div
                        key={st.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sky-800 w-6">
                            {['a)', 'b)', 'c)', 'd)'][sIdx]}
                          </span>
                          <div className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 min-h-[34px] flex items-center">
                            {st.statement ? (
                              <ChemFormula formula={st.statement} />
                            ) : (
                              <span className="text-slate-400">
                                Chưa nhập mệnh đề {['a', 'b', 'c', 'd'][sIdx]}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTfIndex(editingTfIndex === sIdx ? null : sIdx)
                            }
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-slate-100 text-teal-800 border-slate-300"
                          >
                            {editingTfIndex === sIdx ? 'Xong' : 'Soạn CT'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormTfStatements(
                                formTfStatements.map((item, i) =>
                                  i === sIdx ? { ...item, isCorrect: !item.isCorrect } : item
                                )
                              )
                            }
                            className={`px-3 py-1 rounded-lg font-black text-xs min-w-[70px] ${
                              st.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                          </button>
                        </div>
                        {editingTfIndex === sIdx && (
                          <SmartChemEditor
                            compact
                            minHeight={85}
                            value={st.statement}
                            onChange={(val) =>
                              setFormTfStatements(
                                formTfStatements.map((item, i) =>
                                  i === sIdx ? { ...item, statement: val } : item
                                )
                              )
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formType === 'SHORT_ANSWER' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-black text-amber-950">
                      Đáp án số / Giá trị chuẩn:
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingShortAnswer(!editingShortAnswer)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                        editingShortAnswer
                          ? 'bg-teal-700 text-white border-teal-800'
                          : 'bg-white text-teal-800 border-slate-300'
                      }`}
                    >
                      {editingShortAnswer ? 'Đóng trình soạn CT' : 'Soạn công thức / đơn vị'}
                    </button>
                  </div>
                  {!editingShortAnswer ? (
                    <input
                      type="text"
                      required
                      value={formCorrectShort}
                      onChange={(e) => setFormCorrectShort(e.target.value)}
                      placeholder="Ví dụ: 12,5 hoặc 240..."
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold"
                    />
                  ) : (
                    <SmartChemEditor
                      compact
                      minHeight={75}
                      value={formCorrectShort}
                      onChange={setFormCorrectShort}
                      placeholder="Nhập đáp án ngắn hoặc giá trị kèm công thức / đơn vị..."
                    />
                  )}
                  {formCorrectShort && (
                    <div className="text-[11px] text-amber-900 flex items-center gap-1.5">
                      <span>Hiển thị:</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-amber-200 font-bold">
                        <ChemFormula formula={formCorrectShort} />
                      </span>
                    </div>
                  )}
                </div>
              )}

              {formType === 'ESSAY' && (
                <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-purple-900">
                      Thang điểm thành phần & Hướng dẫn chấm Tự luận (Rubric):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormRubricSteps([
                          ...formRubricSteps,
                          { id: `step_${Date.now()}`, description: '', score: 0.25 },
                        ])
                      }
                      className="px-2.5 py-1 bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm bước chấm
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formRubricSteps.map((step, sIdx) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Bước ${sIdx + 1}: Viết PTHH / Tính mol...`}
                          value={step.description}
                          onChange={(e) =>
                            setFormRubricSteps(
                              formRubricSteps.map((s, i) =>
                                i === sIdx ? { ...s, description: e.target.value } : s
                              )
                            )
                          }
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={step.score}
                          onChange={(e) =>
                            setFormRubricSteps(
                              formRubricSteps.map((s, i) =>
                                i === sIdx ? { ...s, score: Number(e.target.value) } : s
                              )
                            )
                          }
                          className="w-20 px-2 py-1.5 text-center font-bold bg-white border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormRubricSteps(formRubricSteps.filter((_, i) => i !== sIdx))
                          }
                          className="p-1 text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <SmartChemEditor
                    compact
                    minHeight={100}
                    label="Ghi chú đáp án & Phương trình hướng dẫn chấm chi tiết"
                    value={formRubricGuide}
                    onChange={setFormRubricGuide}
                    draftKey={`qb_${editingQuestion ? editingQuestion.id : 'new'}_rubric`}
                  />
                </div>
              )}

              {/* Experiment Diagram & Group Lock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> Sơ đồ thí nghiệm chuẩn SGK (SVG):
                  </label>
                  <select
                    value={PRESET_EXPERIMENT_SVGS.find((p) => p.svg === formDiagramSvg)?.id || 'custom'}
                    onChange={(e) => {
                      const found = PRESET_EXPERIMENT_SVGS.find((p) => p.id === e.target.value);
                      if (found) setFormDiagramSvg(found.svg);
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    {PRESET_EXPERIMENT_SVGS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" /> Nhóm câu không tách rời khi trộn (tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={formLockGroup}
                    onChange={(e) => setFormLockGroup(e.target.value)}
                    placeholder="Ví dụ: nhom_thi_nghiem_1"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <SmartChemEditor
                  compact
                  minHeight={105}
                  label="Lời giải chi tiết & Đáp án hướng dẫn"
                  value={formExplanation}
                  onChange={setFormExplanation}
                  draftKey={`qb_${editingQuestion ? editingQuestion.id : 'new'}_explanation`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsApproved}
                    onChange={(e) => setFormIsApproved(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Duyệt sẵn sàng dùng cho đề chính thức (Bỏ tick để lưu Nháp)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs"
                  >
                    Lưu câu hỏi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================
          MODAL: IMPORT QUESTIONS FROM WORD / EXCEL / PDF WITH REVIEW
          ================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  Nhập Câu Hỏi Từ Word (.docx) / Excel (.xlsx) / PDF / Văn bản
                </h3>
                <p className="text-xs text-slate-500">
                  Bước 1: Tải tệp hoặc dán văn bản → Bước 2: Kiểm tra & sửa lỗi nhận dạng công thức/đáp án → Bước 3: Lưu vào Ngân hàng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
              <div>
                <label className="block mb-1 text-slate-600">Khối lớp mặc định:</label>
                <select
                  value={importGrade}
                  onChange={(e) => setImportGrade(Number(e.target.value) as 10 | 11 | 12)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value={10}>Hóa học 10</option>
                  <option value={11}>Hóa học 11</option>
                  <option value={12}>Hóa học 12</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block mb-1 text-slate-600">Gán Chương / Chủ đề:</label>
                <input
                  type="text"
                  value={importChapter}
                  onChange={(e) => setImportChapter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-teal-300 bg-teal-50/30 rounded-xl text-center relative cursor-pointer">
              <input
                type="file"
                accept=".docx,.doc,.xlsx,.xls,.csv,.pdf,.txt"
                onChange={handleUploadImportFile}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-7 h-7 text-teal-700 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-700 block">
                Bấm để chọn tệp Word (.docx), Excel (.xlsx), PDF hoặc dán nội dung bên dưới
              </span>
            </div>

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            {importAmbiguousCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-xs font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Phát hiện {importAmbiguousCount} công thức phức tạp/dạng ảnh được gắn cờ{' '}
                  <code className="bg-white px-1 rounded border border-amber-300">[CẦN KIỂM TRA CÔNG THỨC]</code>.
                  Vui lòng kiểm tra và chỉnh sửa trước khi lưu vào ngân hàng!
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Văn bản nguồn (Có thể sửa trực tiếp lỗi nhận dạng trước khi tách câu):
                </span>
                <button
                  type="button"
                  onClick={handleAnalyzeRawText}
                  className="px-3 py-1.5 text-xs font-bold bg-teal-700 text-white rounded-lg hover:bg-teal-800"
                >
                  Phân tích & Tách câu hỏi
                </button>
              </div>
              <textarea
                rows={5}
                value={importRawText}
                onChange={(e) => setImportRawText(e.target.value)}
                placeholder={`Ví dụ:\nCâu 1: Cho phản ứng N2 + 3H2 <=> 2NH3. Khi tăng áp suất cân bằng chuyển dịch theo chiều nào?\nA. Chiều thuận  B. Chiều nghịch  C. Không chuyển dịch  D. Dừng lại\nĐáp án: A`}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            {/* Editable Parsed Preview Table */}
            {parsedPreview.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-black text-emerald-800 uppercase block">
                  Xem trước & Sửa lỗi nhận dạng ({parsedPreview.length} câu đã tách):
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {parsedPreview.map((pq, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-teal-800">Câu {pIdx + 1}</strong>
                        <div className="flex items-center gap-2">
                          <select
                            value={pq.type || 'MCQ'}
                            onChange={(e) =>
                              setParsedPreview(
                                parsedPreview.map((item, i) =>
                                  i === pIdx ? { ...item, type: e.target.value as QuestionType } : item
                                )
                              )
                            }
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold"
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="MULTIPLE_TRUE_FALSE">Đúng/Sai</option>
                            <option value="SHORT_ANSWER">Trả lời ngắn</option>
                            <option value="ESSAY">Tự luận</option>
                          </select>
                          <select
                            value={pq.cognitiveLevel || 'THONG_HIEU'}
                            onChange={(e) =>
                              setParsedPreview(
                                parsedPreview.map((item, i) =>
                                  i === pIdx
                                    ? { ...item, cognitiveLevel: e.target.value as CognitiveLevel }
                                    : item
                                )
                              )
                            }
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold"
                          >
                            <option value="NHAN_BIET">Nhận biết</option>
                            <option value="THONG_HIEU">Thông hiểu</option>
                            <option value="VAN_DUNG">Vận dụng</option>
                            <option value="VAN_DUNG_CAO">Vận dụng cao</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setParsedPreview(parsedPreview.filter((_, i) => i !== pIdx))
                            }
                            className="text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={pq.content || ''}
                        onChange={(e) =>
                          setParsedPreview(
                            parsedPreview.map((item, i) =>
                              i === pIdx ? { ...item, content: e.target.value } : item
                            )
                          )
                        }
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-medium"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleConfirmImportQuestions(false)}
                    className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                  >
                    Nhập vào Kho dạng NHÁP (kiểm duyệt sau)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmImportQuestions(true)}
                    className="px-4 py-2 text-xs font-black bg-teal-700 hover:bg-teal-800 text-white rounded-xl flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Nhập & Duyệt ngay ({parsedPreview.length} câu)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
