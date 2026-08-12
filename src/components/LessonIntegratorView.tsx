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
} from 'lucide-react';
import mammoth from 'mammoth';
import { FullLessonPlan, UserProfile } from '../types';
import { exportLessonPlanToDocx } from '../utils/docxExporter';
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
    desc: 'Ưng dụng CNTT, phần mềm học tập, tra cứu trực tuyến & an toàn mạng (Khung NLS UNESCO/Bộ GD&ĐT)',
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
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);

  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    INTEGRATION_TOPICS.filter((t) => t.defaultChecked).map((t) => t.label)
  );
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  const [resultPlan, setResultPlan] = useState<FullLessonPlan | null>(null);
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
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = result.value.trim();
        if (extractedText) {
          setUploadedText(extractedText);
          toast.success(`Đã đọc nội dung file Word "${file.name}" (${extractedText.length} ký tự)!`);
        } else {
          toast.warning('File Word không có nội dung chữ hoặc bị trống.');
        }
      } else if (extension === 'txt' || extension === 'json') {
        const text = await file.text();
        setUploadedText(text);
        toast.success(`Đã tải lên file "${file.name}" thành công!`);
      } else {
        // Fallback file reader for other text formats
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setUploadedText(content || '');
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
    if (!uploadedText.trim()) {
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

    try {
      setTimeout(() => {
        setProgressStatus('Đang phân tích vị trí cần chèn Năng lực số, Môi trường, Hướng nghiệp, ATGT...');
      }, 1500);

      const res = await fetch('/api/integrate-lesson-plan', {
        method: 'POST',
        headers: getApiKeyHeaders(currentUser?.id),
        body: JSON.stringify({
          uploadedText: uploadedText,
          selectedTopics: selectedTopics,
          customInstructions: customInstructions,
          schoolName: currentUser.school,
          teacherName: currentUser.name,
        }),
      });

      const data = await res.json();

      if (data.success && data.lessonPlan) {
        setResultPlan(data.lessonPlan);
        setIntegrationSummary(data.integrationSummary || []);
        toast.success('Đã tự động bổ sung thành công các nội dung Tích hợp vào Giáo án!');
      } else {
        toast.error('Lỗi tích hợp giáo án: ' + (data.error || 'Vui lòng kiểm tra lại API Key hoặc thử lại!'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ AI. Vui lòng kiểm tra lại đường truyền mạng.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export to DOCX
  const handleExportDocx = async () => {
    if (!resultPlan) return;
    try {
      await exportLessonPlanToDocx(resultPlan);
      toast.success('Đã tải xuống Kế hoạch bài dạy Word (.docx) chuẩn định dạng Bộ GD&ĐT!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi xuất file Word. Vui lòng thử lại.');
    }
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

      {!resultPlan ? (
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
                disabled={isProcessing || !uploadedText.trim()}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                  isProcessing || !uploadedText.trim()
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
                  {resultPlan.info.lessonTitle} - {resultPlan.subject} {resultPlan.grade} ({resultPlan.level})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setResultPlan(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tải Bài Khác
              </button>

              <button
                onClick={handleSaveToLibrary}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                Lưu Vào Thư Viện
              </button>

              {onSelectPlanForEdit && (
                <button
                  onClick={() => onSelectPlanForEdit(resultPlan)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  Sửa Trực Tiếp
                </button>
              )}

              <button
                onClick={handleExportDocx}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất File Word (.docx) Chuẩn Định Dạng
              </button>
            </div>
          </div>

          {/* Integration Summary Highlights Card */}
          {integrationSummary.length > 0 && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Các Điểm Nổi Bật AI Đã Tự Động Bổ Sung Tích Hợp:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {integrationSummary.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formatted Lesson Plan Document Preview Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8 font-serif">
            {/* Header Table / Document Header */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 font-sans text-xs">
              <div>
                <p className="font-bold">TRƯỜNG: <span className="font-normal text-slate-700 dark:text-slate-300">{resultPlan.info.schoolName || 'THCS Bình San'}</span></p>
                <p className="font-bold">TỔ CHUYÊN MÔN: <span className="font-normal text-slate-700 dark:text-slate-300">{resultPlan.info.departmentName || 'Tổ Tự Nhiên'}</span></p>
              </div>
              <div className="text-right">
                <p className="font-bold">HỌ VÀ TÊN GV: <span className="font-normal text-slate-700 dark:text-slate-300">{resultPlan.info.teacherName || currentUser.name}</span></p>
                <p className="font-bold">LỚP: <span className="font-normal text-slate-700 dark:text-slate-300">{resultPlan.info.classGroup || resultPlan.grade}</span> | NGÀY: <span className="font-normal text-slate-700 dark:text-slate-300">{resultPlan.info.date}</span></p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center font-sans space-y-2">
              <h1 className="text-xl font-extrabold text-[#1E3A8A] dark:text-blue-400 tracking-wide">
                KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
              </h1>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                BÀI: {resultPlan.info.lessonTitle.toUpperCase()}
              </h2>
              <p className="text-xs italic text-slate-500 dark:text-slate-400">
                Môn học: {resultPlan.subject} - {resultPlan.grade} | Bộ sách: {resultPlan.textbook} | Tiết: {resultPlan.info.periodNumber} ({resultPlan.info.duration})
              </p>

              {/* Integrated Badges Bar */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {resultPlan.integratedTopics.map((top, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                  >
                    ✓ Tích hợp: {top}
                  </span>
                ))}
              </div>
            </div>

            {/* I. Objectives */}
            <div className="space-y-3 font-sans">
              <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-blue-400 border-b border-blue-100 dark:border-blue-900 pb-1 uppercase">
                I. MỤC TIÊU BÀI HỌC
              </h3>

              <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed pl-2">
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">1. Yêu cầu cần đạt:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {resultPlan.objectives.requirementsToAchieve.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-slate-900 dark:text-slate-100">2. Năng lực:</strong>
                  <p className="mt-1">
                    <strong>a) Năng lực chung:</strong> {resultPlan.objectives.generalCompetencies.join('; ')}
                  </p>
                  <p className="mt-1">
                    <strong>b) Năng lực đặc thù:</strong> {resultPlan.objectives.specificCompetencies.join('; ')}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-900 dark:text-slate-100">3. Phẩm chất:</strong>
                  <p className="mt-1">{resultPlan.objectives.qualities.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* II. Equipment & Materials */}
            <div className="space-y-3 font-sans">
              <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-blue-400 border-b border-blue-100 dark:border-blue-900 pb-1 uppercase">
                II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
              </h3>
              <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed pl-2">
                <p><strong>1. Giáo viên:</strong> {resultPlan.equipmentsAndMaterials.equipments.join(', ')}</p>
                <p><strong>2. Học sinh:</strong> {resultPlan.equipmentsAndMaterials.materials.join(', ')}</p>
              </div>
            </div>

            {/* III. Teaching Activities */}
            <div className="space-y-4 font-sans">
              <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-blue-400 border-b border-blue-100 dark:border-blue-900 pb-1 uppercase">
                III. TIẾN TRÌNH DẠY HỌC
              </h3>

              <div className="space-y-6">
                {resultPlan.activities.map((act, idx) => (
                  <div key={act.id || idx} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                    <h4 className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase">
                      HOẠT ĐỘNG {idx + 1}: {act.name} ({act.duration})
                    </h4>

                    <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                      <p><strong>a) Mục tiêu:</strong> {act.objective}</p>
                      <p><strong>b) Nội dung:</strong> {act.content}</p>
                      <p><strong>c) Sản phẩm:</strong> {act.product}</p>

                      <div>
                        <strong>d) Tổ chức thực hiện:</strong>
                        <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                <th className="p-2.5 w-1/3 border-r border-slate-200 dark:border-slate-700">Các bước</th>
                                <th className="p-2.5">Nội dung chi tiết (Đã chèn Tích hợp)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                              <tr>
                                <td className="p-2.5 font-semibold border-r border-slate-200 dark:border-slate-700">Bước 1: Chuyển giao nhiệm vụ</td>
                                <td className="p-2.5 whitespace-pre-line">{act.implementation.transfer}</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-semibold border-r border-slate-200 dark:border-slate-700">Bước 2: Thực hiện nhiệm vụ</td>
                                <td className="p-2.5 whitespace-pre-line">{act.implementation.execution}</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-semibold border-r border-slate-200 dark:border-slate-700">Bước 3: Báo cáo, thảo luận</td>
                                <td className="p-2.5 whitespace-pre-line">{act.implementation.reporting}</td>
                              </tr>
                              <tr>
                                <td className="p-2.5 font-semibold border-r border-slate-200 dark:border-slate-700">Bước 4: Kết luận, nhận định</td>
                                <td className="p-2.5 whitespace-pre-line">{act.implementation.conclusion}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IV. Assessment & Differentiation */}
            <div className="space-y-3 font-sans">
              <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-blue-400 border-b border-blue-100 dark:border-blue-900 pb-1 uppercase">
                IV. HƯỚNG DẪN ĐÁNH GIÁ & PHÂN HÓA DẠY HỌC
              </h3>
              <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed pl-2">
                <p><strong>• Phương pháp & Hình thức đánh giá:</strong> {resultPlan.assessment.type} ({resultPlan.assessment.details})</p>
                <p><strong>• Phân hóa HS cần hỗ trợ:</strong> {resultPlan.differentiation.weakSupport}</p>
                <p><strong>• Phân hóa HS khá / giỏi / năng khiếu:</strong> {resultPlan.differentiation.advancedSupport}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
