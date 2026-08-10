import React from 'react';
import {
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  TrendingUp,
  Download,
  PlusCircle,
  Eye,
  Trash2,
  Copy,
  CheckCircle2,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FullLessonPlan } from '../types';
import { exportLessonPlanToDocx } from '../utils/docxExporter';

interface DashboardViewProps {
  lessonPlans: FullLessonPlan[];
  onSelectPlan: (plan: FullLessonPlan) => void;
  onNewPlan: () => void;
  onDuplicatePlan: (plan: FullLessonPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lessonPlans,
  onSelectPlan,
  onNewPlan,
  onDuplicatePlan,
  onDeletePlan,
}) => {
  // Compute chart statistics
  const subjectCounts: Record<string, number> = {};
  const gradeCounts: Record<string, number> = {};

  lessonPlans.forEach((plan) => {
    subjectCounts[plan.subject] = (subjectCounts[plan.subject] || 0) + 1;
    gradeCounts[plan.grade] = (gradeCounts[plan.grade] || 0) + 1;
  });

  const subjectData = Object.entries(subjectCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const gradeData = Object.entries(gradeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#2563EB', '#0D9488', '#D97706', '#7C3AED', '#EC4899', '#059669'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2A4D69] p-6 sm:p-8 text-white shadow-md border border-[#1f3b52]">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-200 border border-white/15">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Soạn giáo án thông minh công nghệ AI Gemini 3.6
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight leading-tight">
            Chào mừng thầy cô đến với AI Lesson Planner Pro Việt Nam
          </h1>
          <p className="text-sm sm:text-base text-stone-200 font-sans leading-relaxed">
            Hệ thống hỗ trợ tự động xây dựng Kế hoạch bài dạy theo chuẩn Chương trình GDPT 2018 &amp; Công văn 5512, 3535 của Bộ GD&amp;ĐT. Tiết kiệm 85% thời gian nhưng vẫn đảm bảo chất lượng sư phạm xuất sắc.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNewPlan}
              className="flex items-center gap-2 bg-[#FDFCFB] text-[#2A4D69] hover:bg-stone-100 font-bold text-sm px-5 py-3 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-[#2A4D69]" />
              Soạn Bài Dạy Mới Ngay
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#2A4D69]/10 dark:bg-stone-800 text-[#2A4D69] dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Tổng Kế Hoạch Bài Dạy</div>
            <div className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">{lessonPlans.length}</div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Chuẩn CV 5512/3535
            </div>
          </div>
        </div>

        <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#2A4D69]/10 dark:bg-stone-800 text-[#2A4D69] dark:text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Môn Học Phủ Sóng</div>
            <div className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">{Object.keys(subjectCounts).length} Môn</div>
            <div className="text-[10px] text-stone-400 mt-1">Tiểu học, THCS, THPT</div>
          </div>
        </div>

        <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Thời Gian Tiết Kiệm</div>
            <div className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">~{lessonPlans.length * 2.5} Giờ</div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1">Năng suất gấp 5 lần</div>
          </div>
        </div>

        <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Đánh Giá Chất Lượng</div>
            <div className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">100%</div>
            <div className="text-[10px] text-purple-700 dark:text-purple-400 font-medium mt-1">Đầy đủ 4 thành phần</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {lessonPlans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2A4D69] dark:text-amber-400" />
              Phân Bổ Kế Hoạch Bài Dạy Theo Môn Học
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2A4D69] dark:text-amber-400" />
              Thống Kê Số Lượng Bài Theo Khối Lớp
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2A4D69" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Lesson Plans Table */}
      <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Kế Hoạch Bài Dạy Mới Soạn
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Danh sách các bài dạy được lưu gần đây trong hệ thống
            </p>
          </div>
          <button
            onClick={onNewPlan}
            className="text-xs font-semibold text-[#2A4D69] hover:text-[#1f3b52] dark:text-amber-400 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Soạn thêm bài mới
          </button>
        </div>

        {lessonPlans.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#E7E5E0] dark:border-stone-800 rounded-xl">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-stone-700 dark:text-stone-300">
              Chưa có Kế hoạch bài dạy nào
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4">
              Hãy bấm nút "Soạn Bài Dạy Mới" để AI tự động tạo giáo án chuẩn Công văn 5512 cho thầy cô.
            </p>
            <button
              onClick={onNewPlan}
              className="bg-[#2A4D69] hover:bg-[#1f3b52] text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Soạn bài đầu tiên ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] dark:border-stone-800 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Tên bài dạy</th>
                  <th className="py-3 px-4">Môn &amp; Lớp</th>
                  <th className="py-3 px-4">Bộ sách</th>
                  <th className="py-3 px-4">Ngày dạy</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]/60 dark:divide-stone-800">
                {lessonPlans.slice(0, 5).map((plan) => (
                  <tr key={plan.id} className="hover:bg-[#F5F3EE] dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-serif font-medium text-stone-900 dark:text-white max-w-xs truncate">
                      {plan.info.lessonTitle}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 text-xs">
                      <span className="font-medium">{plan.subject}</span> - {plan.grade}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400 text-xs truncate max-w-xs">
                      {plan.textbook}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400 text-xs">
                      {plan.info.date || new Date().toISOString().split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectPlan(plan)}
                        className="p-1.5 rounded-lg text-[#2A4D69] hover:bg-[#2A4D69]/10 dark:hover:bg-stone-800 transition-colors"
                        title="Xem &amp; Chỉnh sửa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportLessonPlanToDocx(plan)}
                        className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 dark:hover:bg-stone-800 transition-colors"
                        title="Tải Word (.docx)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicatePlan(plan)}
                        className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 dark:hover:bg-stone-800 transition-colors"
                        title="Nhân bản"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
