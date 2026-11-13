import React, { useEffect, useState } from 'react';
import { useChemStore } from '../../services/store';
import { LessonMaterial } from '../../types/chem';
import { ChemFormula } from '../common/ChemFormula';
import { SmartChemEditor } from '../common/SmartChemEditor';
import { exportRichDocToDocx } from '../../utils/docxExportUtils';
import {
  BookOpen,
  ClipboardList,
  Download,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

export const TeacherLessons: React.FC = () => {
  const { lessons, addLesson, updateLesson } = useChemStore();
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(11);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || '');

  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filteredLessons = lessons.filter((l) => l.grade === selectedGrade);
  const activeLesson =
    lessons.find((l) => l.id === selectedLessonId) || filteredLessons[0] || lessons[0];

  const [draft, setDraft] = useState<{
    grade: 10 | 11 | 12;
    semester: 1 | 2;
    chapter: string;
    unit: string;
    title: string;
    theorySummary: string;
    equations: string[];
    keyFormulas: string[];
    applications: string;
    experimentGuide: string;
    worksheetTitle: string;
    worksheetHtml: string;
  }>({
    grade: 11,
    semester: 1,
    chapter: '',
    unit: '',
    title: '',
    theorySummary: '',
    equations: [],
    keyFormulas: [],
    applications: '',
    experimentGuide: '',
    worksheetTitle: '',
    worksheetHtml: '',
  });

  const [newEqInput, setNewEqInput] = useState('');
  const [newFormulaInput, setNewFormulaInput] = useState('');

  useEffect(() => {
    if (activeLesson && !isEditing) {
      setDraft({
        grade: activeLesson.grade,
        semester: activeLesson.semester,
        chapter: activeLesson.chapter,
        unit: activeLesson.unit,
        title: activeLesson.title,
        theorySummary: activeLesson.theorySummary || '',
        equations: [...(activeLesson.equations || [])],
        keyFormulas: [...(activeLesson.keyFormulas || [])],
        applications: activeLesson.applications || '',
        experimentGuide: activeLesson.experimentGuide || '',
        worksheetTitle: activeLesson.worksheetTitle || `Phiếu học tập – ${activeLesson.title}`,
        worksheetHtml: activeLesson.worksheetHtml || '',
      });
    }
  }, [activeLesson, isEditing]);

  const handleOpenEdit = () => {
    if (!activeLesson) return;
    setIsCreatingNew(false);
    setDraft({
      grade: activeLesson.grade,
      semester: activeLesson.semester,
      chapter: activeLesson.chapter,
      unit: activeLesson.unit,
      title: activeLesson.title,
      theorySummary: activeLesson.theorySummary || '',
      equations: [...(activeLesson.equations || [])],
      keyFormulas: [...(activeLesson.keyFormulas || [])],
      applications: activeLesson.applications || '',
      experimentGuide: activeLesson.experimentGuide || '',
      worksheetTitle: activeLesson.worksheetTitle || `Phiếu học tập – ${activeLesson.title}`,
      worksheetHtml: activeLesson.worksheetHtml || '',
    });
    setIsEditing(true);
    setSaveMsg(null);
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setDraft({
      grade: selectedGrade,
      semester: 1,
      chapter: `Chương mới – Hóa học ${selectedGrade}`,
      unit: `Bài mới`,
      title: '',
      theorySummary: '<p>Nhập tóm tắt lý thuyết trọng tâm...</p>',
      equations: [],
      keyFormulas: [],
      applications: '',
      experimentGuide: '',
      worksheetTitle: 'Phiếu học tập số 1',
      worksheetHtml: '',
    });
    setIsEditing(true);
    setSaveMsg(null);
  };

  const handleSaveLesson = () => {
    if (!draft.title.trim()) {
      setSaveMsg('Vui lòng nhập tên bài học trước khi lưu.');
      return;
    }

    if (isCreatingNew) {
      const created = addLesson({
        grade: draft.grade,
        semester: draft.semester,
        chapter: draft.chapter.trim() || `Chương Hóa học ${draft.grade}`,
        unit: draft.unit.trim() || 'Bài bổ sung',
        title: draft.title.trim(),
        theorySummary: draft.theorySummary,
        equations: draft.equations,
        keyFormulas: draft.keyFormulas,
        applications: draft.applications,
        experimentGuide: draft.experimentGuide,
        worksheetTitle: draft.worksheetTitle.trim(),
        worksheetHtml: draft.worksheetHtml,
      });
      setSelectedGrade(created.grade);
      setSelectedLessonId(created.id);
      setIsEditing(false);
      setIsCreatingNew(false);
      setSaveMsg('Đã tạo bài học và phiếu học tập mới thành công!');
    } else if (activeLesson) {
      updateLesson(activeLesson.id, {
        grade: draft.grade,
        semester: draft.semester,
        chapter: draft.chapter.trim() || activeLesson.chapter,
        unit: draft.unit.trim() || activeLesson.unit,
        title: draft.title.trim(),
        theorySummary: draft.theorySummary,
        equations: draft.equations,
        keyFormulas: draft.keyFormulas,
        applications: draft.applications,
        experimentGuide: draft.experimentGuide,
        worksheetTitle: draft.worksheetTitle.trim(),
        worksheetHtml: draft.worksheetHtml,
      });
      setIsEditing(false);
      setSaveMsg('Đã lưu cập nhật nội dung bài học và phiếu học tập!');
    }
  };

  const handleExportLessonDocx = async (lesson: LessonMaterial) => {
    setIsExporting(true);
    try {
      const eqHtml =
        lesson.equations.length > 0
          ? `<ul>${lesson.equations.map((eq) => `<li>${eq}</li>`).join('')}</ul>`
          : '';
      const kfHtml =
        lesson.keyFormulas.length > 0
          ? `<ul>${lesson.keyFormulas.map((kf) => `<li>${kf}</li>`).join('')}</ul>`
          : '';
      await exportRichDocToDocx({
        title: `${lesson.unit}: ${lesson.title}`,
        subtitle: `Hóa học lớp ${lesson.grade} – ${lesson.chapter} (Bộ sách Kết nối tri thức với cuộc sống)`,
        sections: [
          { heading: '1. Tóm tắt lý thuyết trọng tâm', html: lesson.theorySummary || '' },
          ...(eqHtml ? [{ heading: '2. Phương trình phản ứng minh họa', html: eqHtml }] : []),
          ...(kfHtml ? [{ heading: '3. Công thức vận dụng', html: kfHtml }] : []),
          ...(lesson.applications
            ? [{ heading: '4. Kết nối tri thức với thực tiễn cuộc sống', html: lesson.applications }]
            : []),
          ...(lesson.experimentGuide
            ? [{ heading: '5. Hướng dẫn thí nghiệm / Thực hành', html: lesson.experimentGuide }]
            : []),
          ...(lesson.worksheetHtml
            ? [
                {
                  heading: lesson.worksheetTitle || '6. Phiếu học tập',
                  html: lesson.worksheetHtml,
                },
              ]
            : []),
        ],
        fileName: `Bai_Hoc_Hoa_${lesson.grade}_${lesson.id}.docx`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWorksheetOnly = async (lesson: LessonMaterial) => {
    if (!lesson.worksheetHtml) return;
    setIsExporting(true);
    try {
      await exportRichDocToDocx({
        title: lesson.worksheetTitle || `PHIẾU HỌC TẬP – ${lesson.title}`,
        subtitle: `Hóa học lớp ${lesson.grade} · ${lesson.chapter} · ${lesson.unit}`,
        sections: [{ heading: 'Nội dung phiếu học tập', html: lesson.worksheetHtml }],
        fileName: `Phieu_Hoc_Tap_Hoa_${lesson.grade}_${lesson.id}.docx`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Học Liệu Hóa Học &amp; Phiếu Học Tập Chuẩn SGK Kết Nối Tri Thức
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp lý thuyết, phản ứng đã kiểm chứng khoa học, soạn bài học và phiếu học tập với Trình soạn thảo Hóa học thông minh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {([10, 11, 12] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setSelectedGrade(g);
                  setIsEditing(false);
                  const first = lessons.find((l) => l.grade === g);
                  if (first) setSelectedLessonId(first.id);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all min-h-[38px] ${
                  selectedGrade === g
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Soạn bài học mới</span>
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-900 flex items-center justify-between">
          <span>{saveMsg}</span>
          <button
            type="button"
            onClick={() => setSaveMsg(null)}
            className="text-teal-700 hover:text-teal-900 font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lessons Table of Contents */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[720px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mục lục bài học (Khối {selectedGrade})
            </span>
            <span className="text-[11px] font-bold text-teal-700">{filteredLessons.length} bài</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredLessons.map((les) => {
              const isSelected = activeLesson?.id === les.id && !isCreatingNew;
              return (
                <div
                  key={les.id}
                  onClick={() => {
                    setSelectedLessonId(les.id);
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50 border-l-4 border-l-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-teal-700 block uppercase">
                      {les.chapter}
                    </span>
                    {les.worksheetHtml && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                        Có phiếu HT
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{les.unit}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{les.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Full Lesson Reader OR SmartChemEditor Authoring */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 max-h-[720px] overflow-y-auto">
          {isEditing ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  {isCreatingNew ? 'Soạn bài học & Phiếu học tập mới' : 'Chỉnh sửa nội dung bài học & Phiếu học tập'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreatingNew(false);
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[40px]"
                  >
                    <X className="w-4 h-4" /> Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLesson}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg min-h-[40px]"
                  >
                    <Save className="w-4 h-4" /> Lưu bài học
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={draft.grade}
                    onChange={(e) => setDraft((p) => ({ ...p, grade: Number(e.target.value) as 10 | 11 | 12 }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Học kỳ</label>
                  <select
                    value={draft.semester}
                    onChange={(e) => setDraft((p) => ({ ...p, semester: Number(e.target.value) as 1 | 2 }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value={1}>Học kỳ I</option>
                    <option value={2}>Học kỳ II</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chương</label>
                  <input
                    type="text"
                    value={draft.chapter}
                    onChange={(e) => setDraft((p) => ({ ...p, chapter: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    placeholder="VD: Chương 2: Nitrogen – Sulfur"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bài số / Unit</label>
                  <input
                    type="text"
                    value={draft.unit}
                    onChange={(e) => setDraft((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    placeholder="VD: Bài 7"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Tên bài học *</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  placeholder="Nhập tiêu đề bài học chuẩn SGK..."
                />
              </div>

              <SmartChemEditor
                label="1. Tóm tắt lý thuyết trọng tâm (hỗ trợ công thức, phương trình, bảng biểu, cấu tạo 2D)"
                draftKey={`lesson_theory_${isCreatingNew ? 'new' : activeLesson?.id || 'edit'}`}
                value={draft.theorySummary}
                onChange={(val) => setDraft((p) => ({ ...p, theorySummary: val }))}
                minHeight={160}
                placeholder="Soạn lý thuyết trọng tâm, chèn công thức hóa học, bảng tổng hợp hoặc cấu tạo hữu cơ 2D..."
              />

              {/* Equations quick list */}
              <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  2. Phương trình phản ứng minh họa
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEqInput}
                    onChange={(e) => setNewEqInput(e.target.value)}
                    placeholder="VD: Cu + 2H2SO4 -> CuSO4 + SO2 + 2H2O"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newEqInput.trim()) return;
                      setDraft((p) => ({ ...p, equations: [...p.equations, newEqInput.trim()] }));
                      setNewEqInput('');
                    }}
                    className="px-3 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                  >
                    + Thêm PT
                  </button>
                </div>
                {draft.equations.length > 0 && (
                  <div className="space-y-1.5">
                    {draft.equations.map((eq, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-white border border-teal-100 rounded-lg text-xs"
                      >
                        <ChemFormula formula={eq} />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((p) => ({
                              ...p,
                              equations: p.equations.filter((_, i) => i !== idx),
                            }))
                          }
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Xóa phương trình"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Formulas quick list */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  3. Công thức toán học &amp; hóa học vận dụng
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFormulaInput}
                    onChange={(e) => setNewFormulaInput(e.target.value)}
                    placeholder="VD: C_M = n / V hoặc pH = -lg[H+]"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFormulaInput.trim()) return;
                      setDraft((p) => ({
                        ...p,
                        keyFormulas: [...p.keyFormulas, newFormulaInput.trim()],
                      }));
                      setNewFormulaInput('');
                    }}
                    className="px-3 py-2 text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 rounded-lg"
                  >
                    + Thêm CT
                  </button>
                </div>
                {draft.keyFormulas.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {draft.keyFormulas.map((kf, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <ChemFormula formula={kf} />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((p) => ({
                              ...p,
                              keyFormulas: p.keyFormulas.filter((_, i) => i !== idx),
                            }))
                          }
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Xóa công thức"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SmartChemEditor
                label="4. Kết nối tri thức với thực tiễn cuộc sống"
                draftKey={`lesson_app_${isCreatingNew ? 'new' : activeLesson?.id || 'edit'}`}
                value={draft.applications}
                onChange={(val) => setDraft((p) => ({ ...p, applications: val }))}
                compact
                minHeight={100}
                placeholder="Nhập ứng dụng thực tiễn, câu chuyện hóa học..."
              />

              <SmartChemEditor
                label="5. Hướng dẫn thí nghiệm / Thực hành (nếu có)"
                draftKey={`lesson_exp_${isCreatingNew ? 'new' : activeLesson?.id || 'edit'}`}
                value={draft.experimentGuide}
                onChange={(val) => setDraft((p) => ({ ...p, experimentGuide: val }))}
                compact
                minHeight={95}
                placeholder="Các bước tiến hành thí nghiệm, hiện tượng, giải thích..."
              />

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-amber-700" />
                    6. Soạn Phiếu Học Tập (Học sinh thực hành trên lớp / về nhà)
                  </span>
                </div>
                <input
                  type="text"
                  value={draft.worksheetTitle}
                  onChange={(e) => setDraft((p) => ({ ...p, worksheetTitle: e.target.value }))}
                  placeholder="Tiêu đề Phiếu học tập (VD: Phiếu học tập số 1 – Luyện tập Sulfuric acid)"
                  className="w-full p-2.5 text-xs bg-white border border-amber-300 rounded-lg font-bold"
                />
                <SmartChemEditor
                  draftKey={`lesson_worksheet_${isCreatingNew ? 'new' : activeLesson?.id || 'edit'}`}
                  value={draft.worksheetHtml}
                  onChange={(val) => setDraft((p) => ({ ...p, worksheetHtml: val }))}
                  minHeight={170}
                  placeholder="Soạn nhiệm vụ học tập, bảng điền khuyết, bài tập có công thức hóa học, phản ứng và công thức cấu tạo 2D..."
                />
              </div>
            </div>
          ) : (
            activeLesson && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                      {activeLesson.chapter} · {activeLesson.unit}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{activeLesson.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg min-h-[40px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa bài học &amp; Phiếu HT</span>
                    </button>
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleExportLessonDocx(activeLesson)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg min-h-[40px]"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isExporting ? 'Đang xuất...' : 'Xuất Word (.docx)'}</span>
                    </button>
                  </div>
                </div>

                {/* Theory Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                    1. Tóm tắt lý thuyết trọng tâm
                  </h4>
                  <div className="text-sm text-slate-700 leading-relaxed">
                    <ChemFormula formula={activeLesson.theorySummary} isBlock />
                  </div>
                </div>

                {/* Standard Equations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                    2. Phương trình phản ứng minh họa
                  </h4>
                  <div className="space-y-2">
                    {activeLesson.equations.map((eq, i) => (
                      <div key={i} className="p-3 bg-teal-50/50 border border-teal-100 rounded-lg">
                        <ChemFormula formula={eq} isBlock />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Formulas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                    3. Công thức toán học &amp; hóa học vận dụng
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeLesson.keyFormulas.map((kf, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <ChemFormula formula={kf} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Applications */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                    4. Kết nối tri thức với thực tiễn cuộc sống
                  </h4>
                  <div className="text-sm text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                    <ChemFormula formula={activeLesson.applications} isBlock />
                  </div>
                </div>

                {/* Experiment Guide if present */}
                {activeLesson.experimentGuide && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                      5. Hướng dẫn thí nghiệm / Thực hành
                    </h4>
                    <div className="text-sm text-slate-700 leading-relaxed bg-blue-50/40 p-3 rounded-lg border border-blue-200">
                      <ChemFormula formula={activeLesson.experimentGuide} isBlock />
                    </div>
                  </div>
                )}

                {/* Worksheet / Phiếu học tập */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-amber-700" />
                      {activeLesson.worksheetTitle || 'Phiếu học tập theo bài'}
                    </h4>
                    <div className="flex items-center gap-2">
                      {activeLesson.worksheetHtml && (
                        <button
                          type="button"
                          disabled={isExporting}
                          onClick={() => handleExportWorksheetOnly(activeLesson)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" /> Xuất Phiếu (.docx)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleOpenEdit}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />{' '}
                        {activeLesson.worksheetHtml ? 'Sửa phiếu học tập' : 'Soạn phiếu học tập'}
                      </button>
                    </div>
                  </div>

                  {activeLesson.worksheetHtml ? (
                    <div className="p-4 bg-white border-2 border-amber-200 rounded-xl text-sm text-slate-800">
                      <ChemFormula formula={activeLesson.worksheetHtml} isBlock />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                      Chưa có phiếu học tập riêng cho bài này. Nhấn &ldquo;Soạn phiếu học tập&rdquo; để tạo phiếu nhiệm vụ có công thức hóa học, bảng biểu và hình 2D.
                    </p>
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};
