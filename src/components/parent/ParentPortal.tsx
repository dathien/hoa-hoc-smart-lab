import React from 'react';
import { useChemStore } from '../../services/store';
import { ChemFormula } from '../common/ChemFormula';
import {
  UserCheck,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  MessageCircle,
  Bell,
  AlertCircle
} from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const { students, submissions, exams, notifications, currentUser } = useChemStore();

  // Child linked to parent (default: Nguyen Minh Khang, HS11015)
  const childId = currentUser.linkedStudentId || 'HS11015';
  const child = students.find((s) => s.id === childId) || students[14];

  // SUBMISSIONS FILTER: CRITICAL SECURITY RULE - ONLY PUBLISHED RESULTS CAN BE SEEN BY PARENT
  const childSubmissions = submissions.filter((s) => s.studentId === child?.id);
  const publishedSubmissions = childSubmissions.filter((s) => s.publishStatus === 'PUBLISHED');

  const pendingCount = childSubmissions.filter((s) => s.publishStatus === 'HIDDEN').length;

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
            👦
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Học Sinh: {child?.fullName || 'Nguyễn Minh Khang'}
              <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                {child?.studentCode}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lớp <strong>{child?.className}</strong> · GVCN & Bộ môn: <strong>Cô Trần Thị Mai Hương</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Đã xác minh liên kết phụ huynh chính chủ</span>
        </div>
      </div>

      {/* Security Rule Assurance */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-950">
        <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Thông báo bảo mật điểm số:</strong> Quý phụ huynh đang xem bảng điểm chính thức do giáo viên bộ môn phê duyệt. Các bài kiểm tra đang trong quá trình chấm hoặc chưa công bố sẽ được giữ bảo mật theo quy định nhà trường.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Bài kiểm tra đã công bố điểm
          </span>
          <div className="text-2xl font-black text-teal-700 mt-1">
            {publishedSubmissions.length} bài
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Điểm trung bình đã duyệt:{' '}
            {publishedSubmissions.length > 0
              ? (
                  publishedSubmissions.reduce(
                    (acc, s) => acc + (s.finalScore ?? s.autoGradedScore ?? 0),
                    0
                  ) / publishedSubmissions.length
                ).toFixed(1)
              : '—'}
            /10
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Bài làm đang chờ giáo viên chấm
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount} bài</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Đã nộp thành công, chờ công bố
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Đánh giá chuyên cần & thái độ
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">Tích cực</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Hoàn thành bài tập đúng hạn
          </span>
        </div>
      </div>

      {/* Official Scoreboard for Parent */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" />
            Bảng Điểm Kiểm Tra Chính Thức Của Con
          </h3>
          <span className="text-xs text-slate-400">Chỉ hiển thị bài đã công bố</span>
        </div>

        <div className="space-y-3">
          {publishedSubmissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Hiện chưa có bài kiểm tra nào được công bố điểm số chính thức.
            </div>
          ) : (
            publishedSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{sub.examTitle}</h4>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Thời gian nộp: {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')}{' '}
                    {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                  </span>
                  {sub.teacherFeedback && (
                    <div className="p-2 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-900 mt-2">
                      <strong>Nhận xét của giáo viên: </strong>
                      <ChemFormula formula={sub.teacherFeedback} />
                    </div>
                  )}
                </div>

                <div className="text-right pl-4">
                  <span className="text-3xl font-black text-teal-800">
                    {sub.finalScore ?? sub.autoGradedScore}
                  </span>
                  <span className="text-[10px] text-slate-400 block">thang 10 điểm</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Teacher Notifications for Parent */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          Thông Báo Từ Giáo Viên Chủ Nhiệm & Bộ Môn
        </h3>

        <div className="space-y-2">
          {notifications
            .filter((n) => n.targetRole === 'PARENT')
            .map((notif) => (
              <div
                key={notif.id}
                className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs space-y-1"
              >
                <div className="flex justify-between font-bold text-blue-900">
                  <span>{notif.title}</span>
                  <span className="text-[10px] text-blue-500 font-normal">
                    {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{notif.message}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
