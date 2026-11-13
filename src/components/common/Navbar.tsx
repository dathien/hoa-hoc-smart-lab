import React, { useState } from 'react';
import { useChemStore } from '../../services/store';
import {
  Bell,
  ChevronDown,
  CheckCircle,
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
  } = useChemStore();

  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);

  const roleNotifs = notifications.filter(
    (n) => n.targetRole === activeRole || (!n.targetUserId && n.targetRole === 'STUDENT')
  );
  const unreadCount = roleNotifs.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sticky top-0 z-40 shadow-xs">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Mở hoặc đóng thanh điều hướng"
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm font-black text-lg shrink-0">
            ⚗️
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight truncate">
              CHEMISTRY EDU PRO
            </div>
            <span className="text-[11px] text-slate-500 block leading-tight truncate">
              Trợ lý Hóa học THPT
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Notifications, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

    </header>
  );
};
