import React from 'react';
import {
  LayoutDashboard,
  Wand2,
  BookOpen,
  FileSpreadsheet,
  FileText,
  MessageSquareText,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  KeyRound,
  Layers,
} from 'lucide-react';

import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  currentUser?: UserProfile;
  onOpenApiKeyModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, savedCount, currentUser, onOpenApiKeyModal }) => {
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.email?.trim().toLowerCase() === 'pqhacker@gmail.com';

  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Bảng Điều Khiển',
      desc: 'Tổng quan & Thống kê',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'planner',
      label: 'Soạn Bài Dạy AI',
      desc: 'Tạo giáo án chuẩn CV 5512',
      icon: Wand2,
      badge: 'AI 3.6',
      badgeColor: 'bg-[#6C63FF]/10 text-[#6C63FF] dark:bg-[#6C63FF]/20 dark:text-indigo-300',
      highlight: true,
    },
    {
      id: 'integrator',
      label: 'Tích Hợp Giáo Án',
      desc: 'Nâng cấp giáo án sẵn có',
      icon: Layers,
      badge: 'Mới',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      highlight: true,
    },
    {
      id: 'library',
      label: 'Thư Viện Bài Dạy',
      desc: 'Kho giáo án & Mẫu bài',
      icon: BookOpen,
      badge: savedCount > 0 ? `${savedCount} bài` : null,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'materials',
      label: 'Ngân Hàng Học Liệu',
      desc: 'Phiếu học tập, Quiz & Slide',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'documents',
      label: 'Văn Bản BGD&ĐT',
      desc: 'Công văn 5512, 3535, TT22...',
      icon: FileText,
      badge: 'Chính thống',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      id: 'chat',
      label: 'Trợ Lý Hỏi Đáp AI',
      desc: 'Tư vấn GDPT 2018 & Phương pháp',
      icon: MessageSquareText,
      badge: null,
    },
    {
      id: 'admin',
      label: 'Quản Trị Hệ Thống',
      desc: 'Phân quyền & Cấu hình AI',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  const navItems = allNavItems.filter((item) => item.id !== 'admin' || isAdmin);

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-[#1E293B] border-r border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 transition-colors">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 px-3">
            DANH MỤC CHỨC NĂNG
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Left Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#244F70] dark:bg-blue-400 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-105 shrink-0 ${
                        isActive
                          ? 'text-[#244F70] dark:text-blue-400'
                          : item.highlight
                          ? 'text-[#6C63FF] dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-semibold leading-tight">{item.label}</div>
                      <div
                        className={`text-[11px] font-normal leading-normal mt-0.5 ${
                          isActive
                            ? 'text-[#244F70]/80 dark:text-blue-300/80'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* API Key Quick Button */}
        {onOpenApiKeyModal && (
          <button
            onClick={onOpenApiKeyModal}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/70 text-amber-900 dark:text-amber-300 text-left transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
              <div>
                <div className="text-xs font-bold">Cấu hình API Key</div>
                <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80">Gemini 3.6 Pro API</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        )}

        {/* Feature Highlights Box */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#244F70] dark:text-blue-400 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#6C63FF] dark:text-indigo-400" />
            GDPT 2018 Thông Minh
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Tự động tích hợp 4 thành phần mục tiêu, 5 hoạt động theo CV 5512/3535, xuất Word chuẩn lề.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            100% Chuẩn Bộ GD&amp;ĐT
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          AI Lesson Planner Pro v3.6
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
          Dành riêng cho Giáo viên Việt Nam
        </p>
      </div>
    </aside>
  );
};
