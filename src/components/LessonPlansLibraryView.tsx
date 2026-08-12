import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  PlusCircle,
  Eye,
  Download,
  Copy,
  Trash2,
  FileJson,
  Upload,
  Sparkles,
  Filter,
} from 'lucide-react';
import { FullLessonPlan } from '../types';
import { exportLessonPlanToDocx } from '../utils/docxExporter';
import { useToast } from '../context/ToastContext';

interface LessonPlansLibraryViewProps {
  lessonPlans: FullLessonPlan[];
  onSelectPlan: (plan: FullLessonPlan) => void;
  onNewPlan: () => void;
  onDuplicatePlan: (plan: FullLessonPlan) => void;
  onDeletePlan: (id: string) => void;
  onImportPlans: (plans: FullLessonPlan[]) => void;
}

export const LessonPlansLibraryView: React.FC<LessonPlansLibraryViewProps> = ({
  lessonPlans,
  onSelectPlan,
  onNewPlan,
  onDuplicatePlan,
  onDeletePlan,
  onImportPlans,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('Tất cả');

  const filteredPlans = lessonPlans.filter((plan) => {
    const matchesSearch =
      plan.info.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.textbook.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      selectedLevelFilter === 'Tất cả' || plan.level === selectedLevelFilter;

    return matchesSearch && matchesLevel;
  });

  // Export library as JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lessonPlans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Thu_Vien_Giao_An_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import library from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportPlans(imported);
          toast.success(`Đã nhập thành công ${imported.length} Kế hoạch bài dạy!`);
        } else {
          toast.error('File JSON không hợp lệ.');
        }
      } catch (err) {
        toast.error('Lỗi đọc file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Thư Viện Kế Hoạch Bài Dạy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý, lưu trữ, tra cứu và chia sẻ toàn bộ bài dạy đã tạo trong hệ thống ({lessonPlans.length} bài)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-4 h-4" /> Nhập JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <FileJson className="w-4 h-4" /> Xuất JSON
          </button>

          <button
            onClick={onNewPlan}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Soạn bài mới
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bài dạy, môn học, khối lớp, bộ sách..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['Tất cả', 'Tiểu học', 'THCS', 'THPT'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevelFilter === lvl
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Không tìm thấy Kế hoạch bài dạy phù hợp
          </h3>
          <p className="text-xs text-slate-500">
            Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút Soạn bài mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    {plan.subject} - {plan.grade}
                  </span>
                  <span className="text-[10px] text-slate-400">{plan.info.date || 'Lưu gần đây'}</span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {plan.info.lessonTitle}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  Sách: {plan.textbook} | {plan.info.periodNumber}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectPlan(plan)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <Eye className="w-4 h-4" /> Xem &amp; Sửa
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => exportLessonPlanToDocx(plan)}
                    className="p-2 rounded-xl text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                    title="Tải Word (.docx)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicatePlan(plan)}
                    className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                    title="Nhân bản"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
