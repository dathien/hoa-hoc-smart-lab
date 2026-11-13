import React, { useState } from 'react';
import { useChemStore } from '../../services/store';
import { TeachingPlan } from '../../types/chem';
import { ChemFormula } from '../common/ChemFormula';
import { SmartChemEditor } from '../common/SmartChemEditor';
import { exportRichDocToDocx } from '../../utils/docxExportUtils';
import {
  Calendar,
  ClipboardList,
  Download,
  Edit3,
  Plus,
  Save,
  X,
} from 'lucide-react';

export const TeacherTeachingPlan: React.FC = () => {
  const { teachingPlans, addTeachingPlan, updateTeachingPlan } = useChemStore();
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(11);

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isExportingId, setIsExportingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [planDraft, setPlanDraft] = useState<{
    grade: 10 | 11 | 12;
    semester: 1 | 2;
    chapter: string;
    lessonTitle: string;
    week: number;
    period: number;
    objectives: string;
    equipment: string;
    worksheetTitle: string;
    worksheetHtml: string;
  }>({
    grade: 11,
    semester: 1,
    chapter: '',
    lessonTitle: '',
    week: 1,
    period: 1,
    objectives: '',
    equipment: '',
    worksheetTitle: '',
    worksheetHtml: '',
  });

  const filteredPlans = teachingPlans.filter((p) => p.grade === selectedGrade);

  const startEditPlan = (plan: TeachingPlan) => {
    setShowNewForm(false);
    setEditingPlanId(plan.id);
    setPlanDraft({
      grade: plan.grade,
      semester: plan.semester,
      chapter: plan.chapter,
      lessonTitle: plan.lessonTitle,
      week: plan.week,
      period: plan.period,
      objectives: plan.objectives || '',
      equipment: plan.equipment || '',
      worksheetTitle: plan.worksheetTitle || `Phiếu học tập – ${plan.lessonTitle}`,
      worksheetHtml: plan.worksheetHtml || '',
    });
    setNotice(null);
  };

  const startNewPlan = () => {
    setEditingPlanId(null);
    setShowNewForm(true);
    setPlanDraft({
      grade: selectedGrade,
      semester: 1,
      chapter: `Chương Hóa học ${selectedGrade}`,
      lessonTitle: '',
      week: filteredPlans.length + 1,
      period: filteredPlans.length * 2 + 1,
      objectives: '<p>Nêu được kiến thức trọng tâm và viết được phương trình phản ứng minh họa.</p>',
      equipment: '<p>Dụng cụ thí nghiệm, phiếu học tập, mô hình 2D/3D.</p>',
      worksheetTitle: 'Phiếu học tập số 1',
      worksheetHtml: '',
    });
    setNotice(null);
  };

  const handleSavePlan = () => {
    if (!planDraft.lessonTitle.trim()) {
      setNotice('Vui lòng nhập tên bài dạy trước khi lưu.');
      return;
    }

    if (showNewForm) {
      addTeachingPlan({
        grade: planDraft.grade,
        semester: planDraft.semester,
        chapter: planDraft.chapter.trim() || `Chương Hóa học ${planDraft.grade}`,
        lessonTitle: planDraft.lessonTitle.trim(),
        week: Number(planDraft.week) || 1,
        period: Number(planDraft.period) || 1,
        objectives: planDraft.objectives,
        equipment: planDraft.equipment,
        worksheetTitle: planDraft.worksheetTitle.trim(),
        worksheetHtml: planDraft.worksheetHtml,
        status: 'APPROVED',
      });
      setSelectedGrade(planDraft.grade);
      setShowNewForm(false);
      setNotice('Đã thêm kế hoạch dạy học và phiếu học tập mới!');
    } else if (editingPlanId) {
      updateTeachingPlan(editingPlanId, {
        chapter: planDraft.chapter.trim(),
        lessonTitle: planDraft.lessonTitle.trim(),
        week: Number(planDraft.week) || 1,
        period: Number(planDraft.period) || 1,
        objectives: planDraft.objectives,
        equipment: planDraft.equipment,
        worksheetTitle: planDraft.worksheetTitle.trim(),
        worksheetHtml: planDraft.worksheetHtml,
      });
      setEditingPlanId(null);
      setNotice('Đã lưu cập nhật kế hoạch dạy học & phiếu học tập!');
    }
  };

  const handleExportPlanWorksheetDocx = async (plan: TeachingPlan) => {
    setIsExportingId(plan.id);
    try {
      await exportRichDocToDocx({
        title: plan.worksheetTitle || `PHIẾU HỌC TẬP – ${plan.lessonTitle}`,
        subtitle: `Khối ${plan.grade} · Tuần ${plan.week} – Tiết ${plan.period} · ${plan.chapter}`,
        sections: [
          { heading: 'I. Mục tiêu bài dạy (Yêu cầu cần đạt)', html: plan.objectives || '' },
          { heading: 'II. Thiết bị & Học liệu số', html: plan.equipment || '' },
          ...(plan.worksheetHtml
            ? [{ heading: 'III. Nội dung Phiếu học tập', html: plan.worksheetHtml }]
            : []),
        ],
        fileName: `Phieu_Hoc_Tap_Tuan_${plan.week}_Hoa_${plan.grade}.docx`,
      });
    } finally {
      setIsExportingId(null);
    }
  };

  const renderPlanEditorForm = (draftKeySuffix: string) => (
    <div className="p-5 bg-teal-50/30 border-2 border-teal-200 rounded-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-3">
        <h3 className="text-sm font-black text-teal-900">
          {showNewForm
            ? 'Thêm kế hoạch dạy học & Soạn Phiếu học tập mới'
            : 'Chỉnh sửa kế hoạch dạy học & Phiếu học tập'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingPlanId(null);
              setShowNewForm(false);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg"
          >
            <X className="w-3.5 h-3.5" /> Hủy
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
          >
            <Save className="w-3.5 h-3.5" /> Lưu kế hoạch &amp; Phiếu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Tuần</label>
          <input
            type="number"
            min={1}
            value={planDraft.week}
            onChange={(e) => setPlanDraft((p) => ({ ...p, week: Number(e.target.value) }))}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Tiết</label>
          <input
            type="number"
            min={1}
            value={planDraft.period}
            onChange={(e) => setPlanDraft((p) => ({ ...p, period: Number(e.target.value) }))}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block font-bold text-slate-700 mb-1">Chương / Chủ đề</label>
          <input
            type="text"
            value={planDraft.chapter}
            onChange={(e) => setPlanDraft((p) => ({ ...p, chapter: e.target.value }))}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <div className="text-xs">
        <label className="block font-bold text-slate-700 mb-1">Tên bài dạy *</label>
        <input
          type="text"
          value={planDraft.lessonTitle}
          onChange={(e) => setPlanDraft((p) => ({ ...p, lessonTitle: e.target.value }))}
          placeholder="Nhập tên bài dạy theo phân phối chương trình..."
          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
        />
      </div>

      <SmartChemEditor
        label="Mục tiêu bài dạy (Yêu cầu cần đạt)"
        draftKey={`plan_obj_${draftKeySuffix}`}
        value={planDraft.objectives}
        onChange={(val) => setPlanDraft((p) => ({ ...p, objectives: val }))}
        compact
        minHeight={95}
      />

      <SmartChemEditor
        label="Thiết bị & Học liệu số"
        draftKey={`plan_eq_${draftKeySuffix}`}
        value={planDraft.equipment}
        onChange={(val) => setPlanDraft((p) => ({ ...p, equipment: val }))}
        compact
        minHeight={85}
      />

      <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2.5">
        <label className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-amber-700" />
          Phiếu học tập kèm tiết dạy
        </label>
        <input
          type="text"
          value={planDraft.worksheetTitle}
          onChange={(e) => setPlanDraft((p) => ({ ...p, worksheetTitle: e.target.value }))}
          placeholder="Tiêu đề Phiếu học tập..."
          className="w-full p-2 text-xs bg-white border border-amber-300 rounded-lg font-bold"
        />
        <SmartChemEditor
          draftKey={`plan_ws_${draftKeySuffix}`}
          value={planDraft.worksheetHtml}
          onChange={(val) => setPlanDraft((p) => ({ ...p, worksheetHtml: val }))}
          minHeight={160}
          placeholder="Soạn phiếu học tập gồm câu hỏi khám phá, phương trình phản ứng, bảng dữ liệu hoặc cấu tạo hữu cơ 2D..."
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Kế Hoạch Dạy Học &amp; Soạn Phiếu Học Tập Hóa Học THPT
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Xây dựng theo Chương trình Giáo dục phổ thông 2018 – Bộ sách Kết nối tri thức với cuộc sống.
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
                  setEditingPlanId(null);
                  setShowNewForm(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all min-h-[38px] ${
                  selectedGrade === g
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khối lớp {g}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={startNewPlan}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm kế hoạch &amp; Phiếu HT</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-900 flex items-center justify-between">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-teal-700 hover:text-teal-900"
          >
            Đóng
          </button>
        </div>
      )}

      {showNewForm && renderPlanEditorForm('new')}

      <div className="space-y-4">
        {filteredPlans.map((plan) => {
          const isEditingThis = editingPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3"
            >
              {isEditingThis ? (
                renderPlanEditorForm(plan.id)
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-teal-800">Tuần {plan.week}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-700">Tiết {plan.period}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{plan.chapter}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ĐÃ DUYỆT BỞI TỔ TRƯỞNG
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditPlan(plan)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Soạn / Sửa Phiếu HT
                      </button>
                      <button
                        type="button"
                        disabled={isExportingId === plan.id}
                        onClick={() => handleExportPlanWorksheetDocx(plan)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isExportingId === plan.id ? 'Đang xuất...' : 'Xuất Phiếu (.docx)'}</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{plan.lessonTitle}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <strong className="text-slate-700 block mb-1">
                        Mục tiêu bài dạy (Yêu cầu cần đạt):
                      </strong>
                      <div className="text-slate-600 leading-relaxed text-xs">
                        <ChemFormula formula={plan.objectives} isBlock />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg">
                      <strong className="text-slate-700 block mb-1">Thiết bị &amp; Học liệu số:</strong>
                      <div className="text-slate-600 leading-relaxed text-xs">
                        <ChemFormula formula={plan.equipment} isBlock />
                      </div>
                    </div>
                  </div>

                  {plan.worksheetHtml && (
                    <div className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl space-y-1.5">
                      <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-amber-700" />
                        <span>{plan.worksheetTitle || 'Phiếu học tập kèm tiết dạy'}</span>
                      </div>
                      <div className="text-xs text-slate-800">
                        <ChemFormula formula={plan.worksheetHtml} isBlock />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
