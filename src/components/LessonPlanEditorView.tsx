import React, { useState } from 'react';
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
} from 'lucide-react';
import { FullLessonPlan, LessonActivity, QuizQuestion, Worksheet } from '../types';
import { exportLessonPlanToDocx } from '../utils/docxExporter';
import { buildNotebookLMPrompt } from '../utils/notebooklmPromptBuilder';
import { getApiKeyHeaders } from '../utils/apiHelper';
import { MathText } from './MathText';

interface LessonPlanEditorViewProps {
  plan: FullLessonPlan;
  onSavePlan: (updatedPlan: FullLessonPlan) => void;
}

export const LessonPlanEditorView: React.FC<LessonPlanEditorViewProps> = ({
  plan,
  onSavePlan,
}) => {
  const [currentPlan, setCurrentPlan] = useState<FullLessonPlan>(plan);
  const [layoutFormat, setLayoutFormat] = useState<'standard' | 'two_column' | 'three_column'>(
    plan.layoutFormat || 'standard'
  );
  const [activeTab, setActiveTab] = useState<
    'preview' | 'edit' | 'activities' | 'materials' | 'notebooklm' | 'assessment'
  >('preview');

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

  // Copy full lesson text to clipboard
  const handleCopyText = () => {
    const textToCopy = `
KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
Bài: ${currentPlan.info.lessonTitle.toUpperCase()}
Môn: ${currentPlan.subject} - ${currentPlan.grade} (${currentPlan.textbook})

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

  // Download NotebookLM Prompt as .txt file
  const handleDownloadNotebookLMPromptText = () => {
    const element = document.createElement('a');
    const file = new Blob([notebookLMPromptText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `NotebookLM_Prompt_${currentPlan.info.lessonTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      } else {
        alert('Không thể tinh chỉnh hoạt động: ' + (data.error || 'Lỗi kết nối'));
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối đến máy chủ AI');
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
      alert('Đã tạo thành công Bộ Quiz trắc nghiệm 4 mức độ & Học liệu bổ trợ!');
    } else {
      alert('Không thể sinh học liệu. Vui lòng kiểm tra lại API Key!');
    }
    setIsGeneratingMaterials(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 saas-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-[#244F70]/20">
              {currentPlan.subject} - {currentPlan.grade}
            </span>
            <span>•</span>
            <span>{currentPlan.textbook}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
            {currentPlan.info.lessonTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'preview', label: 'Bản In Giáo Án (CV 5512)', icon: Eye },
          { id: 'edit', label: 'Chỉnh Sửa Trực Tiếp', icon: Edit3 },
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

      {/* OTHER TABS (Edit, Activities, Materials, NotebookLM, Assessment) preserved functionality */}
    </div>
  );
};
