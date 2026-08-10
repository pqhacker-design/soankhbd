import React from 'react';
import {
  Sparkles,
  BookOpen,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Settings,
  PlusCircle,
  FolderKanban,
  Moon,
  Sun,
  UserCheck,
  KeyRound,
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
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFCFB]/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-[#E7E5E0] dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#2A4D69] dark:bg-stone-800 flex items-center justify-center text-[#FDFCFB] shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xl text-[#2A4D69] dark:text-stone-100 tracking-tight">
                    AI Lesson Planner
                  </span>
                  <span className="bg-[#2A4D69]/10 dark:bg-stone-800 text-[#2A4D69] dark:text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-[#2A4D69]/20 dark:border-stone-700">
                    Pro VN
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                  Chuẩn GDPT 2018 &amp; CV 5512/3535
                </p>
              </div>
            </button>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onNewPlan}
              className="flex items-center gap-2 bg-[#2A4D69] hover:bg-[#1f3b52] dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-sm px-3.5 py-2 rounded-lg shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Soạn bài mới với AI</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-[#F2F0EB] dark:hover:bg-stone-800 transition-colors"
              title={darkMode ? 'Chuyển Chế độ Sáng' : 'Chuyển Chế độ Tối'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Gemini API Key Configuration button */}
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all shadow-2xs"
              title="Cấu hình Gemini API Key Cá Nhân"
            >
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">API Key</span>
            </button>

            {/* User Profile Badge & Login Switcher */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E7E5E0] dark:border-stone-800">
              <button
                onClick={onOpenSwitchUser}
                title="Đăng nhập / Chuyển tài khoản giáo viên bằng Email & Mật khẩu do Admin cấp"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-all text-xs font-semibold group shadow-2xs"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full ring-2 ring-blue-500/40 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                    {user.name}
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" />
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">
                    {user.role} - {user.school}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 pl-1 border-l border-blue-200 dark:border-blue-800">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Đăng nhập / Đổi TK</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
