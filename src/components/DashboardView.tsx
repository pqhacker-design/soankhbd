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
  Wand2,
  FileSpreadsheet,
  MessageSquareText,
  ArrowRight,
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

  const COLORS = ['#244F70', '#0F9D72', '#6C63FF', '#F59E0B', '#EC4899', '#3B82F6'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#244F70] via-[#193B55] to-[#122A3D] p-6 sm:p-8 text-white shadow-xl shadow-[#244F70]/10 border border-slate-700/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300 border border-white/15">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Công nghệ AI Gemini 3.6 Pro cho Giáo dục
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Phần mềm AI Lesson Planner PRO
          </h1>
          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            Nền tảng tự động hóa xây dựng Kế hoạch bài dạy theo chuẩn Chương trình GDPT 2018.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNewPlan}
              className="flex items-center gap-2 bg-white text-[#244F70] hover:bg-slate-100 font-bold text-sm px-5 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Wand2 className="w-5 h-5 text-[#244F70]" />
              Soạn Bài Dạy Mới Ngay
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-[#6C63FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={onNewPlan}
          className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow saas-card-hover text-left group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] dark:bg-[#6C63FF]/20 dark:text-indigo-300 flex items-center justify-center font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#6C63FF] group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Tạo ngay <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Soạn Bài Dạy AI</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chuẩn CV 5512 với 5 hoạt động bài dạy</p>
          </div>
        </button>

        <button
          onClick={() => {}}
          className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow saas-card-hover text-left group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#244F70]/10 text-[#244F70] dark:bg-[#244F70]/30 dark:text-blue-300 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#244F70] dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              {lessonPlans.length} giáo án
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Thư Viện Bài Dạy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lưu trữ &amp; quản lý toàn bộ bài đã soạn</p>
          </div>
        </button>

        <button
          onClick={() => {}}
          className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow saas-card-hover text-left group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Khám phá <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Ngân Hàng Học Liệu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Phiếu học tập, Quiz trắc nghiệm &amp; Rubrics</p>
          </div>
        </button>

        <button
          onClick={() => {}}
          className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow saas-card-hover text-left group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Tư vấn AI <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Trợ Lý Hỏi Đáp AI</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hỏi đáp phương pháp &amp; quy định GDPT 2018</p>
          </div>
        </button>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#244F70]/10 dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Kế Hoạch Bài Dạy</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{lessonPlans.length}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Chuẩn CV 5512/3535
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] dark:bg-[#6C63FF]/20 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Môn Học Phủ Sóng</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{Object.keys(subjectCounts).length} Môn</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">Tiểu học, THCS, THPT</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Thời Gian Tiết Kiệm</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">~{lessonPlans.length * 2.5} Giờ</div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">Năng suất gấp 5 lần</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đánh Giá Chất Lượng</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">100%</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Đầy đủ 4 thành phần</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {lessonPlans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 saas-card-shadow">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
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

          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 saas-card-shadow">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
              Thống Kê Số Lượng Bài Theo Khối Lớp
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#244F70" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Lesson Plans Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 saas-card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Kế Hoạch Bài Dạy Mới Soạn
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Danh sách các bài dạy được lưu gần đây trong hệ thống
            </p>
          </div>
          <button
            onClick={onNewPlan}
            className="text-xs font-semibold text-[#244F70] hover:text-[#193B55] dark:text-blue-400 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Soạn thêm bài mới
          </button>
        </div>

        {lessonPlans.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Chưa có Kế hoạch bài dạy nào
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Hãy bấm nút "Soạn Bài Dạy Mới" để AI tự động tạo giáo án chuẩn Công văn 5512 cho thầy cô.
            </p>
            <button
              onClick={onNewPlan}
              className="bg-[#244F70] hover:bg-[#193B55] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Soạn bài đầu tiên ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Tên bài dạy</th>
                  <th className="py-3 px-4">Môn &amp; Lớp</th>
                  <th className="py-3 px-4">Bộ sách</th>
                  <th className="py-3 px-4">Ngày dạy</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lessonPlans.slice(0, 5).map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {plan.info.lessonTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.subject}</span> - {plan.grade}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs truncate max-w-xs">
                      {plan.textbook}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {plan.info.date || new Date().toISOString().split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectPlan(plan)}
                        className="p-1.5 rounded-lg text-[#244F70] hover:bg-[#244F70]/10 dark:hover:bg-slate-800 transition-colors"
                        title="Xem &amp; Chỉnh sửa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportLessonPlanToDocx(plan)}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                        title="Tải Word (.docx)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicatePlan(plan)}
                        className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                        title="Nhân bản"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
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
