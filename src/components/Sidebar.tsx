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
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  onOpenApiKeyModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, savedCount, onOpenApiKeyModal }) => {
  const navItems = [
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
      highlight: true,
    },
    {
      id: 'library',
      label: 'Thư Viện Bài Dạy',
      desc: 'Kho giáo án & Mẫu bài',
      icon: BookOpen,
      badge: savedCount > 0 ? savedCount : null,
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

  return (
    <aside className="w-full md:w-64 bg-[#FDFCFB] dark:bg-stone-900 border-r border-[#E7E5E0] dark:border-stone-800 p-4 flex flex-col justify-between shrink-0 transition-colors">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3 px-3">
            DANH MỤC CHỨC NĂNG
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group ${
                    isActive
                      ? 'bg-[#2A4D69] text-[#FDFCFB] shadow-sm font-medium'
                      : item.highlight
                      ? 'bg-[#F5F3EE] dark:bg-stone-800 text-[#2A4D69] dark:text-stone-200 hover:bg-[#ECE8E1] dark:hover:bg-stone-700/80 border border-[#2A4D69]/20 dark:border-stone-700'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-[#F5F3EE] dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'text-[#FDFCFB]'
                          : item.highlight
                          ? 'text-[#2A4D69] dark:text-amber-400'
                          : 'text-stone-500 dark:text-stone-400'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] ${
                          isActive
                            ? 'text-stone-200'
                            : 'text-stone-400 dark:text-stone-500'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#2A4D69]/10 dark:bg-stone-800 text-[#2A4D69] dark:text-stone-300'
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
            className="w-full flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/80 text-amber-900 dark:text-amber-300 text-left transition-all"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-xs font-bold">Cấu hình API Key</div>
                <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80">Nhập Gemini API Key cá nhân</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        )}

        {/* Feature Highlights Box */}
        <div className="bg-[#F5F3EE] dark:bg-stone-800/80 border border-[#E7E5E0] dark:border-stone-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#2A4D69] dark:text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            GDPT 2018 Thông Minh
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-3 font-sans">
            Tự động tích hợp 4 thành phần mục tiêu, 5 hoạt động theo CV 5512/3535, xuất Word chuẩn lề.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 font-medium">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            100% Đúng chuẩn Bộ GD&ĐT
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#E7E5E0] dark:border-stone-800 text-center">
        <p className="text-[11px] text-stone-400 dark:text-stone-500 font-serif italic">
          AI Lesson Planner Pro v3.6
        </p>
        <p className="text-[10px] text-stone-400 dark:text-stone-600">
          Hỗ trợ Giáo viên Việt Nam
        </p>
      </div>
    </aside>
  );
};
