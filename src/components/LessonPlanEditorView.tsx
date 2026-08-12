import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Save,
  Edit3,
  Eye,
  Layers,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  Plus,
  Trash2,
  RefreshCw,
  Wand2,
  FileCheck,
  Award,
  Tv,
  ExternalLink,
  BrainCircuit,
  Check,
  Presentation,
  FileCode,
  Building2,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { FullLessonPlan, LessonActivity, QuizQuestion, Worksheet, UserProfile } from '../types';
import { exportLessonPlanToDocx } from '../utils/docxExporter';
import { buildNotebookLMPrompt } from '../utils/notebooklmPromptBuilder';
import { getApiKeyHeaders } from '../utils/apiHelper';
import { MathText } from './MathText';
import { useToast } from '../context/ToastContext';

interface LessonPlanEditorViewProps {
  plan: FullLessonPlan;
  onSavePlan: (updatedPlan: FullLessonPlan) => void;
  currentUser?: UserProfile;
}

export const LessonPlanEditorView: React.FC<LessonPlanEditorViewProps> = ({
  plan,
  onSavePlan,
  currentUser,
}) => {
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<FullLessonPlan>(plan);
  const [layoutFormat, setLayoutFormat] = useState<'standard' | 'two_column' | 'three_column'>(
    plan.layoutFormat || 'standard'
  );
  const [activeTab, setActiveTab] = useState<
    'preview' | 'edit' | 'activities' | 'materials' | 'notebooklm' | 'assessment'
  >('preview');

  // Sync state when plan prop changes
  useEffect(() => {
    setCurrentPlan(plan);
    setLayoutFormat(plan.layoutFormat || 'standard');
  }, [plan]);

  const handleLayoutFormatChange = (fmt: 'standard' | 'two_column' | 'three_column') => {
    setLayoutFormat(fmt);
    const updated = { ...currentPlan, layoutFormat: fmt };
    setCurrentPlan(updated);
    onSavePlan(updated);
  };

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedNotebookLMPrompt, setCopiedNotebookLMPrompt] = useState<boolean>(false);
  const [refiningActivityId, setRefiningActivityId] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState<string>('');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isGeneratingMaterials, setIsGeneratingMaterials] = useState<boolean>(false);
  const [notebookLMViewMode, setNotebookLMViewMode] = useState<'prompt' | 'slides'>('prompt');

  // Build the NotebookLM prompt dynamically from current plan
  const notebookLMPromptText = buildNotebookLMPrompt(currentPlan);

  // Quick apply current user's school, name, and department to this plan
  const handleApplyCurrentUser = () => {
    if (!currentUser) return;
    const updatedPlan: FullLessonPlan = {
      ...currentPlan,
      info: {
        ...currentPlan.info,
        schoolName: currentUser.school || currentPlan.info.schoolName,
        teacherName: currentUser.name || currentPlan.info.teacherName,
        departmentName: currentUser.department || currentPlan.info.departmentName || 'Tổ Chuyên Môn',
      },
    };
    setCurrentPlan(updatedPlan);
    onSavePlan(updatedPlan);
    toast.success(`Đã cập nhật Tên Trường ("${currentUser.school}") và Họ Tên Giáo Viên ("${currentUser.name}") vào Kế hoạch bài dạy thành công!`);
  };

  // Copy full lesson text to clipboard
  const handleCopyText = () => {
    const textToCopy = `
KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
Bài: ${currentPlan.info.lessonTitle.toUpperCase()}
Môn: ${currentPlan.subject} - ${currentPlan.grade} (${currentPlan.textbook})
Trường: ${currentPlan.info.schoolName || ''}
Giáo viên: ${currentPlan.info.teacherName || ''}

I. MỤC TIÊU:
1. Yêu cầu cần đạt:
${currentPlan.objectives.requirementsToAchieve.map((r) => `- ${r}`).join('\n')}

2. Năng lực:
- Năng lực chung: ${currentPlan.objectives.generalCompetencies.join(', ')}
- Năng lực đặc thù: ${currentPlan.objectives.specificCompetencies.join(', ')}

3. Phẩm chất: ${currentPlan.objectives.qualities.join(', ')}

II. THIẾT BỊ DẠY HỌC & HỌC LIỆU:
- Giáo viên: ${currentPlan.equipmentsAndMaterials.equipments.join(', ')}
- Học sinh: ${currentPlan.equipmentsAndMaterials.materials.join(', ')}

III. TIẾN TRÌNH DẠY HỌC:
${currentPlan.activities
  .map(
    (act, i) => `
HOẠT ĐỘNG ${i + 1}: ${act.name.toUpperCase()} (${act.duration})
- Mục tiêu: ${act.objective}
- Nội dung: ${act.content}
- Sản phẩm: ${act.product}
- Tổ chức thực hiện:
  a) Chuyển giao: ${act.implementation.transfer}
  b) Thực hiện: ${act.implementation.execution}
  c) Báo cáo: ${act.implementation.reporting}
  d) Kết luận: ${act.implementation.conclusion}
