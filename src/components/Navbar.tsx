import React from 'react';
import {
  Sparkles,
  BookOpen,
  Moon,
  Sun,
  UserCheck,
  KeyRound,
  PlusCircle,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onNewPlan: () => void;
  onOpenSwitchUser: () => void;
  onOpenApiKeyModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  darkMode,
  setDarkMode,
  onNewPlan,
  onOpenSwitchUser,
  onOpenApiKeyModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#244F70] to-[#193B55] dark:from-[#244F70] dark:to-[#122A3D] text-white flex items-center justify-center shadow-md shadow-[#244F70]/20 group-hover:scale-105 transition-all">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                    AI Lesson Planner
                  </span>
                  <span className="bg-[#6C63FF]/10 dark:bg-[#6C63FF]/20 text-[#6C63FF] dark:text-indigo-300 border border-[#6C63FF]/20 dark:border-[#6C63FF]/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    PRO VN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  GDPT 2018 &amp; Công văn 5512/3535
                </p>
              </div>
            </button>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary CTA: Soạn bài mới với AI */}
            <button
              onClick={onNewPlan}
              className="flex items-center gap-2 bg-[#244F70] hover:bg-[#193B55] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-sm shadow-[#244F70]/20 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">+ Soạn bài mới với AI</span>
              <span className="sm:hidden">+ Soạn bài</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Chuyển Chế độ Sáng' : 'Chuyển Chế độ Tối'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Gemini API Key Configuration button */}
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-all"
              title="Cấu hình Gemini API Key Cá Nhân"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">API Key</span>
            </button>

            {/* User Profile Chip */}
            <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={onOpenSwitchUser}
                title="Đăng nhập / Chuyển tài khoản giáo viên"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-xs font-semibold group"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full ring-2 ring-[#244F70]/30 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {user.name}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {user.role} • {user.school}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#244F70] dark:text-blue-400 pl-1 border-l border-slate-200 dark:border-slate-700">
                  <span className="hidden sm:inline">Đổi TK</span>
                </div>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Đăng xuất khỏi hệ thống"
                  className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
