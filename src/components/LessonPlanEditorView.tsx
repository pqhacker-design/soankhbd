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
      <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span className="bg-[#2A4D69]/10 dark:bg-stone-800 text-[#2A4D69] dark:text-amber-400 px-2 py-0.5 rounded-md">
              {currentPlan.subject} - {currentPlan.grade}
            </span>
            <span>•</span>
            <span>{currentPlan.textbook}</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 dark:text-white mt-1">
            {currentPlan.info.lessonTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportLessonPlanToDocx(currentPlan)}
            className="flex items-center gap-1.5 bg-[#2A4D69] hover:bg-[#1f3b52] text-white font-bold text-xs px-3.5 py-2.5 rounded-lg shadow-sm transition-all active:scale-95"
            title="Tải file Microsoft Word (.docx)"
          >
            <Download className="w-4 h-4" /> Tải Word (.docx)
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 bg-[#F5F3EE] dark:bg-stone-800 hover:bg-[#ECE8E1] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs px-3.5 py-2.5 rounded-lg transition-colors border border-[#E7E5E0] dark:border-stone-700"
            title="Sao chép toàn bộ văn bản giáo án"
          >
            <Copy className="w-4 h-4" /> {copied ? 'Đã chép!' : 'Sao chép'}
          </button>

          <button
            onClick={() => onSavePlan(currentPlan)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
            title="Lưu lại các chỉnh sửa vào hệ thống"
          >
            <Save className="w-4 h-4" /> Lưu lại
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E5E0] dark:border-stone-800 overflow-x-auto pb-2">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#2A4D69] text-white shadow-xs font-serif font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-[#F5F3EE] dark:hover:bg-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Layout Format Switcher Bar */}
      <div className="bg-[#F5F3EE] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-[#2A4D69] dark:text-amber-400">
            Hình thức trình bày giáo án:
          </span>
          <span className="text-stone-500 text-[11px] hidden sm:inline">
            (Thay đổi định dạng hiển thị &amp; khi xuất file Word .docx)
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 p-1 rounded-lg border border-[#E7E5E0] dark:border-stone-700">
          {[
            { id: 'standard', label: '1. Tiêu Chuẩn (CV 5512)' },
            { id: 'two_column', label: '2. Dạng Bảng 2 Cột' },
            { id: 'three_column', label: '3. Dạng Bảng 3 Cột' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => handleLayoutFormatChange(fmt.id as any)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                layoutFormat === fmt.id
                  ? 'bg-[#2A4D69] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-[#F5F3EE] dark:hover:bg-stone-700'
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
          className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 sm:p-10 shadow-sm space-y-8 text-stone-800 dark:text-stone-200 font-serif leading-relaxed"
        >
          {/* Header Metadata Table */}
          <div className="border-b border-stone-300 dark:border-stone-700 pb-4 grid grid-cols-2 text-xs font-sans">
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
          <div className="text-center space-y-1 font-sans">
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-[#2A4D69] dark:text-amber-400 tracking-tight">
              KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
            </h2>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-white uppercase">
              BÀI: <MathText text={currentPlan.info.lessonTitle} />
            </h3>
            <p className="text-xs italic text-slate-500 dark:text-slate-400">
              Môn: {currentPlan.subject} - {currentPlan.grade} ({currentPlan.textbook}) | Tiết: {currentPlan.info.periodNumber} ({currentPlan.info.duration})
            </p>
          </div>

          {/* Section I: OBJECTIVES */}
          <div className="space-y-3 font-sans">
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
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
          <div className="space-y-3 font-sans">
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
              II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
            </h4>
            <div className="text-xs space-y-1">
              <p><span className="font-semibold">1. Giáo viên chuẩn bị:</span> <MathText text={currentPlan.equipmentsAndMaterials.equipments.join(', ')} /></p>
              <p><span className="font-semibold">2. Học sinh chuẩn bị:</span> <MathText text={currentPlan.equipmentsAndMaterials.materials.join(', ')} /></p>
            </div>
          </div>

          {/* Section III: ACTIVITIES */}
          <div className="space-y-6 font-sans">
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
              III. TIẾN TRÌNH DẠY HỌC
            </h4>

            {currentPlan.activities.map((act, idx) => (
              <div key={act.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h5 className="font-bold text-sm text-teal-700 dark:text-teal-400 uppercase">
                    HOẠT ĐỘNG {idx + 1}: <MathText text={act.name} /> ({act.duration})
                  </h5>
                </div>

                {layoutFormat === 'three_column' ? (
                  /* 3-Column Table Format */
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-3">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#2A4D69] text-white font-bold text-center">
                          <th className="p-2.5 w-[35%] border-r border-blue-800">HOẠT ĐỘNG CỦA GIÁO VIÊN</th>
                          <th className="p-2.5 w-[35%] border-r border-blue-800">HOẠT ĐỘNG CỦA HỌC SINH</th>
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
                            <p className="font-bold text-blue-700 dark:text-blue-400">1. Chuyển giao nhiệm vụ:</p>
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
                        <tr className="bg-[#2A4D69] text-white font-bold text-center">
                          <th className="p-2.5 w-1/2 border-r border-blue-800">TIẾN TRÌNH HOẠT ĐỘNG CỦA GV VÀ HS</th>
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
                            <p className="font-bold text-blue-700 dark:text-blue-400">Bước 1: Chuyển giao nhiệm vụ</p>
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

          {/* Section IV: DIFFERENTIATION & ASSESSMENT */}
          <div className="space-y-3 font-sans">
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 uppercase border-b border-slate-200 dark:border-slate-800 pb-1">
              IV. HƯỚNG DẪN ĐÁNH GIÁ &amp; PHÂN HÓA DẠY HỌC
            </h4>
            <div className="text-xs space-y-2">
              <p><span className="font-semibold">Phân hóa học sinh yếu/cần hỗ trợ:</span> {currentPlan.differentiation.weakSupport}</p>
              <p><span className="font-semibold">Phân hóa học sinh khá/giỏi:</span> {currentPlan.differentiation.advancedSupport}</p>
              <p><span className="font-semibold">Phương pháp đánh giá:</span> {currentPlan.assessment.type} ({currentPlan.assessment.details})</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INLINE EDIT */}
      {activeTab === 'edit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            Chỉnh Sửa Trực Tiếp Giáo Án
          </h3>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
              1. Thông tin Đơn vị, Giáo viên &amp; Bài dạy
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Trường / Đơn Vị
                </label>
                <input
                  type="text"
                  value={currentPlan.info.schoolName || ''}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, schoolName: e.target.value },
                    })
                  }
                  placeholder="Trường THCS Nguyễn Du..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ &amp; Tên Giáo Viên
                </label>
                <input
                  type="text"
                  value={currentPlan.info.teacherName || ''}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, teacherName: e.target.value },
                    })
                  }
                  placeholder="Nguyễn Văn An..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tổ Bộ Môn / Tổ Chuyên Môn
                </label>
                <input
                  type="text"
                  value={currentPlan.info.departmentName || ''}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, departmentName: e.target.value },
                    })
                  }
                  placeholder="Tổ Toán - Tự Nhiên..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Bài Học
                </label>
                <input
                  type="text"
                  value={currentPlan.info.lessonTitle}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, lessonTitle: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chủ Đề / Chương
                </label>
                <input
                  type="text"
                  value={currentPlan.info.topic || ''}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, topic: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lớp Dạy
                </label>
                <input
                  type="text"
                  value={currentPlan.info.classGroup}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, classGroup: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày Dạy
                </label>
                <input
                  type="date"
                  value={currentPlan.info.date}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, date: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiết Số
                </label>
                <input
                  type="text"
                  value={currentPlan.info.periodNumber}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, periodNumber: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thời Lượng
                </label>
                <input
                  type="text"
                  value={currentPlan.info.duration}
                  onChange={(e) =>
                    setCurrentPlan({
                      ...currentPlan,
                      info: { ...currentPlan.info, duration: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hỗ Trợ Phân Hóa Học Sinh Yếu
            </label>
            <textarea
              rows={2}
              value={currentPlan.differentiation.weakSupport}
              onChange={(e) =>
                setCurrentPlan({
                  ...currentPlan,
                  differentiation: {
                    ...currentPlan.differentiation,
                    weakSupport: e.target.value,
                  },
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
            />
          </div>

          <button
            onClick={() => {
              onSavePlan(currentPlan);
              alert('Đã lưu thay đổi giáo án thành công!');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            Lưu Thay Đổi
          </button>
        </div>
      )}

      {/* TAB 3: ACTIVITIES MANAGEMENT & AI REFINEMENT */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Chi Tiết 5 Hoạt Động Bài Dạy (CV 5512)
            </h3>
            <span className="text-xs text-slate-500">Bấm "AI Nâng Cấp" để tinh chỉnh riêng từng hoạt động</span>
          </div>

          {currentPlan.activities.map((act, idx) => (
            <div
              key={act.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  {act.name} ({act.duration})
                </h4>

                <button
                  onClick={() => setRefiningActivityId(refiningActivityId === act.id ? null : act.id)}
                  className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Nâng Cấp Hoạt Động
                </button>
              </div>

              {/* Refinement input drawer */}
              {refiningActivityId === act.id && (
                <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <label className="block text-xs font-bold text-blue-900 dark:text-blue-300">
                    Nhập Yêu Cầu AI Tinh Chỉnh (Ví dụ: Thêm tính tương tác STEM, bổ sung câu hỏi phân hóa...)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refineInstruction}
                      onChange={(e) => setRefineInstruction(e.target.value)}
                      placeholder="Ví dụ: Tăng cường hoạt động trải nghiệm thực hành..."
                      className="flex-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleRefineActivity(act)}
                      disabled={isRefining}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      Thực Hiện AI
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Mục tiêu:</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{act.objective}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Sản phẩm:</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{act.product}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Tổ chức thực hiện:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-blue-600">a) Chuyển giao:</span> {act.implementation.transfer}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-teal-600">b) Thực hiện:</span> {act.implementation.execution}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-amber-600">c) Báo cáo:</span> {act.implementation.reporting}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-purple-600">d) Kết luận:</span> {act.implementation.conclusion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SUPPLEMENTARY MATERIALS & QUIZZES */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#2A4D69]" />
                Ngân Hàng Học Liệu & Bộ Câu Hỏi Quiz Trắc Nghiệm Củng Cố
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Tất cả Phiếu học tập và Bộ câu hỏi Quiz ở đây được <strong className="text-stone-700 dark:text-stone-300">tự động xuất vào file Word (.docx)</strong> dưới dạng Phụ mục V.
              </p>
            </div>

            <button
              onClick={handleGenerateMaterials}
              disabled={isGeneratingMaterials}
              className="bg-[#2A4D69] hover:bg-[#1f3b52] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap self-start md:self-auto disabled:opacity-50"
            >
              {isGeneratingMaterials ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Wand2 className="w-4 h-4 text-amber-400" />
              )}
              AI Tự Động Sinh Quiz & Học Liệu
            </button>
          </div>

          {/* Worksheets */}
          <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white border-b border-[#E7E5E0] dark:border-stone-800 pb-2 flex items-center justify-between">
              <span>1. PHIẾU HỌC TẬP (WORKSHEET) DÀNH CHO HỌC SINH</span>
              <span className="text-xs font-normal text-stone-500">Mẫu in trực tiếp hoặc xuất Word</span>
            </h4>

            {((currentPlan.supplementaryMaterials?.worksheets && currentPlan.supplementaryMaterials.worksheets.length > 0)
              ? currentPlan.supplementaryMaterials.worksheets
              : [
                  {
                    id: 'ws-default',
                    title: `PHIẾU HỌC TẬP KHÁM PHÁ & THỰC HÀNH: BÀI ${currentPlan.info.lessonTitle.toUpperCase()}`,
                    instructions: 'Học sinh đọc kỹ nội dung bài học, thảo luận nhóm và hoàn thành các câu hỏi dưới đây trong 10-15 phút.',
                    questions: [
                      { id: 'q1', number: 1, text: `Nêu các khái niệm / nội dung trọng tâm trong bài ${currentPlan.info.lessonTitle}.`, spaceForAnswer: '(Dành 5 dòng trống cho học sinh trình bày ý kiến...)' },
                      { id: 'q2', number: 2, text: 'Phân tích ví dụ thực tế liên quan và rút ra kết luận cốt lõi.', spaceForAnswer: '(Dành 5 dòng trống cho học sinh trình bày ý kiến...)' },
                      { id: 'q3', number: 3, text: 'Liên hệ bản thân / Giải quyết tình huống vận dụng thực tiễn.', spaceForAnswer: '(Dành 5 dòng trống cho học sinh trình bày ý kiến...)' },
                    ],
                  },
                ]
            ).map((ws) => (
              <div key={ws.id} className="p-5 rounded-xl bg-[#F5F3EE] dark:bg-stone-800/60 border border-[#E7E5E0] dark:border-stone-700 space-y-3 text-xs">
                <h5 className="font-bold text-sm text-[#2A4D69] dark:text-amber-400"><MathText text={ws.title} /></h5>
                <p className="text-stone-600 dark:text-stone-300 italic">Hướng dẫn: <MathText text={ws.instructions} /></p>
                <div className="space-y-3 pt-2">
                  {ws.questions.map((q) => (
                    <div key={q.id} className="space-y-1.5 bg-white dark:bg-stone-900 p-3 rounded-lg border border-[#E7E5E0] dark:border-stone-700">
                      <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-start gap-1">
                        <span>Câu {q.number}:</span>
                        <MathText text={q.text} />
                      </div>
                      <div className="p-3 bg-[#FDFCFB] dark:bg-stone-800 rounded-md border border-dashed border-stone-300 dark:border-stone-700 text-stone-400 italic">
                        <MathText text={q.spaceForAnswer || '(Học sinh ghi câu trả lời vào đây...)'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quiz Bank */}
          <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E5E0] dark:border-stone-800 pb-2">
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                2. NGÂN HÀNG CÂU HỎI QUIZ TRẮC NGHIỆM CỦNG CỐ (MA TRẬN 4 MỨC ĐỘ)
              </h4>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-medium">Nhận biết</span>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded font-medium">Thông hiểu</span>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded font-medium">Vận dụng</span>
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded font-medium">Vận dụng cao</span>
              </div>
            </div>

            <div className="space-y-4">
              {((currentPlan.supplementaryMaterials?.quizQuestions && currentPlan.supplementaryMaterials.quizQuestions.length > 0)
                ? currentPlan.supplementaryMaterials.quizQuestions
                : [
                    {
                      id: 'q-1',
                      question: `Nội dung cốt lõi nào thể hiện đúng nhất trọng tâm của bài ${currentPlan.info.lessonTitle}?`,
                      options: [
                        `Khái niệm và nguyên lý cơ bản của bài ${currentPlan.info.lessonTitle}`,
                        'Phương pháp thực hành truyền thống cũ',
                        'Lý thuyết suông không ứng dụng',
                        'Nội dung tham khảo ngoài chương trình'
                      ],
                      correctAnswer: 0,
                      explanation: `Đáp án A đúng vì đây là kiến thức cơ bản cốt lõi cần đạt theo chuẩn GDPT 2018 môn ${currentPlan.subject}.`,
                      level: 'Nhận biết' as const,
                    },
                    {
                      id: 'q-2',
                      question: `Ý nghĩa quan trọng nhất của bài học đối với thực tiễn đời sống là gì?`,
                      options: [
                        'Tăng thêm thời gian ghi chép lý thuyết',
                        'Giúp học sinh vận dụng kiến thức vào giải quyết vấn đề đời sống',
                        'Chỉ phục vụ cho kiểm tra điểm số',
                        'Không có ứng dụng trực tiếp'
                      ],
                      correctAnswer: 1,
                      explanation: 'Đáp án B đúng vì mục tiêu phát triển năng lực trọng tâm là liên hệ thực tiễn.',
                      level: 'Thông hiểu' as const,
                    },
                    {
                      id: 'q-3',
                      question: `Cách xử lý nào thể hiện tốt nhất năng lực giải quyết vấn đề khi thực hiện bài tập?`,
                      options: [
                        'Bỏ qua bài tập khó',
                        'Phân tích nguyên nhân, lập kế hoạch và áp dụng kiến thức đã học',
                        'Chờ giáo viên chữa bài mẫu',
                        'Sao chép kết quả của nhóm bạn'
                      ],
                      correctAnswer: 1,
                      explanation: 'Đáp án B thể hiện đầy đủ các bước phát triển năng lực giải quyết vấn đề.',
                      level: 'Vận dụng' as const,
                    },
                    {
                      id: 'q-4',
                      question: `Đề xuất giải pháp đổi mới sáng tạo để áp dụng hiệu quả nội dung bài học vào thực tế:`,
                      options: [
                        'Áp dụng công nghệ số và mô hình trải nghiệm thực tế tại địa phương',
                        'Giữ nguyên phương pháp học thuộc lòng cũ',
                        'Không cần kết hợp với thực tiễn đời sống',
                        'Hạn chế sự tham gia chủ động của học sinh'
                      ],
                      correctAnswer: 0,
                      explanation: 'Đáp án A thể hiện tinh thần vận dụng cao và định hướng giáo dục chuyển đổi số.',
                      level: 'Vận dụng cao' as const,
                    },
                  ]
              ).map((quiz, idx) => (
                <div key={quiz.id || idx} className="p-4 rounded-xl bg-[#F5F3EE] dark:bg-stone-800/60 border border-[#E7E5E0] dark:border-stone-700 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-stone-900 dark:text-white flex items-start gap-1">
                      <span>Câu {idx + 1}:</span>
                      <MathText text={quiz.question} />
                    </div>
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                      {quiz.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {quiz.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs transition-colors ${
                          optIdx === quiz.correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold shadow-2xs'
                            : 'bg-white dark:bg-stone-900 border-[#E7E5E0] dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                        <MathText text={opt} />
                        {optIdx === quiz.correctAnswer && (
                          <span className="ml-2 text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 px-1.5 py-0.2 rounded font-bold">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-[#E7E5E0] dark:border-stone-700 text-[11px] text-stone-600 dark:text-stone-300 mt-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Lời giải chi tiết &amp; Căn cứ sư phạm:</span> <MathText text={quiz.explanation} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NOTEBOOKLM PROMPT & POWERPOINT SLIDES */}
      {activeTab === 'notebooklm' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-[#2A4D69] text-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md text-xs text-amber-300 font-medium">
                  <BrainCircuit className="w-4 h-4" /> Công Cụ Tạo Prompt NotebookLM (Google AI)
                </div>
                <h3 className="text-xl font-serif font-bold text-white">
                  Tạo Slide PowerPoint & Bài Giảng Bằng Prompt NotebookLM
                </h3>
                <p className="text-xs text-stone-200 max-w-2xl leading-relaxed">
                  Giáo án được đóng gói thành Prompt chuyên sâu dành riêng cho NotebookLM (notebooklm.google.com). Sao chép Prompt bên dưới dán vào NotebookLM để tự động tạo Slide PowerPoint, Audio Overview (Podcast bài giảng) và Sơ đồ tư duy!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyNotebookLMPrompt}
                  className="bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  {copiedNotebookLMPrompt ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-900" /> Đã Sao Chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Sao Chép Prompt NotebookLM
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadNotebookLMPromptText}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2.5 rounded-lg border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Tải File (.txt)
                </button>

                <a
                  href="https://notebooklm.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white text-[#2A4D69] hover:bg-stone-100 font-bold text-xs px-3.5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> Mở NotebookLM
                </a>
              </div>
            </div>

            {/* Step by step guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-4 text-xs text-stone-200">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <p>Bấm nút <strong className="text-amber-300">"Sao chép Prompt NotebookLM"</strong> ở trên.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <p>Truy cập <strong className="text-white">notebooklm.google.com</strong> và tạo Sổ tay mới.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <p>Dán Prompt làm Nguồn (Source) hoặc Chat prompt để tự động sinh Slide & Audio!</p>
              </div>
            </div>
          </div>

          {/* Prompt Toggle Switch */}
          <div className="flex items-center justify-between bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 p-2 rounded-xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setNotebookLMViewMode('prompt')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  notebookLMViewMode === 'prompt'
                    ? 'bg-[#2A4D69] text-white font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-[#F5F3EE] dark:hover:bg-stone-800'
                }`}
              >
                <FileCode className="w-4 h-4" /> Prompt NotebookLM (Dạng Văn Bản)
              </button>

              <button
                onClick={() => setNotebookLMViewMode('slides')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  notebookLMViewMode === 'slides'
                    ? 'bg-[#2A4D69] text-white font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-[#F5F3EE] dark:hover:bg-stone-800'
                }`}
              >
                <Presentation className="w-4 h-4" /> Dàn Ý Slide Trực Quan ({currentPlan.supplementaryMaterials?.pptSlides?.length || 3} Slides)
              </button>
            </div>

            <button
              onClick={handleGenerateMaterials}
              disabled={isGeneratingMaterials}
              className="text-xs text-[#2A4D69] dark:text-amber-400 font-bold flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#F5F3EE] dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Tạo Lại Dàn Ý Slide
            </button>
          </div>

          {/* VIEW MODE 1: PROMPT TEXT */}
          {notebookLMViewMode === 'prompt' && (
            <div className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E5E0] dark:border-stone-800 pb-3">
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2A4D69]" />
                  Bản Prompt NotebookLM Tự Động Sinh Từ Giáo Án
                </h4>
                {copiedNotebookLMPrompt && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                    <Check className="w-3.5 h-3.5" /> Đã sao chép vào bộ nhớ tạm!
                  </span>
                )}
              </div>

              <div className="relative">
                <pre className="bg-[#F5F3EE] dark:bg-stone-950 p-5 rounded-xl border border-[#E7E5E0] dark:border-stone-800 text-xs font-mono text-stone-800 dark:text-stone-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                  {notebookLMPromptText}
                </pre>

                <button
                  onClick={handleCopyNotebookLMPrompt}
                  className="absolute top-3 right-3 bg-[#2A4D69] hover:bg-[#1f3b52] text-white p-2 rounded-lg shadow-sm transition-all"
                  title="Sao chép Prompt"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: VISUAL SLIDES */}
          {notebookLMViewMode === 'slides' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {((currentPlan.supplementaryMaterials?.pptSlides && currentPlan.supplementaryMaterials.pptSlides.length > 0)
                ? currentPlan.supplementaryMaterials.pptSlides
                : [
                    {
                      slideNumber: 1,
                      title: `Slide 1: Trang Tiêu Đề Bài ${currentPlan.info.lessonTitle}`,
                      mainPoints: [
                        `Môn học: ${currentPlan.subject} - ${currentPlan.grade}`,
                        `Bộ sách: ${currentPlan.textbook}`,
                        `Giáo viên: ${currentPlan.info.teacherName || 'Giáo viên bộ môn'}`,
                      ],
                      visualSuggestions: 'Hình ảnh chất lượng cao minh họa chủ đề bài học, thiết kế phong cách hiện đại.',
                      speakerNotes: 'GV nhiệt liệt chào mừng học sinh, giới thiệu tổng quan mục tiêu bài học.',
                    },
                    {
                      slideNumber: 2,
                      title: 'Slide 2: Mở Đầu & Khởi Động Tương Tác',
                      mainPoints: [
                        'Câu hỏi gợi mở tạo hứng thú',
                        'Trò chơi kết nối kiến thức thực tế',
                      ],
                      visualSuggestions: 'Đồng hồ đếm ngược 3 phút và biểu tượng câu hỏi tương tác.',
                      speakerNotes: 'GV điều phối hoạt động khởi động sôi nổi, dẫn dắt vào bài mới.',
                    },
                    {
                      slideNumber: 3,
                      title: 'Slide 3: Khám Phá Kiến Thức Trọng Tâm',
                      mainPoints: [
                        'Nội dung lý thuyết cốt lõi',
                        'Ví dụ thực tế trực quan',
                      ],
                      visualSuggestions: 'Sơ đồ tư duy dạng khối phẳng, rõ ràng, màu sắc tương phản cao.',
                      speakerNotes: 'GV phân tích chi tiết, hướng dẫn học sinh thảo luận nhóm.',
                    },
                  ]
              ).map((slide) => (
                <div
                  key={slide.slideNumber}
                  className="bg-[#FDFCFB] dark:bg-stone-900 border border-[#E7E5E0] dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-3 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-[#E7E5E0] dark:border-stone-800 pb-2">
                      <span className="font-serif font-bold text-sm text-[#2A4D69] dark:text-amber-400">
                        {slide.title}
                      </span>
                      <span className="bg-[#2A4D69]/10 text-[#2A4D69] dark:bg-stone-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        Slide {slide.slideNumber}
                      </span>
                    </div>

                    <ul className="list-disc pl-4 text-stone-700 dark:text-stone-300 space-y-1">
                      {slide.mainPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E7E5E0] dark:border-stone-800 text-[11px]">
                    <p className="text-stone-500 dark:text-stone-400">
                      <strong className="text-stone-800 dark:text-stone-200">Gợi ý Visual:</strong> {slide.visualSuggestions}
                    </p>
                    <p className="p-2.5 bg-[#F5F3EE] dark:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300 italic">
                      <strong className="not-italic text-[#2A4D69] dark:text-amber-400">Speaker Notes:</strong> {slide.speakerNotes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RUBRICS */}
      {activeTab === 'assessment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Thang Đánh Giá &amp; Rubric Đánh Giá Thường Xuyên (Thông tư 22 / 27)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">Tiêu chí đánh giá</th>
                  <th className="p-3">Mức 4 (Xuất sắc)</th>
                  <th className="p-3">Mức 3 (Tốt)</th>
                  <th className="p-3">Mức 2 (Đạt)</th>
                  <th className="p-3">Mức 1 (Cần cố gắng)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(currentPlan.assessment.rubrics || []).map((rubric, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{rubric.criteria}</td>
                    <td className="p-3 text-emerald-700 dark:text-emerald-400">{rubric.level4}</td>
                    <td className="p-3 text-blue-700 dark:text-blue-400">{rubric.level3}</td>
                    <td className="p-3 text-amber-700 dark:text-amber-400">{rubric.level2}</td>
                    <td className="p-3 text-rose-700 dark:text-rose-400">{rubric.level1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