`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy NotebookLM Prompt to Clipboard
  const handleCopyNotebookLMPrompt = () => {
    navigator.clipboard.writeText(notebookLMPromptText);
    setCopiedNotebookLMPrompt(true);
    setTimeout(() => setCopiedNotebookLMPrompt(false), 2500);
  };

  // AI Refine Activity
  const handleRefineActivity = async (activity: LessonActivity) => {
    if (!refineInstruction.trim()) return;
    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-activity', {
        method: 'POST',
        headers: getApiKeyHeaders(),
        body: JSON.stringify({ activity, instruction: refineInstruction }),
      });
      const data = await response.json();
      if (data.success && data.activity) {
        const updatedActivities = currentPlan.activities.map((act) =>
          act.id === activity.id ? data.activity : act
        );
        const updated = { ...currentPlan, activities: updatedActivities };
        setCurrentPlan(updated);
        onSavePlan(updated);
        setRefiningActivityId(null);
        setRefineInstruction('');
        toast.success('Đã tinh chỉnh hoạt động bài dạy thành công!');
      } else {
        toast.error('Không thể tinh chỉnh hoạt động: ' + (data.error || 'Lỗi kết nối'));
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối đến máy chủ AI');
    } finally {
      setIsRefining(false);
    }
  };

  // Generate Supplementary Materials & Quizzes with AI
  const handleGenerateMaterials = async () => {
    setIsGeneratingMaterials(true);
    const payload = {
      lessonTitle: currentPlan.info.lessonTitle,
      subject: currentPlan.subject,
      grade: currentPlan.grade,
      textbook: currentPlan.textbook,
      promptType: 'all',
    };

    let generatedMaterials: any = null;

    try {
      const response = await fetch('/api/generate-materials', {
        method: 'POST',
        headers: getApiKeyHeaders(),
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.materials) {
          generatedMaterials = data.materials;
        }
      }
    } catch (e) {
      console.warn('Server API error for materials generation, trying client fallback:', e);
    }

    if (!generatedMaterials) {
      try {
        const { generateMaterialsDirect } = await import('../utils/clientGeminiService');
        generatedMaterials = await generateMaterialsDirect(payload);
      } catch (clientErr) {
        console.error('Client materials generation error:', clientErr);
      }
    }

    if (generatedMaterials) {
      const updated = {
        ...currentPlan,
        supplementaryMaterials: generatedMaterials,
      };
      setCurrentPlan(updated);
      onSavePlan(updated);
      toast.success('Đã tạo thành công Bộ Quiz trắc nghiệm 4 mức độ & Học liệu bổ trợ!');
    } else {
      toast.error('Không thể sinh học liệu. Vui lòng kiểm tra lại API Key!');
    }
    setIsGeneratingMaterials(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 saas-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-[#244F70]/20">
              {currentPlan.subject} - {currentPlan.grade}
            </span>
            <span>•</span>
            <span>{currentPlan.textbook}</span>
            {currentPlan.info.schoolName && (
              <>
                <span>•</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{currentPlan.info.schoolName}</span>
              </>
            )}
            {currentPlan.info.teacherName && (
              <>
                <span>•</span>
                <span className="text-[#244F70] dark:text-blue-300 font-bold">GV: {currentPlan.info.teacherName}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
            {currentPlan.info.lessonTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser && (
            <button
              onClick={handleApplyCurrentUser}
              className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-all active:scale-95"
              title={`Cập nhật đơn vị ("${currentUser.school}") & GV ("${currentUser.name}")`}
            >
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Đổi sang GV: {currentUser.name}
            </button>
          )}

          <button
            onClick={() => exportLessonPlanToDocx(currentPlan)}
            className="flex items-center gap-1.5 bg-[#244F70] hover:bg-[#193B55] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
            title="Tải file Microsoft Word (.docx)"
          >
            <Download className="w-4 h-4" /> Tải Word (.docx)
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            title="Sao chép toàn bộ văn bản giáo án"
          >
            <Copy className="w-4 h-4" /> {copied ? 'Đã chép!' : 'Sao chép'}
          </button>

          <button
            onClick={() => onSavePlan(currentPlan)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
            title="Lưu lại các chỉnh sửa vào hệ thống"
          >
            <Save className="w-4 h-4" /> Lưu lại
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'preview', label: 'Bản In Giáo Án (CV 5512)', icon: Eye },
          { id: 'edit', label: 'Chỉnh Sửa Thông Tin & Đơn Vị', icon: Edit3 },
          { id: 'activities', label: '5 Hoạt Động Bài Dạy', icon: Layers },
          { id: 'materials', label: 'Phiếu Học Tập & Quiz', icon: FileSpreadsheet },
          { id: 'notebooklm', label: 'Prompt NotebookLM & Slide', icon: Tv },
          { id: 'assessment', label: 'Rubric & Đánh Giá', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#244F70] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Layout Format Switcher Bar */}
      <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#244F70] dark:text-blue-300">
            Hình thức trình bày giáo án:
          </span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            (Thay đổi định dạng hiển thị &amp; khi xuất file Word .docx)
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          {[
            { id: 'standard', label: '1. Tiêu Chuẩn (CV 5512)' },
            { id: 'two_column', label: '2. Dạng Bảng 2 Cột' },
            { id: 'three_column', label: '3. Dạng Bảng 3 Cột' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => handleLayoutFormatChange(fmt.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                layoutFormat === fmt.id
                  ? 'bg-[#244F70] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PREVIEW (PRINTABLE CV 5512 FORMAT) */}
      {activeTab === 'preview' && (
        <div
          id="printable-lesson-plan"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-10 saas-card-shadow space-y-8 text-slate-800 dark:text-slate-200 font-sans leading-relaxed"
        >
          {/* Active Account Sync Banner */}
          {currentUser && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#EAF3F8] dark:bg-[#244F70]/20 p-3 rounded-2xl border border-[#244F70]/20 text-xs text-[#244F70] dark:text-blue-300">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0 text-[#244F70]" />
                <span>
                  Tài khoản đăng nhập hiện tại: <strong className="font-bold">{currentUser.name}</strong> ({currentUser.school} - {currentUser.department || 'Tổ chuyên môn'})
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyCurrentUser}
                className="bg-[#244F70] hover:bg-[#193B55] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                title="Áp dụng tên trường và họ tên giáo viên của tài khoản đang đăng nhập vào giáo án này"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Áp dụng tên đơn vị &amp; giáo viên cho giáo án này
              </button>
            </div>
          )}

          {/* Header Metadata Table */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4 grid grid-cols-2 text-xs font-sans">
            <div>
              <p>Trường: <span className="font-bold">{currentPlan.info.schoolName || '..............................................'}</span></p>
              <p>Tổ chuyên môn: <span className="font-bold">{currentPlan.info.departmentName || '..............................................'}</span></p>
            </div>
            <div className="text-right">
              <p>Họ và tên GV: <span className="font-bold">{currentPlan.info.teacherName || '..............................................'}</span></p>
              <p>Lớp: <span className="font-bold">{currentPlan.info.classGroup || currentPlan.grade}</span> | Ngày dạy: <span className="font-bold">{currentPlan.info.date}</span></p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#244F70] dark:text-blue-300 tracking-tight">
              KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
            </h2>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase">
              BÀI: <MathText text={currentPlan.info.lessonTitle} />
            </h3>
            <p className="text-xs italic text-slate-500 dark:text-slate-400">
              Môn: {currentPlan.subject} - {currentPlan.grade} ({currentPlan.textbook}) | Tiết: {currentPlan.info.periodNumber} ({currentPlan.info.duration})
            </p>
          </div>

          {/* Section I: OBJECTIVES */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#244F70] dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
              I. MỤC TIÊU BÀI HỌC
            </h4>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-900 dark:text-white">1. Yêu cầu cần đạt:</p>
              <ul className="list-disc pl-5 space-y-1">
                {currentPlan.objectives.requirementsToAchieve.map((req, idx) => (
                  <li key={idx}><MathText text={req} /></li>
                ))}
              </ul>

              <p className="font-semibold text-slate-900 dark:text-white pt-2">2. Năng lực phát triển:</p>
              <p className="pl-3"><span className="font-medium">a) Năng lực chung:</span> <MathText text={currentPlan.objectives.generalCompetencies.join(', ')} /></p>
              <p className="pl-3"><span className="font-medium">b) Năng lực đặc thù:</span> <MathText text={currentPlan.objectives.specificCompetencies.join(', ')} /></p>

              <p className="font-semibold text-slate-900 dark:text-white pt-2">3. Phẩm chất:</p>
              <p className="pl-3"><MathText text={currentPlan.objectives.qualities.join(', ')} /></p>
            </div>
          </div>

          {/* Section II: EQUIPMENTS */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#244F70] dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
              II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
            </h4>
            <div className="text-xs space-y-1">
              <p><span className="font-semibold">1. Giáo viên chuẩn bị:</span> <MathText text={currentPlan.equipmentsAndMaterials.equipments.join(', ')} /></p>
              <p><span className="font-semibold">2. Học sinh chuẩn bị:</span> <MathText text={currentPlan.equipmentsAndMaterials.materials.join(', ')} /></p>
            </div>
          </div>

          {/* Section III: ACTIVITIES */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm text-[#244F70] dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
              III. TIẾN TRÌNH DẠY HỌC
            </h4>

            {currentPlan.activities.map((act, idx) => (
              <div key={act.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h5 className="font-bold text-sm text-[#244F70] dark:text-blue-300 uppercase">
                    HOẠT ĐỘNG {idx + 1}: <MathText text={act.name} /> ({act.duration})
                  </h5>
                </div>

                {layoutFormat === 'three_column' ? (
                  /* 3-Column Table Format */
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#244F70] text-white font-bold text-center">
                          <th className="p-2.5 w-[35%] border-r border-[#193B55]">HOẠT ĐỘNG CỦA GIÁO VIÊN</th>
                          <th className="p-2.5 w-[35%] border-r border-[#193B55]">HOẠT ĐỘNG CỦA HỌC SINH</th>
                          <th className="p-2.5 w-[30%]">NỘI DUNG &amp; SẢN PHẨM CẦN ĐẠT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700"><span className="font-semibold text-blue-900 dark:text-blue-300">a) Mục tiêu:</span> <MathText text={act.objective} /></td>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700"><span className="font-semibold text-teal-800 dark:text-teal-300">b) Nội dung:</span> <MathText text={act.content} /></td>
                          <td className="p-2.5 font-medium"><span className="font-semibold text-amber-800 dark:text-amber-300">c) Sản phẩm:</span> <MathText text={act.product} /></td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-[#244F70] dark:text-blue-400">1. Chuyển giao nhiệm vụ:</p>
                            <div className="mt-1"><MathText text={act.implementation.transfer} /></div>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            HS chú ý lắng nghe, nhận nhiệm vụ và chuẩn bị phương tiện/dụng cụ học tập.
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            100% Học sinh nắm vững yêu cầu nhiệm vụ.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-teal-700 dark:text-teal-400">2. Theo dõi &amp; Hỗ trợ:</p>
                            <p className="mt-1">GV quan sát, theo dõi các nhóm, hỗ trợ kịp thời khi học sinh gặp vướng mắc.</p>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-teal-700 dark:text-teal-400">2. Thực hiện nhiệm vụ:</p>
                            <div className="mt-1"><MathText text={act.implementation.execution} /></div>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            Kết quả/Sản phẩm thảo luận sơ bộ của nhóm/cá nhân.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-amber-700 dark:text-amber-400">3. Điều hành báo cáo:</p>
                            <p className="mt-1">GV chỉ định đại diện nhóm trình bày, tổ chức thảo luận, phản biện.</p>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-amber-700 dark:text-amber-400">3. Báo cáo, thảo luận:</p>
                            <div className="mt-1"><MathText text={act.implementation.reporting} /></div>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            Bài làm/Sản phẩm hoàn chỉnh + Ý kiến đóng góp từ các nhóm.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-purple-700 dark:text-purple-400">4. Kết luận, nhận định:</p>
                            <div className="mt-1"><MathText text={act.implementation.conclusion} /></div>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            HS lắng nghe GV tổng kết, tự đánh giá và chốt kiến thức cốt lõi.
                          </td>
                          <td className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 font-medium text-amber-900 dark:text-amber-200">
                            <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Nội dung ghi vở cốt lõi:</p>
                            <MathText text={act.product} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : layoutFormat === 'two_column' ? (
                  /* 2-Column Table Format */
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#244F70] text-white font-bold text-center">
                          <th className="p-2.5 w-1/2 border-r border-[#193B55]">TIẾN TRÌNH HOẠT ĐỘNG CỦA GV VÀ HS</th>
                          <th className="p-2.5 w-1/2">SẢN PHẨM DỰ KIẾN &amp; NỘI DUNG HỌC TẬP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700"><span className="font-semibold text-blue-900 dark:text-blue-300">a) Mục tiêu:</span> <MathText text={act.objective} /></td>
                          <td className="p-2.5"><span className="font-semibold text-teal-800 dark:text-teal-300">b) Nội dung chung:</span> <MathText text={act.content} /></td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-[#244F70] dark:text-blue-400">Bước 1: Chuyển giao nhiệm vụ</p>
                            <div className="mt-1"><MathText text={act.implementation.transfer} /></div>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            HS tiếp nhận nhiệm vụ, đọc kĩ yêu cầu và sẵn sàng thực hiện.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-teal-700 dark:text-teal-400">Bước 2: Thực hiện nhiệm vụ</p>
                            <div className="mt-1"><MathText text={act.implementation.execution} /></div>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            Kết quả thảo luận nhóm, đáp án sơ bộ trên phiếu học tập.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-amber-700 dark:text-amber-400">Bước 3: Báo cáo, thảo luận</p>
                            <div className="mt-1"><MathText text={act.implementation.reporting} /></div>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">
                            Bản trình chiếu, bảng phụ hoặc bài trả lời thảo luận hoàn chỉnh.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <p className="font-bold text-purple-700 dark:text-purple-400">Bước 4: Kết luận, nhận định</p>
                            <div className="mt-1"><MathText text={act.implementation.conclusion} /></div>
                          </td>
                          <td className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 font-medium text-amber-900 dark:text-amber-200">
                            <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Sản phẩm cốt lõi ghi vở:</p>
                            <MathText text={act.product} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Standard CV 5512 Sequential Format */
                  <>
                    <p><span className="font-semibold">a) Mục tiêu:</span> <MathText text={act.objective} /></p>
                    <p><span className="font-semibold">b) Nội dung:</span> <MathText text={act.content} /></p>
                    <p><span className="font-semibold">c) Sản phẩm:</span> <MathText text={act.product} /></p>

                    <div className="space-y-2 pt-1">
                      <p className="font-semibold text-slate-900 dark:text-white">d) Tổ chức thực hiện (GV &amp; HS):</p>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                              <th className="p-2.5 w-1/3">Tiến trình thực hiện</th>
                              <th className="p-2.5 w-2/3">Nội dung chi tiết</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            <tr>
                              <td className="p-2.5 font-semibold bg-slate-50 dark:bg-slate-800/60">Bước 1: Chuyển giao nhiệm vụ</td>
                              <td className="p-2.5"><MathText text={act.implementation.transfer} /></td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-semibold bg-slate-50 dark:bg-slate-800/60">Bước 2: Thực hiện nhiệm vụ</td>
                              <td className="p-2.5"><MathText text={act.implementation.execution} /></td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-semibold bg-slate-50 dark:bg-slate-800/60">Bước 3: Báo cáo, thảo luận</td>
                              <td className="p-2.5"><MathText text={act.implementation.reporting} /></td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-semibold bg-slate-50 dark:bg-slate-800/60">Bước 4: Kết luận, nhận định</td>
                              <td className="p-2.5"><MathText text={act.implementation.conclusion} /></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EDIT DIRECTLY */}
      {activeTab === 'edit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
                Chỉnh Sửa Thông Tin Đơn Vị &amp; Nội Dung Giáo Án
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chỉnh sửa trực tiếp tên trường, họ tên giáo viên, tổ chuyên môn và chi tiết bài học.
              </p>
            </div>

            {currentUser && (
              <button
                type="button"
                onClick={handleApplyCurrentUser}
                className="bg-[#244F70] hover:bg-[#193B55] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Đồng bộ tên GV: {currentUser.name} ({currentUser.school})
              </button>
            )}
          </div>

          {/* Section: Unit & Teacher Metadata */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-4">
            <h3 className="text-xs font-bold text-[#244F70] dark:text-blue-300 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Thông Tin Đơn Vị Dạy Học &amp; Giáo Viên Soạn Bài
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Trường / Đơn Vị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentPlan.info.schoolName || ''}
                  onChange={(e) => {
                    const updated = {
                      ...currentPlan,
                      info: { ...currentPlan.info, schoolName: e.target.value },
                    };
                    setCurrentPlan(updated);
                    onSavePlan(updated);
                  }}
                  placeholder="Ví dụ: Trường THCS Nguyễn Du"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tổ Chuyên Môn
                </label>
                <input
                  type="text"
                  value={currentPlan.info.departmentName || ''}
                  onChange={(e) => {
                    const updated = {
                      ...currentPlan,
                      info: { ...currentPlan.info, departmentName: e.target.value },
                    };
                    setCurrentPlan(updated);
                    onSavePlan(updated);
                  }}
                  placeholder="Ví dụ: Tổ Toán - Tự Nhiên"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ &amp; Tên Giáo Viên Soạn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentPlan.info.teacherName || ''}
                  onChange={(e) => {
                    const updated = {
                      ...currentPlan,
                      info: { ...currentPlan.info, teacherName: e.target.value },
                    };
                    setCurrentPlan(updated);
                    onSavePlan(updated);
                  }}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lớp Giảng Dạy
                </label>
                <input
                  type="text"
                  value={currentPlan.info.classGroup || ''}
                  onChange={(e) => {
                    const updated = {
                      ...currentPlan,
                      info: { ...currentPlan.info, classGroup: e.target.value },
                    };
                    setCurrentPlan(updated);
                    onSavePlan(updated);
                  }}
                  placeholder="Ví dụ: Lớp 7A1"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày Dạy
                </label>
                <input
                  type="date"
                  value={currentPlan.info.date || ''}
                  onChange={(e) => {
                    const updated = {
                      ...currentPlan,
                      info: { ...currentPlan.info, date: e.target.value },
                    };
                    setCurrentPlan(updated);
                    onSavePlan(updated);
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiết Phân Phối Chương Trình
                </label>
                <input
                  type="text"
                  value={currentPlan.info.periodNumber || ''}
                  onChange={(e) => {
                    const updated = {
                      ...currentPlan,
                      info: { ...currentPlan.info, periodNumber: e.target.value },
                    };
                    setCurrentPlan(updated);
                    onSavePlan(updated);
                  }}
                  placeholder="Ví dụ: Tiết 28"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>
            </div>
          </div>

          {/* Section: Lesson Title & Topic */}
          <div className="space-y-4 text-xs">
            <h3 className="text-xs font-bold text-[#244F70] dark:text-blue-300 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Tên Bài Học &amp; Chủ Đề
            </h3>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên Bài Học / Tiêu Đề Bài Dạy
              </label>
              <input
                type="text"
                value={currentPlan.info.lessonTitle}
                onChange={(e) => {
                  const updated = {
                    ...currentPlan,
                    info: { ...currentPlan.info, lessonTitle: e.target.value },
                  };
                  setCurrentPlan(updated);
                  onSavePlan(updated);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chương / Chủ Đề Trong Chương Trình
              </label>
              <input
                type="text"
                value={currentPlan.info.topic}
                onChange={(e) => {
                  const updated = {
                    ...currentPlan,
                    info: { ...currentPlan.info, topic: e.target.value },
                  };
                  setCurrentPlan(updated);
                  onSavePlan(updated);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 saas-card-shadow flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
                Quản Lý 5 Hoạt Động Bài Dạy Theo CV 5512
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tinh chỉnh, phân bổ hoặc yêu cầu AI tối ưu nội dung từng hoạt động.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {currentPlan.activities.map((act, index) => (
              <div key={act.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 saas-card-shadow space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-bold text-xs text-[#244F70] dark:text-blue-300 uppercase tracking-wide">
                    Hoạt động {index + 1}: {act.name} ({act.duration})
                  </span>
                  <button
                    onClick={() => setRefiningActivityId(refiningActivityId === act.id ? null : act.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#244F70] dark:text-blue-400 bg-[#EAF3F8] dark:bg-[#244F70]/30 px-3 py-1.5 rounded-xl border border-[#244F70]/20 hover:bg-[#244F70] hover:text-white transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> AI Tinh Chỉnh Hoạt Động
                  </button>
                </div>

                {refiningActivityId === act.id && (
                  <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3.5 space-y-2 animate-fadeIn">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Nhập yêu cầu tinh chỉnh bằng AI cho hoạt động này:
                    </p>
                    <input
                      type="text"
                      value={refineInstruction}
                      onChange={(e) => setRefineInstruction(e.target.value)}
                      placeholder="Ví dụ: Lồng ghép trò chơi Kahoot, bổ sung thêm ví dụ thực tế..."
                      className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRefiningActivityId(null)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleRefineActivity(act)}
                        disabled={isRefining}
                        className="bg-[#244F70] hover:bg-[#193B55] text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5"
                      >
                        {isRefining ? 'Đang tinh chỉnh...' : 'Xác Nhận Refine'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">a) Mục tiêu:</label>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">{act.objective}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">b) Nội dung:</label>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">{act.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MATERIALS */}
      {activeTab === 'materials' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
                Phiếu Học Tập &amp; Ngân Hàng Quiz Trắc Nghiệm 4 Mức Độ
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sinh tự động Phiếu học tập, Trắc nghiệm 4 cấp độ tư duy (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao).
              </p>
            </div>
            <button
              onClick={handleGenerateMaterials}
              disabled={isGeneratingMaterials}
              className="bg-[#244F70] hover:bg-[#193B55] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
            >
              <Wand2 className="w-4 h-4" /> {isGeneratingMaterials ? 'Đang tạo bằng AI...' : 'Tạo Học Liệu Mới'}
            </button>
          </div>

          {currentPlan.supplementaryMaterials?.quizQuestions && currentPlan.supplementaryMaterials.quizQuestions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-bold text-xs text-[#244F70] dark:text-blue-300 uppercase tracking-wide">
                Bộ Câu Hỏi Trắc Nghiệm Tự Động ({currentPlan.supplementaryMaterials.quizQuestions.length} câu)
              </h3>
              <div className="space-y-3">
                {currentPlan.supplementaryMaterials.quizQuestions.map((q, i) => (
                  <div key={q.id || i} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Câu {i + 1}: <MathText text={q.question} />
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        {q.level}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-1.5 rounded-lg border text-[11px] ${
                            optIdx === q.correctAnswer
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. <MathText text={opt} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
              <Sparkles className="w-8 h-8 text-[#244F70] mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Chưa có Bộ Quiz &amp; Phiếu Học Tập bổ trợ cho bài dạy này.
              </p>
              <button
                onClick={handleGenerateMaterials}
                disabled={isGeneratingMaterials}
                className="bg-[#244F70] hover:bg-[#193B55] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" /> Bấm Để AI Sinh Học Liệu
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: NOTEBOOKLM & SLIDES */}
      {activeTab === 'notebooklm' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
                Prompt Xuất NotebookLM &amp; Khung Trình Chiếu PowerPoint
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sao chép Prompt chuẩn hóa để nạp vào NotebookLM tạo Audio Podcast hoặc xuất Bài giảng Slide.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyNotebookLMPrompt}
                className="bg-[#244F70] hover:bg-[#193B55] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> {copiedNotebookLMPrompt ? 'Đã Chép Prompt!' : 'Sao Chép Prompt NotebookLM'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[400px] leading-relaxed select-all">
            <pre className="whitespace-pre-wrap">{notebookLMPromptText}</pre>
          </div>
        </div>
      )}

      {/* TAB 6: ASSESSMENT */}
      {activeTab === 'assessment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
              Bảng Rubric Đánh Giá Theo Thông Tư 22 / 27
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hình thức đánh giá thường xuyên &amp; tiêu chí Rubrics 4 mức độ tiêu chuẩn.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">Phương thức đánh giá:</p>
            <p className="text-slate-600 dark:text-slate-400">{currentPlan.assessment.type}</p>
            <p className="text-slate-600 dark:text-slate-400 pt-1">{currentPlan.assessment.details}</p>
          </div>

          {currentPlan.assessment.rubrics && currentPlan.assessment.rubrics.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#244F70] text-white font-bold">
                    <th className="p-2.5 w-1/5 border-r border-[#193B55]">Tiêu chí</th>
                    <th className="p-2.5 w-1/5 border-r border-[#193B55]">Mức 1 (Cần cố gắng)</th>
                    <th className="p-2.5 w-1/5 border-r border-[#193B55]">Mức 2 (Đạt)</th>
                    <th className="p-2.5 w-1/5 border-r border-[#193B55]">Mức 3 (Tốt)</th>
                    <th className="p-2.5 w-1/5">Mức 4 (Xuất sắc)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                  {currentPlan.assessment.rubrics.map((r, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-bold border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">{r.criteria}</td>
                      <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">{r.level1}</td>
                      <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">{r.level2}</td>
                      <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">{r.level3}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400 bg-emerald-50/30 dark:bg-emerald-950/20 font-medium">{r.level4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
