import React from 'react';
import { useChemStore } from '../../services/store';
import { SCIENTIFIC_FLASHCARDS } from '../flashcard/ScientificFlashcards';
import {
  Users,
  FileCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  ArrowRight
} from 'lucide-react';

interface TeacherOverviewProps {
  onNavigate: (tab: string) => void;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({ onNavigate }) => {
  const { students, classes, exams, submissions, currentUser } = useChemStore();

  const totalStudents = students.length;
  const totalSubmissions = submissions.length;
  const pendingReviewSubmissions = submissions.filter((s) => s.submissionStatus === 'NEEDS_REVIEW');
  const publishedCount = submissions.filter((s) => s.publishStatus === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-2xl p-7 text-white shadow-md flex flex-wrap items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <span className="text-sm font-extrabold text-teal-300 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            Trợ Lý Giảng Dạy Hóa Học THPT Chuẩn GDPT 2018
          </span>
          <h2 className="text-2xl md:text-3xl font-black">
            Chào mừng {currentUser.name}!
          </h2>
          <p className="text-[17px] text-teal-100 leading-relaxed font-medium">
            Hệ thống quản lý <strong>3 lớp học (108 học sinh)</strong>, ngân hàng câu hỏi chuẩn SGK Kết nối tri thức, hỗ trợ tự chấm, phê duyệt điểm và phòng thí nghiệm 3D tương tác.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('grading')}
            className="flex items-center gap-2 px-6 py-3 text-[17px] font-black text-teal-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 min-h-[44px]"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Chấm bài & duyệt điểm ngay</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('classes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">Tổng số học sinh</span>
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-800 mt-2">{totalStudents}</div>
          <span className="text-[14px] font-medium text-slate-500 mt-1 block">10A1 (30), 11A1 (39), 12A1 (39)</span>
        </div>

        <div
          onClick={() => onNavigate('exams')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">Đề kiểm tra đang mở</span>
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-800 mt-2">{exams.length}</div>
          <span className="text-[14px] font-medium text-slate-500 mt-1 block">15p, 45p, giữa kỳ & tự luyện</span>
        </div>

        <div
          onClick={() => onNavigate('grading')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">Bài chờ GV chấm</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {pendingReviewSubmissions.length}
          </div>
          <span className="text-[14px] font-medium text-slate-500 mt-1 block">Có câu tự luận cần duyệt</span>
        </div>

        <div
          onClick={() => onNavigate('grading')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">Điểm đã công bố</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{publishedCount}</div>
          <span className="text-[14px] font-medium text-slate-500 mt-1 block">Học sinh & PH đã xem được</span>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Urgent Task Card: Needs Review */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              Bài Nộp Cần Chấm & Duyệt Điểm
            </h3>
            <span className="text-xs font-bold text-amber-600">
              {pendingReviewSubmissions.length} bài
            </span>
          </div>

          <div className="space-y-2">
            {pendingReviewSubmissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => onNavigate('grading')}
                className="p-3 bg-slate-50 hover:bg-teal-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors"
              >
                <div className="flex justify-between font-bold text-xs text-slate-900">
                  <span>{sub.studentName}</span>
                  <span className="text-teal-700 font-mono">{sub.studentCode}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{sub.examTitle}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('grading')}
            className="w-full text-center text-xs font-bold text-teal-700 hover:underline pt-1 block"
          >
            Mở màn hình chấm bài & duyệt điểm ➔
          </button>
        </div>

        {/* Classes quick management */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-600" />
            Các Lớp Giảng Dạy & Chủ Nhiệm
          </h3>

          <div className="space-y-2">
            {classes.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('classes')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900">Lớp {c.name}</span>
                  <span className="text-[11px] text-slate-400 block">GVCN: {c.homeroomTeacherName}</span>
                </div>
                <span className="font-bold text-xs text-teal-700">{c.studentCount} HS</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('classes')}
            className="w-full text-center text-xs font-bold text-teal-700 hover:underline pt-1 block"
          >
            Quản lý hồ sơ & Nhập xuất Excel ➔
          </button>
        </div>

        {/* Virtual Lab & Flashcard quick access */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Tài Nguyên & Học Liệu Tương Tác
          </h3>

          <div className="space-y-2">
            <div
              onClick={() => onNavigate('lab')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-900">Phòng Thí Nghiệm 3D</span>
                <span className="text-[11px] text-slate-400 block">Mô phỏng ống nghiệm, đun nóng, kết tủa</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate('flashcard')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-900">Flashcard Hóa học 3D</span>
                <span className="text-[11px] text-slate-400 block">
                  {SCIENTIFIC_FLASHCARDS.length} thẻ phân tử 3D (NH₃, H₂O, H₂SO₄...)
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate('zalo')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-900">Tin Nhắn Phụ Huynh (Zalo)</span>
                <span className="text-[11px] text-slate-400 block">Soạn tin nhắn tự động tối đa 150 ký tự</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
