import React, { useState } from 'react';
import { useChemStore } from '../../services/store';
import {
  Bell,
  Search,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  Database,
  CheckCircle,
  X,
  Menu
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    availableUsers,
    switchUser,
    activeRole,
    notifications,
    markNotificationRead,
    isFirebaseLive,
    toggleFirebaseMode,
  } = useChemStore();

  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);

  const roleNotifs = notifications.filter(
    (n) => n.targetRole === activeRole || (!n.targetUserId && n.targetRole === 'STUDENT')
  );
  const unreadCount = roleNotifs.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand & ChemBot mascot */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm font-black text-lg">
            ⚗️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                CHEMISTRY EDU PRO
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
                v2.0
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              Trợ lý Hóa học THPT · GDPT 2018
            </span>
          </div>
        </div>
      </div>

      {/* Center status: Storage state badge */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={() => setShowFirebaseModal(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-[11px] text-slate-600 font-medium transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>Dữ liệu: LocalStorage & Blueprint Sẵn sàng</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
      </div>

      {/* Right side: Notifications, Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu((prev) => !prev)}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-800">
                  Thông báo ({roleNotifs.length})
                </span>
                <span className="text-[10px] text-teal-700 font-medium">Vai trò: {activeRole}</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {roleNotifs.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">
                    Không có thông báo mới.
                  </div>
                ) : (
                  roleNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-slate-50 border-slate-100 text-slate-600'
                          : 'bg-teal-50/60 border-teal-200 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="font-bold text-xs">{n.title}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50/70 hover:bg-white transition-all text-left"
          >
            <span className="text-xl">{currentUser.avatar}</span>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-semibold text-teal-700 block -mt-0.5">
                {currentUser.role === 'ADMIN'
                  ? 'Quản trị viên'
                  : currentUser.role === 'DEPARTMENT_HEAD'
                  ? 'Tổ trưởng Chuyên môn'
                  : currentUser.role === 'TEACHER'
                  ? 'Giáo viên Hóa học'
                  : currentUser.role === 'STUDENT'
                  ? 'Học sinh'
                  : 'Phụ huynh'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
              <div className="p-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Chuyển đổi vai trò kiểm thử:
              </div>

              {availableUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                      isCurrent
                        ? 'bg-teal-50 border border-teal-200 text-teal-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xl shrink-0">{u.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                    </div>
                    {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FIREBASE MODAL INFO */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                Kiến Trúc Dữ Liệu & Trạng Thái Firebase
              </h3>
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Ứng dụng đang chạy ở chế độ <strong>Local Interactive Engine</strong>: toàn bộ 108 học sinh, đề kiểm tra, quy trình tự chấm, chấm lại và công bố điểm được lưu trữ bền vững tại <code>localStorage</code> (tải lại trang không mất).
              </p>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <strong className="text-teal-900 block font-bold">Cấu hình Firebase đã sẵn sàng:</strong>
                <ul className="list-disc pl-4 text-teal-800 text-[11px] space-y-0.5">
                  <li><code>firebase-blueprint.json</code>: Chuẩn hóa 10+ schemas (gradingRecords, publishedResults...)</li>
                  <li><code>firestore.rules</code>: Bảo vệ nghiêm ngặt Zero-Trust (học sinh và phụ huynh không thể đọc điểm bí mật trước khi công bố).</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
