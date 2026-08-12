import React, { useState } from 'react';
import {
  FileUp,
  Sparkles,
  CheckCircle2,
  FileText,
  Download,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Info,
  Laptop,
  Leaf,
  Briefcase,
  ShieldAlert,
  MapPin,
  Cpu,
  ShieldCheck,
  Edit3,
  Copy,
} from 'lucide-react';
import mammoth from 'mammoth';
import { FullLessonPlan, UserProfile } from '../types';
import { exportLessonPlanToDocx, exportPreservedDocumentToDocx, exportHtmlToDocx } from '../utils/docxExporter';
import { getUserApiKey, getApiKeyHeaders } from '../utils/apiHelper';
import { useToast } from '../context/ToastContext';

interface LessonIntegratorViewProps {
  currentUser: UserProfile;
  onPlanGenerated: (plan: FullLessonPlan) => void;
  onOpenApiKeyModal?: () => void;
  onSelectPlanForEdit?: (plan: FullLessonPlan) => void;
}

const INTEGRATION_TOPICS = [
  {
    id: 'digital',
    label: 'Năng lực số & Chuyển đổi số',
    desc: 'Ứng dụng CNTT, phần mềm học tập, tra cứu trực tuyến & an toàn mạng (Khung NLS UNESCO/Bộ GD&ĐT)',
    icon: Laptop,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
    defaultChecked: true,
  },
  {
    id: 'environment',
    label: 'Bảo vệ Môi trường & Biến đổi khí hậu',
    desc: 'Tiết kiệm tài nguyên, phân loại rác, bảo vệ cảnh quan & ứng phó biến đổi khí hậu',
    icon: Leaf,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
    defaultChecked: true,
  },
  {
    id: 'career',
    label: 'Giáo dục Hướng nghiệp',
    desc: 'Liên hệ các ngành nghề tương lai, kỹ năng công việc & ứng dụng kiến thức bài học trong đời sống',
    icon: Briefcase,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900',
    defaultChecked: true,
  },
  {
    id: 'traffic',
    label: 'An toàn giao thông & Văn hóa giao thông',
    desc: 'Quy tắc chấp hành luật giao thông, tình huống đi lại an toàn của học sinh',
    icon: ShieldAlert,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    defaultChecked: true,
  },
  {
    id: 'local',
    label: 'Giáo dục Địa phương & Văn hóa Di sản',
    desc: 'Liên hệ thực tiễn lịch sử, danh lam thắng cảnh, văn hóa, sản vật & kinh tế địa phương',
    icon: MapPin,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
    defaultChecked: true,
  },
  {
    id: 'stem',
    label: 'Giáo dục STEM / STEAM liên môn',
    desc: 'Hoạt động trải nghiệm sáng tạo, thiết kế sản phẩm thực hành gắn liền bài học',
    icon: Cpu,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900',
    defaultChecked: false,
  },
  {
    id: 'lifeskills',
    label: 'Kỹ năng sống & An toàn trường học',
    desc: 'Rèn luyện kỹ năng tự vệ, phòng chống bạo lực, ứng phó tình huống khẩn cấp',
    icon: ShieldCheck,
    color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-900',
    defaultChecked: false,
  },
];

export const LessonIntegratorView: React.FC<LessonIntegratorViewProps> = ({
  currentUser,
  onPlanGenerated,
  onOpenApiKeyModal,
  onSelectPlanForEdit,
}) => {
  const { toast } = useToast();

  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedText, setUploadedText] = useState<string>('');
  const [uploadedHtml, setUploadedHtml] = useState<string>('');
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);

  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    INTEGRATION_TOPICS.filter((t) => t.defaultChecked).map((t) => t.label)
  );
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  const [resultPlan, setResultPlan] = useState<FullLessonPlan | null>(null);
  const [integratedFullText, setIntegratedFullText] = useState<string>('');
  const [integratedHtml, setIntegratedHtml] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [integrationSummary, setIntegrationSummary] = useState<string[]>([]);

  // Toggle selected topic
  const toggleTopic = (label: string) => {
    if (selectedTopics.includes(label)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== label));
    } else {
      setSelectedTopics([...selectedTopics, label]);
    }
  };

  // Handle file upload (.docx, .txt, .json)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsReadingFile(true);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();

        // Convert DOCX to HTML preserving tables (1-column, 2-column), bold, lists, etc.
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        const extractedHtml = htmlResult.value.trim();

        // Extract raw text as fallback
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = textResult.value.trim();

        if (extractedHtml || extractedText) {
          setUploadedHtml(extractedHtml);
          setUploadedText(extractedText);
          toast.success(`Đã đọc tệp Word "${file.name}" giữ nguyên 100% định dạng & cấu trúc bảng gốc!`);
        } else {
          toast.warning('File Word không có nội dung chữ hoặc bị trống.');
        }
      } else if (extension === 'txt' || extension === 'json') {
        const text = await file.text();
        setUploadedText(text);
        setUploadedHtml(text.split('\n').map((l) => `<p>${l}</p>`).join(''));
        toast.success(`Đã tải lên file "${file.name}" thành công!`);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setUploadedText(content || '');
          setUploadedHtml((content || '').split('\n').map((l) => `<p>${l}</p>`).join(''));
          toast.success(`Đã tải tệp "${file.name}"!`);
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      console.error('Error reading file:', err);
      toast.error('Không thể đọc file. Vui lòng đảm bảo file không bị khóa hoặc lỗi định dạng.');
    } finally {
      setIsReadingFile(false);
    }
  };

  // Call API to auto-integrate topics into lesson plan
  const handleIntegrate = async () => {
    if (!uploadedText.trim() && !uploadedHtml.trim()) {
      toast.warning('Vui lòng tải tệp giáo án Word (.docx/txt) hoặc dán nội dung giáo án sẵn có vào ô bên dưới!');
      return;
    }

    if (selectedTopics.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 nội dung cần tích hợp (Năng lực số, Môi trường, Hướng nghiệp...).');
      return;
    }

    const userApiKey = getUserApiKey(currentUser?.id);
    if (!userApiKey) {
      toast.warning('Vui lòng cấu hình Gemini API Key cá nhân để bắt đầu AI Tích Hợp Giáo Án.');
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsProcessing(true);
    setProgressStatus('Đang đọc cấu trúc giáo án & kết nối Gemini 3.6 AI...');

    const payload = {
      uploadedHtml: uploadedHtml,
      uploadedText: uploadedText,
      selectedTopics: selectedTopics,
      customInstructions: customInstructions,
      schoolName: currentUser?.school || '',
      teacherName: currentUser?.name || '',
    };

    let resultData: any = null;
    let errorMessage = '';

    try {
      setTimeout(() => {
        setProgressStatus('Đang giữ nguyên 100% mẫu giáo án gốc & chèn Năng lực số, Môi trường, Hướng nghiệp...');
      }, 1500);

      const res = await fetch('/api/integrate-lesson-plan', {
        method: 'POST',
        headers: getApiKeyHeaders(currentUser?.id),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && (data.integratedHtml || data.integratedFullText || data.lessonPlan)) {
          resultData = data;
        } else {
          errorMessage = data.error || '';
          if (data.apiKeyRequired && onOpenApiKeyModal) {
            onOpenApiKeyModal();
          }
        }
      } else {
        try {
          const data = await res.json();
          errorMessage = data.error || '';
          if (data.apiKeyRequired && onOpenApiKeyModal) {
            onOpenApiKeyModal();
          }
        } catch {
          // Non-json response
        }
      }
    } catch (serverErr) {
      console.warn('Server integrate-lesson-plan failed, attempting client fallback:', serverErr);
    }

    // Direct Client-Side Fallback using @google/genai SDK
    if (!resultData || (!resultData.integratedHtml && !resultData.integratedFullText && !resultData.lessonPlan)) {
      try {
        setProgressStatus('Đang xử lý trực tiếp qua Gemini Client AI SDK...');
        const { integrateLessonPlanDirect } = await import('../utils/clientGeminiService');
        const directResult = await integrateLessonPlanDirect(payload);
        if (directResult && (directResult.integratedHtml || directResult.integratedFullText || directResult.lessonPlan)) {
          resultData = directResult;
        } else if (directResult && typeof directResult === 'object') {
          resultData = directResult;
        }
      } catch (clientErr: any) {
        console.error('Client Gemini integration error:', clientErr);
        if (!errorMessage) {
          errorMessage = clientErr.message || 'Lỗi khi tích hợp giáo án bằng AI.';
        }
        if (clientErr.message?.includes('MISSING_API_KEY') && onOpenApiKeyModal) {
          onOpenApiKeyModal();
        }
      }
    }

    if (resultData && (resultData.integratedHtml || resultData.integratedFullText || resultData.lessonPlan)) {
      setIntegratedHtml(resultData.integratedHtml || '');
      setIntegratedFullText(resultData.integratedFullText || '');
      setDocumentTitle(resultData.documentTitle || uploadedFileName.replace(/\.[^/.]+$/, '') || 'Giáo Án Tích Hợp');
      setIntegrationSummary(resultData.integrationSummary || []);
      if (resultData.lessonPlan) {
        setResultPlan(resultData.lessonPlan);
      } else {
        setResultPlan(null);
      }
      toast.success('Đã tự động chèn nội dung Tích hợp vào Giáo án, giữ nguyên 100% mẫu gốc!');
    } else {
      toast.error('Lỗi tích hợp giáo án: ' + (errorMessage || 'Vui lòng kiểm tra lại Gemini API Key hoặc thử lại!'));
    }

    setIsProcessing(false);
  };

  // Export to DOCX preserving full original structure (1-column / 2-column tables)
  const handleExportDocx = async () => {
    if (integratedHtml) {
      try {
        await exportHtmlToDocx(
          integratedHtml,
          documentTitle || uploadedFileName.replace(/\.[^/.]+$/, '') || 'Giao_An_Tich_Hop'
        );
        toast.success('Đã xuất file Word (.docx) giữ nguyên 100% mẫu giáo án & định dạng bảng gốc!');
      } catch (err) {
        console.error(err);
        toast.error('Lỗi xuất file Word. Vui lòng thử lại.');
      }
    } else if (integratedFullText) {
      try {
        await exportPreservedDocumentToDocx(
          integratedFullText,
          documentTitle || uploadedFileName.replace(/\.[^/.]+$/, '') || 'Giao_An_Tich_Hop'
        );
        toast.success('Đã xuất file Word (.docx) giữ nguyên nội dung!');
      } catch (err) {
        console.error(err);
        toast.error('Lỗi xuất file Word. Vui lòng thử lại.');
      }
    } else if (resultPlan) {
      try {
        await exportLessonPlanToDocx(resultPlan);
        toast.success('Đã tải xuống Kế hoạch bài dạy Word (.docx)!');
      } catch (err) {
        console.error(err);
        toast.error('Lỗi xuất file Word. Vui lòng thử lại.');
      }
    }
  };

  const handleReset = () => {
    setResultPlan(null);
    setIntegratedHtml('');
    setIntegratedFullText('');
    setIntegrationSummary([]);
  };

  const handleCopyText = () => {
    const textToCopy = integratedFullText || integratedHtml.replace(/<[^>]+>/g, '\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Đã sao chép nội dung giáo án tích hợp vào Khay nhớ tạm!');
  };

  const renderPreservedTextWithBadges = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Check if line is an integration line
          const isIntegrationLine =
            /^\s*\*?(Kỹ năng số|Năng lực số|Môi trường|Hướng nghiệp|An toàn giao thông|Giáo dục địa phương|STEM|Tích hợp[^:]*):/i.test(trimmed) ||
            /^\s*\*+[^*]+\*+/.test(trimmed) ||
            /\[TÍCH HỢP [^\]]+\]/i.test(trimmed);

          if (isIntegrationLine) {
            return (
              <div
                key={idx}
                className="my-1.5 p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 text-xs italic font-semibold text-emerald-900 dark:text-emerald-200 flex items-start gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{line}</span>
              </div>
            );
          }

          const isHeading1 = /^(BÀI|CHƯƠNG|KẾ HOẠCH BÀI DẠY|GIÁO ÁN|PHẦN|BÀI HỌC|TIẾT)\b/i.test(trimmed) || /^[I|V|X]+\.\s+/i.test(trimmed) || /^#{1,2}\s+/.test(trimmed);
          const isHeading2 = /^(HOẠT ĐỘNG|MỤC TIÊU|THIẾT BỊ|TIẾN TRÌNH|ĐÁNH GIÁ|DẶN DÒ|LUYỆN TẬP|VẬN DỤNG|\d+\.|[a-z]\))\s+/i.test(trimmed) || /^#{3,4}\s+/.test(trimmed);

          if (isHeading1) {
            return (
              <h2 key={idx} className="text-base font-extrabold text-[#1E3A8A] dark:text-blue-400 pt-4 pb-1 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wide">
                {trimmed}
              </h2>
            );
          }

          if (isHeading2) {
            return (
              <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 pb-0.5">
                {trimmed}
              </h3>
            );
          }

          return (
            <p key={idx} className="text-xs text-slate-700 dark:text-slate-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  // Save plan to user library
  const handleSaveToLibrary = () => {
    if (!resultPlan) return;
    onPlanGenerated(resultPlan);
    toast.success('Đã lưu Kế hoạch bài dạy đã tích hợp vào Thư viện bài dạy của bạn!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#244F70] to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            TÍCH HỢP TỰ ĐỘNG CHUẨN GDPT 2018
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tích Hợp AI Vào Giáo Án Sẵn Có
          </h1>
          <p className="text-sm text-blue-100 max-w-3xl leading-relaxed">
            Thầy cô chỉ cần tải tệp giáo án Word sẵn có lên, AI Gemini 3.6 sẽ tự động phân tích và bổ sung các điểm tích hợp về{' '}
            <strong className="text-white underline decoration-amber-400">Năng lực số</strong>,{' '}
            <strong className="text-white underline decoration-emerald-400">Bảo vệ Môi trường</strong>,{' '}
            <strong className="text-white underline decoration-purple-400">Hướng nghiệp</strong>,{' '}
            <strong className="text-white underline decoration-amber-400">An toàn giao thông</strong>,{' '}
            <strong className="text-white underline decoration-rose-400">Giáo dục địa phương</strong>... mà vẫn giữ nguyên 100% kiến thức gốc và xuất file Word chuẩn định dạng!
          </p>
        </div>
      </div>

      {!integratedHtml && !integratedFullText && !resultPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Text Input */}
          <div className="lg:col-span-7 space-y-6">
            {/* Upload File Card */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  1. Tải Giáo Án Sẵn Có (.docx / .txt)
                </h2>
                {uploadedFileName && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {uploadedFileName}
                  </span>
                )}
              </div>

              {/* Drag & Drop Upload Zone */}
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group">
                <input
                  type="file"
                  accept=".docx,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Bấm vào đây để chọn tệp Word (.docx) hoặc kéo thả file vào đây
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Hỗ trợ tệp Word (.docx), Văn bản (.txt), JSON giáo án
                  </div>
                </div>
              </label>

              {/* Textarea Preview / Manual Paste */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Nội dung bài dạy hiện tại (Xem trước / Hoặc dán trực tiếp nội dung tại đây):
                </label>
                <textarea
                  rows={8}
                  value={uploadedText}
                  onChange={(e) => setUploadedText(e.target.value)}
                  placeholder="Nội dung giáo án sẵn có của thầy cô sẽ hiển thị tại đây sau khi chọn file Word, hoặc thầy cô có thể copy & dán trực tiếp bài dạy vào khung này..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y transition-all"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  <span>
                    {isReadingFile
                      ? 'Đang đọc nội dung tệp...'
                      : uploadedText
                      ? `Đã nạp ${uploadedText.length} ký tự (~${Math.round(uploadedText.split(/\s+/).length)} từ)`
                      : 'Chưa có nội dung'}
                  </span>
                  {uploadedText && (
                    <button
                      onClick={() => {
                        setUploadedText('');
                        setUploadedHtml('');
                        setUploadedFileName('');
                      }}
                      className="text-rose-500 hover:underline font-medium"
                    >
                      Xóa nội dung
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Notes Card */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                Ghi chú / Yêu cầu tích hợp đặc thù (Không bắt buộc):
              </h3>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Ví dụ: Bổ sung câu hỏi tích hợp an toàn giao thông đường sắt cho học sinh vùng núi, thêm 1 trạm thực hành số..."
                className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Right Column: Topic Checkboxes & Execute Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  2. Chọn Các Nội Dung Cần Tích Hợp
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đánh dấu chọn các chủ đề muốn AI tự động phân tích và chèn vào bài dạy:
                </p>
              </div>

              <div className="space-y-2.5">
                {INTEGRATION_TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  const isChecked = selectedTopics.includes(topic.label);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.label)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/40 ring-1 ring-blue-500/30'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by container click
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-lg ${topic.color}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {topic.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {topic.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleIntegrate}
                disabled={isProcessing || (!uploadedText.trim() && !uploadedHtml.trim())}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                  isProcessing || (!uploadedText.trim() && !uploadedHtml.trim())
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Đang AI Tích Hợp Giáo Án...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>TỰ ĐỘNG TÍCH HỢP BẰNG AI GEMINI</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {isProcessing && (
                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 p-3 rounded-xl text-center space-y-2">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    {progressStatus}
                  </div>
                  <div className="w-full bg-amber-200 dark:bg-amber-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full w-2/3 animate-pulse rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Result Preview & Export Section */
        <div className="space-y-6">
          {/* Action Bar Header */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Giáo Án Đã Tích Hợp Hoàn Tất!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {documentTitle || resultPlan?.info?.lessonTitle || 'Tài liệu giáo án'} - Bảo toàn 100% văn bản & nội dung gốc
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tải Bài Khác
              </button>

              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Sao Chép
              </button>

              {resultPlan && (
                <button
                  onClick={handleSaveToLibrary}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Lưu Thư Viện
                </button>
              )}

              <button
                onClick={handleExportDocx}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất File Word (.docx)
              </button>
            </div>
          </div>

          {/* Integration Summary Highlights */}
          {integrationSummary && integrationSummary.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-blue-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Tóm Tắt Các Nội Dung Đã Tích Hợp Vào Bài Dạy:
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {integrationSummary.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Content Preview Canvas */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  Bản xem trước trực tiếp
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                  {documentTitle || 'Giáo Án Đã Tích Hợp Nội Dung GDPT 2018'}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Chữ in nghiêng màu xanh ngọc = Dòng vừa tích hợp
              </span>
            </div>

            {/* Document Content Rendering */}
            {integratedHtml ? (
              <div
                className="lesson-plan-html-content font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-100 space-y-3 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_td]:border [&_td]:border-slate-300 [&_td]:dark:border-slate-700 [&_td]:p-3 [&_td]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:dark:border-slate-700 [&_th]:p-3 [&_th]:bg-slate-100 [&_th]:dark:bg-slate-800/80 [&_th]:font-bold [&_p]:my-1 flex-1 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: integratedHtml }}
              />
            ) : integratedFullText ? (
              renderPreservedTextWithBadges(integratedFullText)
            ) : resultPlan ? (
              <div className="space-y-6 font-sans text-xs">
                {resultPlan.activities?.map((act, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300">{act.name}</h4>
                    <p><strong>Mục tiêu:</strong> {act.objective}</p>
                    <p><strong>Nội dung:</strong> {act.content}</p>
                    <p><strong>Sản phẩm:</strong> {act.product}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
