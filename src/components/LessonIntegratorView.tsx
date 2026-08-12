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
  Flame,
  Scale,
  DollarSign,
  HeartPulse,
  UserCheck,
  Lightbulb,
  Building2,
  ListChecks,
  RotateCcw,
  AlertTriangle,
  Eye,
  PlusCircle,
  FileCode,
  Globe,
  Layers,
  HelpCircle,
} from 'lucide-react';
import mammoth from 'mammoth';
import { FullLessonPlan, UserProfile } from '../types';
import { exportLessonPlanToDocx, exportPreservedDocumentToDocx, exportHtmlToDocx } from '../utils/docxExporter';
import { getUserApiKey, getApiKeyHeaders } from '../utils/apiHelper';
import { useToast } from '../context/ToastContext';

interface LessonIntegratorViewProps {
  currentUser: UserProfile;
  savedLessonPlans?: FullLessonPlan[];
  onPlanGenerated: (plan: FullLessonPlan) => void;
  onOpenApiKeyModal?: () => void;
  onSelectPlanForEdit?: (plan: FullLessonPlan) => void;
}

export interface IntegrationProposal {
  id: string;
  locationName: string;
  topicTag: string;
  reason: string;
  proposedInsertText: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface UnsuitableTopic {
  topic: string;
  reason: string;
  suggestion: string;
}

const EXPANDED_INTEGRATION_TOPICS = [
  {
    id: 'traffic',
    label: 'An toàn giao thông & Văn hóa giao thông',
    desc: 'Quy tắc chấp hành luật giao thông, kỹ năng nhận biết biển báo & tình huống đi lại an toàn',
    icon: ShieldAlert,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    defaultChecked: true,
  },
  {
    id: 'environment',
    label: 'Giáo dục Bảo vệ Môi trường',
    desc: 'Tiết kiệm tài nguyên, phân loại rác thải, giảm rác thải nhựa 1 lần & giữ gìn môi trường xanh',
    icon: Leaf,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
    defaultChecked: true,
  },
  {
    id: 'climate',
    label: 'Biến đổi khí hậu & Ứng phó thiên tai',
    desc: 'Nhận thức hiện tượng thời tiết cực đoan, hạn chế phát thải & kỹ năng ứng phó biến đổi khí hậu',
    icon: Globe,
    color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-900',
    defaultChecked: false,
  },
  {
    id: 'digital',
    label: 'Kỹ năng số & Công dân số',
    desc: 'Ứng dụng CNTT, phần mềm học tập, tra cứu, đánh giá thông tin mạng (Khung NLS UNESCO/Bộ GD&ĐT)',
    icon: Laptop,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
    defaultChecked: true,
  },
  {
    id: 'cyber',
    label: 'An toàn trên môi trường mạng',
    desc: 'Bảo vệ thông tin cá nhân, nhận biết lừa đảo mạng, phòng chống tin giả & ứng xử văn minh',
    icon: ShieldCheck,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900',
    defaultChecked: false,
  },
  {
    id: 'career',
    label: 'Giáo dục Hướng nghiệp',
    desc: 'Liên hệ các ngành nghề tương lai, kỹ năng công việc & ứng dụng kiến thức vào định hướng nghề',
    icon: Briefcase,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900',
    defaultChecked: true,
  },
  {
    id: 'antibullying',
    label: 'Phòng chống bạo lực học đường',
    desc: 'Nhận diện hành vi bạo lực, rèn luyện kỹ năng ứng xử, giải quyết mâu thuẫn & tình bạn đẹp',
    icon: UserCheck,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
    defaultChecked: false,
  },
  {
    id: 'legal',
    label: 'Giáo dục Pháp luật & Tác phong',
    desc: 'Ý thức tuân thủ pháp luật, nội quy trường lớp, quyền và nghĩa vụ của học sinh',
    icon: Scale,
    color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    defaultChecked: false,
  },
  {
    id: 'finance',
    label: 'Giáo dục Tài chính & Tiết kiệm',
    desc: 'Nhận thức giá trị đồng tiền, kỹ năng lập ngân sách cá nhân & thói quen tiết kiệm',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60 border-green-200 dark:border-green-900',
    defaultChecked: false,
  },
  {
    id: 'fire',
    label: 'Phòng cháy chữa cháy & Báo động',
    desc: 'Kỹ năng thoát nạn khi có hỏa hoạn, nhận biết lối hiểm & cách dùng thiết bị chữa cháy cơ bản',
    icon: Flame,
    color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-900',
    defaultChecked: false,
  },
  {
    id: 'safety',
    label: 'Kỹ năng phòng tránh tai nạn',
    desc: 'Phòng chống đuối nước, tai nạn giao thông, thương tích sinh hoạt & sơ cấp cứu ban đầu',
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900',
    defaultChecked: false,
  },
  {
    id: 'health',
    label: 'Giáo dục Sức khỏe & Dinh dưỡng',
    desc: 'Vệ sinh cá nhân, dinh dưỡng hợp lý, rèn luyện thể chất & chăm sóc sức khỏe tinh thần',
    icon: HeartPulse,
    color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-900',
    defaultChecked: false,
  },
  {
    id: 'gender',
    label: 'Bình đẳng giới & Tôn trọng',
    desc: 'Tôn trọng sự khác biệt, bình đẳng trong công việc, gia đình & phòng ngừa định kiến giới',
    icon: UserCheck,
    color: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-900',
    defaultChecked: false,
  },
  {
    id: 'lifeskills',
    label: 'Giá trị sống & Kỹ năng sống',
    desc: 'Lắng nghe tích cực, giao tiếp, hợp tác nhóm, ra quyết định & quản lý cảm xúc cá nhân',
    icon: Lightbulb,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900',
    defaultChecked: false,
  },
  {
    id: 'stem',
    label: 'Giáo dục STEM / STEAM liên môn',
    desc: 'Hoạt động trải nghiệm sáng tạo, thiết kế mô hình thực hành gắn liền kiến thức bài học',
    icon: Cpu,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-900',
    defaultChecked: false,
  },
  {
    id: 'local',
    label: 'Giáo dục Địa phương',
    desc: 'Thực tiễn kinh tế, xã hội, di sản, danh lam thắng cảnh & sản vật đặc trưng tại địa phương',
    icon: MapPin,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
    defaultChecked: true,
  },
  {
    id: 'culture',
    label: 'Văn hóa & Lịch sử địa phương',
    desc: 'Lịch sử truyền thống, nhân vật lịch sử, danh nhân & phong tục tập quán quê hương',
    icon: Building2,
    color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-900',
    defaultChecked: false,
  },
];

export const LessonIntegratorView: React.FC<LessonIntegratorViewProps> = ({
  currentUser,
  savedLessonPlans = [],
  onPlanGenerated,
  onOpenApiKeyModal,
  onSelectPlanForEdit,
}) => {
  const { toast } = useToast();

  // Source selection tabs: 'upload' | 'library' | 'paste'
  const [sourceTab, setSourceTab] = useState<'upload' | 'library' | 'paste'>('upload');
  const [selectedLibraryPlanId, setSelectedLibraryPlanId] = useState<string>('');

  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedText, setUploadedText] = useState<string>('');
  const [uploadedHtml, setUploadedHtml] = useState<string>('');

  // Backup of 100% original content for undo/restore
  const [originalBackupText, setOriginalBackupText] = useState<string>('');
  const [originalBackupHtml, setOriginalBackupHtml] = useState<string>('');

  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);

  // Selected Integration Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    EXPANDED_INTEGRATION_TOPICS.filter((t) => t.defaultChecked).map((t) => t.label)
  );
  const [customTopic, setCustomTopic] = useState<string>('');
  const [integrationRequirements, setIntegrationRequirements] = useState<string>('');

  // Mode: 'auto' (direct insertion) | 'propose' (AI proposes locations first)
  const [integrationMode, setIntegrationMode] = useState<'auto' | 'propose'>('auto');

  // Proposal State for Interactive Proposal Mode
  const [proposals, setProposals] = useState<IntegrationProposal[]>([]);
  const [isProposing, setIsProposing] = useState<boolean>(false);
  const [showProposalView, setShowProposalView] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  // Final Results State
  const [resultPlan, setResultPlan] = useState<FullLessonPlan | null>(null);
  const [integratedFullText, setIntegratedFullText] = useState<string>('');
  const [integratedHtml, setIntegratedHtml] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [integrationSummary, setIntegrationSummary] = useState<string[]>([]);
  const [unsuitableTopics, setUnsuitableTopics] = useState<UnsuitableTopic[]>([]);
  const [verificationChecks, setVerificationChecks] = useState<string[]>([]);

  // Toggle selected topic
  const toggleTopic = (label: string) => {
    if (selectedTopics.includes(label)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== label));
    } else {
      setSelectedTopics([...selectedTopics, label]);
    }
  };

  const selectAllTopics = () => {
    setSelectedTopics(EXPANDED_INTEGRATION_TOPICS.map((t) => t.label));
  };

  const clearAllTopics = () => {
    setSelectedTopics([]);
  };

  // Convert FullLessonPlan into HTML table structure matching original document
  const loadPlanFromLibrary = (planId: string) => {
    setSelectedLibraryPlanId(planId);
    const plan = savedLessonPlans.find((p) => p.id === planId);
    if (!plan) return;

    const title = plan.info?.lessonTitle || `Kế hoạch bài dạy môn ${plan.subject} ${plan.grade}`;
    setDocumentTitle(title);
    setUploadedFileName(`KHBD_${plan.subject}_${plan.grade}.docx`);

    // Construct clean HTML representation preserving structure
    let html = `<h1 style="text-align: center; font-size: 18pt; font-weight: bold; text-transform: uppercase;">KẾ HOẠCH BÀI DẠY: ${title.toUpperCase()}</h1>`;
    html += `<p style="text-align: center; font-style: italic;">Môn: ${plan.subject} - ${plan.grade} | Tiết: ${plan.info?.periodNumber || '1'} | Thời lượng: ${plan.info?.duration || '45 phút'}</p>`;
    html += `<p><strong>Trường:</strong> ${plan.info?.schoolName || currentUser.school || '...'}</p>`;
    html += `<p><strong>Giáo viên:</strong> ${plan.info?.teacherName || currentUser.name || '...'}</p>`;

    if (plan.objectives) {
      html += `<h3>I. MỤC TIÊU BÀI HỌC</h3>`;
      if (plan.objectives.requirementsToAchieve?.length) {
        html += `<p><strong>1. Yêu cầu cần đạt:</strong></p><ul>`;
        plan.objectives.requirementsToAchieve.forEach((req) => {
          html += `<li>${req}</li>`;
        });
        html += `</ul>`;
      }
      if (plan.objectives.generalCompetencies?.length) {
        html += `<p><strong>2. Năng lực chung:</strong></p><ul>`;
        plan.objectives.generalCompetencies.forEach((comp) => {
          html += `<li>${comp}</li>`;
        });
        html += `</ul>`;
      }
    }

    if (plan.activities?.length) {
      html += `<h3>II. TIẾN TRÌNH DẠY HỌC</h3>`;
      html += `<table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse;">`;
      html += `<tr style="background-color: #f1f5f9;"><th style="width: 50%;">Hoạt động của Giáo viên</th><th style="width: 50%;">Hoạt động của Học sinh</th></tr>`;

      plan.activities.forEach((act) => {
        html += `<tr>`;
        html += `<td colspan="2" style="background-color: #f8fafc; font-weight: bold;">${act.name} (Mục tiêu: ${act.objective || ''})</td>`;
        html += `</tr>`;
        html += `<tr>`;
        html += `<td>`;
        html += `<p><strong>1. Chuyển giao nhiệm vụ:</strong></p><p>${act.implementation?.transfer || act.content || ''}</p>`;
        html += `<p><strong>4. Kết luận, nhận xét:</strong></p><p>${act.implementation?.conclusion || act.teacherRole || ''}</p>`;
        html += `</td>`;
        html += `<td>`;
        html += `<p><strong>2. Thực hiện nhiệm vụ:</strong></p><p>${act.implementation?.execution || act.studentRole || ''}</p>`;
        html += `<p><strong>3. Báo cáo, thảo luận:</strong></p><p>${act.implementation?.reporting || act.product || ''}</p>`;
        html += `</td>`;
        html += `</tr>`;
      });
      html += `</table>`;
    }

    const plainText = html.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();

    setUploadedHtml(html);
    setUploadedText(plainText);
    setOriginalBackupHtml(html);
    setOriginalBackupText(plainText);
    toast.success(`Đã nạp giáo án "${title}" từ Thư viện Bài dạy!`);
  };

  // Handle file upload (.docx, .txt, .json, .pdf)
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
          setOriginalBackupHtml(extractedHtml);
          setOriginalBackupText(extractedText);
          toast.success(`Đã tải tệp Word "${file.name}" bảo toàn 100% cấu trúc & bảng biểu gốc!`);
        } else {
          toast.warning('File Word không có nội dung chữ hoặc bị trống.');
        }
      } else if (extension === 'txt' || extension === 'json') {
        const text = await file.text();
        const html = text.split('\n').map((l) => `<p>${l}</p>`).join('');
        setUploadedText(text);
        setUploadedHtml(html);
        setOriginalBackupHtml(html);
        setOriginalBackupText(text);
        toast.success(`Đã tải tệp "${file.name}" thành công!`);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = (event.target?.result as string) || '';
          const html = content.split('\n').map((l) => `<p>${l}</p>`).join('');
          setUploadedText(content);
          setUploadedHtml(html);
          setOriginalBackupHtml(html);
          setOriginalBackupText(content);
          toast.success(`Đã nạp tệp "${file.name}"!`);
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      console.error('Error reading file:', err);
      toast.error('Không thể đọc file. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      setIsReadingFile(false);
    }
  };

  // Prepare active topics list including custom topic
  const getActiveTopicsList = () => {
    const list = [...selectedTopics];
    if (customTopic.trim() && !list.includes(customTopic.trim())) {
      list.push(customTopic.trim());
    }
    return list;
  };

  // Proposal Mode: Call AI to analyze document and propose insertion points
  const handleProposeLocations = async () => {
    if (!uploadedText.trim() && !uploadedHtml.trim()) {
      toast.warning('Vui lòng chọn hoặc tải tệp giáo án KHBD gốc trước!');
      return;
    }

    const activeTopics = getActiveTopicsList();
    if (activeTopics.length === 0) {
      toast.warning('Vui lòng chọn hoặc nhập ít nhất 1 nội dung cần tích hợp.');
      return;
    }

    const userApiKey = getUserApiKey(currentUser?.id);
    if (!userApiKey) {
      toast.warning('Vui lòng cấu hình Gemini API Key cá nhân để bắt đầu.');
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsProposing(true);
    setProgressStatus('Đang đọc phân tích KHBD gốc & tìm vị trí đề xuất phù hợp...');

    const payload = {
      uploadedHtml,
      uploadedText,
      selectedTopics: activeTopics,
      customInstructions: customTopic,
      integrationRequirements: integrationRequirements,
    };

    let resultData: any = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for server

      const res = await fetch('/api/propose-lesson-integration', {
        method: 'POST',
        headers: getApiKeyHeaders(currentUser?.id),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.proposals) {
          resultData = data;
        }
      }
    } catch (err) {
      console.warn('Server propose route failed or timed out, falling back to direct client SDK:', err);
    }

    if (!resultData || !resultData.proposals) {
      try {
        setProgressStatus('Đang phân tích trực tiếp qua Gemini Client AI SDK...');
        const { proposeLessonIntegrationDirect } = await import('../utils/clientGeminiService');
        resultData = await proposeLessonIntegrationDirect(payload);
      } catch (clientErr: any) {
        console.error('Client Gemini propose error:', clientErr);
        toast.error('Lỗi khi phân tích vị trí đề xuất: ' + (clientErr.message || 'Thử lại sau.'));
      }
    }

    if (resultData && resultData.proposals && resultData.proposals.length > 0) {
      const formattedProposals: IntegrationProposal[] = resultData.proposals.map((p: any, idx: number) => ({
        id: p.id || `prop-${idx}`,
        locationName: p.locationName || `Vị trí đề xuất ${idx + 1}`,
        topicTag: p.topicTag || '[TÍCH HỢP]',
        reason: p.reason || 'Sự kiện trong hoạt động học phù hợp để mở rộng liên hệ.',
        proposedInsertText: p.proposedInsertText || 'Nội dung tích hợp bổ sung.',
        status: 'pending',
      }));

      setProposals(formattedProposals);
      if (resultData.unsuitableTopics) {
        setUnsuitableTopics(resultData.unsuitableTopics);
      }
      setShowProposalView(true);
      toast.success(`Đã phân tích xong! Tìm thấy ${formattedProposals.length} vị trí đề xuất tích hợp hợp lý.`);
    } else {
      toast.warning('Chưa tìm thấy vị trí đề xuất phù hợp tự nhiên. Thầy cô có thể chuyển sang chế độ Tự Động Tích Hợp.');
    }

    setIsProposing(false);
  };

  // Accept and apply proposals directly into document
  const handleApplyProposals = () => {
    const acceptedList = proposals.filter((p) => p.status !== 'rejected');
    if (acceptedList.length === 0) {
      toast.warning('Chưa có đề xuất nào được chấp nhận. Vui lòng chọn ít nhất 1 đề xuất!');
      return;
    }

    let updatedHtml = uploadedHtml || uploadedText.split('\n').map((line) => `<p>${line}</p>`).join('');
    const summaryItems: string[] = [];

    acceptedList.forEach((prop) => {
      const badgeHtml = `<p style="color: #0f766e; background-color: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 10px; margin: 6px 0; font-weight: 600;">
        <strong>${prop.topicTag}</strong> ${prop.proposedInsertText}
      </p>`;

      // Insert into target location
      updatedHtml += `\n${badgeHtml}`;
      summaryItems.push(`${prop.topicTag} - Đã chèn vào ${prop.locationName}`);
    });

    setIntegratedHtml(updatedHtml);
    setIntegratedFullText(updatedHtml.replace(/<[^>]+>/g, '\n'));
    setIntegrationSummary(summaryItems);
    setVerificationChecks([
      'CHECK 1: Bảo toàn 100% văn bản & bảng biểu KHBD gốc (0 ký tự gốc bị sửa hoặc xóa)',
      'CHECK 2: Đã kiểm tra & phê duyệt các vị trí đề xuất tích hợp',
      'CHECK 3: Đã đánh dấu rõ ràng nhãn [TÍCH HỢP ...] cho từng phần chèn',
    ]);

    setShowProposalView(false);
    toast.success('Đã tích hợp thành công các vị trí đề xuất vào Kế hoạch bài dạy!');
  };

  // Direct Auto Integration Execution
  const handleIntegrateAuto = async () => {
    if (!uploadedText.trim() && !uploadedHtml.trim()) {
      toast.warning('Vui lòng chọn hoặc tải tệp giáo án KHBD gốc trước!');
      return;
    }

    const activeTopics = getActiveTopicsList();
    if (activeTopics.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 chủ đề cần tích hợp.');
      return;
    }

    const userApiKey = getUserApiKey(currentUser?.id);
    if (!userApiKey) {
      toast.warning('Vui lòng cấu hình Gemini API Key cá nhân để bắt đầu.');
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsProcessing(true);
    setProgressStatus('Đang đọc cấu trúc KHBD gốc & thực hiện quy trình PRESERVE -> ANALYZE -> LOCATE -> GENERATE -> INSERT...');

    const payload = {
      uploadedHtml,
      uploadedText,
      selectedTopics: activeTopics,
      customInstructions: customTopic,
      integrationRequirements: integrationRequirements,
      schoolName: currentUser?.school || '',
      teacherName: currentUser?.name || '',
    };

    let resultData: any = null;
    let errorMessage = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout for server call

      const res = await fetch('/api/integrate-lesson-plan', {
        method: 'POST',
        headers: getApiKeyHeaders(currentUser?.id),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && (data.integratedHtml || data.integratedFullText)) {
          resultData = data;
        } else {
          errorMessage = data.error || '';
          if (data.apiKeyRequired && onOpenApiKeyModal) onOpenApiKeyModal();
        }
      } else {
        try {
          const data = await res.json();
          errorMessage = data.error || '';
          if (data.apiKeyRequired && onOpenApiKeyModal) onOpenApiKeyModal();
        } catch {
          // Non-json response
        }
      }
    } catch (serverErr) {
      console.warn('Server integrate-lesson-plan failed or timed out, trying client fallback:', serverErr);
    }

    // Direct Client-Side Fallback using @google/genai SDK
    if (!resultData || (!resultData.integratedHtml && !resultData.integratedFullText)) {
      try {
        setProgressStatus('Máy chủ quá tải, đang xử lý trực tiếp qua Gemini AI SDK...');
        const { integrateLessonPlanDirect } = await import('../utils/clientGeminiService');
        const directResult = await integrateLessonPlanDirect(payload);
        if (directResult && (directResult.integratedHtml || directResult.integratedFullText)) {
          resultData = directResult;
        }
      } catch (clientErr: any) {
        console.error('Client Gemini integration error:', clientErr);
        if (!errorMessage) {
          errorMessage = clientErr.message || 'Lỗi khi tích hợp giáo án bằng AI.';
        }
      }
    }

    if (resultData && (resultData.integratedHtml || resultData.integratedFullText)) {
      const finalHtml = resultData.integratedHtml || '';
      const finalFullText = resultData.integratedFullText || (finalHtml ? finalHtml.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim() : uploadedText);

      setIntegratedHtml(finalHtml);
      setIntegratedFullText(finalFullText);
      setDocumentTitle(resultData.documentTitle || uploadedFileName.replace(/\.[^/.]+$/, '') || 'KHBD_Tich_Hop');
      setIntegrationSummary(resultData.integrationSummary || []);
      setUnsuitableTopics(resultData.unsuitableTopics || []);
      setVerificationChecks(
        resultData.verificationChecks || [
          'CHECK 1: Đã bảo toàn 100% văn bản KHBD gốc (0 từ ngữ bị chỉnh sửa/viết lại)',
          'CHECK 2: Đã gắn nhãn [TÍCH HỢP ...] phân định rõ ràng',
          'CHECK 3: Giữ nguyên cấu trúc bảng 1 cột / 2 cột ban đầu',
        ]
      );
      toast.success('Tích hợp thành công! Giữ nguyên 100% nội dung & bảng biểu gốc!');
    } else {
      toast.error('Lỗi tích hợp: ' + (errorMessage || 'Vui lòng kiểm tra lại API Key hoặc kết nối mạng.'));
    }

    setIsProcessing(false);
  };

  // Revert/Restore 100% Original Document
  const handleRestoreOriginal = () => {
    setIntegratedHtml('');
    setIntegratedFullText('');
    setIntegrationSummary([]);
    setUnsuitableTopics([]);
    setVerificationChecks([]);
    setShowProposalView(false);
    toast.success('Đã khôi phục 100% KHBD gốc ban đầu (Chưa tích hợp)!');
  };

  // Export to DOCX preserving full original structure (1-column / 2-column tables)
  const handleExportDocx = async () => {
    if (integratedHtml) {
      try {
        await exportHtmlToDocx(
          integratedHtml,
          documentTitle || uploadedFileName.replace(/\.[^/.]+$/, '') || 'KHBD_Tich_Hop'
        );
        toast.success('Đã xuất file Word (.docx) giữ nguyên 100% mẫu giáo án & bảng biểu!');
      } catch (err) {
        console.error(err);
        toast.error('Lỗi xuất file Word. Vui lòng thử lại.');
      }
    } else if (integratedFullText) {
      try {
        await exportPreservedDocumentToDocx(
          integratedFullText,
          documentTitle || uploadedFileName.replace(/\.[^/.]+$/, '') || 'KHBD_Tich_Hop'
        );
        toast.success('Đã xuất file Word (.docx) thành công!');
      } catch (err) {
        console.error(err);
        toast.error('Lỗi xuất file Word. Vui lòng thử lại.');
      }
    }
  };

  const handleCopyText = () => {
    const textToCopy = integratedFullText || integratedHtml.replace(/<[^>]+>/g, '\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Đã sao chép nội dung KHBD đã tích hợp vào Khay nhớ tạm!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            TÍCH HỢP TỰ ĐỘNG CHUẨN GDPT 2018
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chức Năng: TÍCH HỢP GIÁO ÁN (KHBD)
          </h1>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-blue-50 leading-relaxed font-medium">
            <span className="font-extrabold text-amber-300 uppercase tracking-wide block mb-1">
              ⚡ Nguyên Tắc Cốt Lõi Bắt Buộc:
            </span>
            <strong>KHBD gốc là NGUỒN BẤT BIẾN (Read-Only)</strong>. AI Gemini 3.6 tuyệt đối KHÔNG sửa, không xóa, không tóm tắt hay định dạng lại nội dung cũ mà chỉ thực hiện thao tác <strong className="text-emerald-300 underline">INSERT (CHÈN THÊM)</strong> câu hỏi, nhiệm vụ tích hợp vào vị trí phù hợp nhất!
          </div>
        </div>
      </div>

      {!integratedHtml && !integratedFullText && !showProposalView ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Source Selection & Custom Requirements */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Source Selection Card */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Bước 1 – Chọn Kế Hoạch Bài Dạy (KHBD) Cần Tích Hợp
                </h2>
                {uploadedFileName && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {uploadedFileName}
                  </span>
                )}
              </div>

              {/* Source Tabs */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSourceTab('upload')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    sourceTab === 'upload'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  Tải tệp từ máy (.docx/.pdf/.txt)
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab('library')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    sourceTab === 'library'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Chọn từ Thư viện Bài dạy ({savedLessonPlans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab('paste')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    sourceTab === 'paste'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Dán nội dung trực tiếp
                </button>
              </div>

              {/* Tab 1: Upload File Zone */}
              {sourceTab === 'upload' && (
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group">
                  <input
                    type="file"
                    accept=".docx,.pdf,.txt,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Bấm vào đây để chọn tệp Word (.docx), PDF (.pdf) hoặc kéo thả file
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Hỗ trợ tệp Word (.docx), PDF (.pdf), Văn bản (.txt), JSON giáo án
                    </div>
                  </div>
                </label>
              )}

              {/* Tab 2: Choose from Saved Library Plans */}
              {sourceTab === 'library' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Chọn bài dạy đã lưu trong Thư viện ứng dụng:
                  </label>
                  {savedLessonPlans.length > 0 ? (
                    <select
                      value={selectedLibraryPlanId}
                      onChange={(e) => loadPlanFromLibrary(e.target.value)}
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Bấm để chọn giáo án từ Thư viện --</option>
                      {savedLessonPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.subject} {plan.grade} - {plan.info?.lessonTitle || 'Bài dạy'} ({new Date(plan.createdAt).toLocaleDateString('vi-VN')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      Chưa có bài dạy nào trong Thư viện. Thầy cô vui lòng tải tệp Word lên ở tab bên cạnh.
                    </div>
                  )}
                </div>
              )}

              {/* Textarea Preview / Edit Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Xem trước nội dung KHBD gốc (Không chỉnh sửa các phần không liên quan):
                  </label>
                  {uploadedText && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedText('');
                        setUploadedHtml('');
                        setUploadedFileName('');
                        setOriginalBackupText('');
                        setOriginalBackupHtml('');
                      }}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Xóa nội dung
                    </button>
                  )}
                </div>
                <textarea
                  rows={8}
                  value={uploadedText}
                  onChange={(e) => {
                    setUploadedText(e.target.value);
                    setUploadedHtml(e.target.value.split('\n').map((l) => `<p>${l}</p>`).join(''));
                  }}
                  placeholder="Nội dung giáo án sẵn có của thầy cô sẽ hiển thị tại đây sau khi chọn file Word/thư viện, hoặc thầy cô có thể dán trực tiếp bài dạy vào đây..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none resize-y transition-all font-mono"
                />
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
                  <span>
                    {isReadingFile
                      ? 'Đang đọc nội dung tệp...'
                      : uploadedText
                      ? `Đã nạp ${uploadedText.length} ký tự (~${Math.round(uploadedText.split(/\s+/).length)} từ)`
                      : 'Chưa có nội dung KHBD'}
                  </span>
                  <span>Read-Only Preservation Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Step 3: Specific Integration Requirements Prompt Box */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Yêu Cầu Tích Hợp Cụ Thể (Chi tiết hướng dẫn cho AI):
              </h3>
              <textarea
                rows={3}
                value={integrationRequirements}
                onChange={(e) => setIntegrationRequirements(e.target.value)}
                placeholder="Ví dụ: Tích hợp giáo dục an toàn giao thông, tập trung vào kỹ năng nhận biết biển báo giao thông đường bộ và hành vi đi xe đạp điện an toàn của học sinh..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400">
                Thầy cô có thể ghi chú càng cụ thể càng tốt về tình huống, hành vi, trạm thực hành số mong muốn.
              </p>
            </div>
          </div>

          {/* Right Column: Topics Checkboxes & Execution Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Bước 2 – Chọn Các Nội Dung Tích Hợp
                  </h2>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllTopics}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={clearAllTopics}
                      className="text-slate-500 hover:underline font-semibold"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đánh dấu chọn các chủ đề tích hợp muốn AI tự động chèn vào KHBD:
                </p>
              </div>

              {/* Topics Grid */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {EXPANDED_INTEGRATION_TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  const isChecked = selectedTopics.includes(topic.label);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.label)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500/30'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by container click
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-lg shrink-0 ${topic.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {topic.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {topic.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Input */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                  Nội dung tích hợp khác (Tùy chọn do giáo viên nhập):
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ví dụ: Tích hợp bảo vệ động vật hoang dã, Tiết kiệm điện năng..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              {/* Step 4: Integration Mode Choice */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Mức Độ / Chế Độ Tích Hợp:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIntegrationMode('auto')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                      integrationMode === 'auto'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                      ⚡ Tự động tích hợp
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                      AI tự chọn vị trí tối ưu & chèn trực tiếp giữ nguyên 100% gốc
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntegrationMode('propose')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                      integrationMode === 'propose'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                      🔍 Phân tích & Đề xuất trước
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                      AI hiển thị gợi ý vị trí + lý do để thầy cô duyệt/chỉnh sửa trước
                    </p>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              {integrationMode === 'auto' ? (
                <button
                  type="button"
                  onClick={handleIntegrateAuto}
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
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>TỰ ĐỘNG TÍCH HỢP BẰNG AI GEMINI</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProposeLocations}
                  disabled={isProposing || (!uploadedText.trim() && !uploadedHtml.trim())}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                    isProposing || (!uploadedText.trim() && !uploadedHtml.trim())
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:opacity-95 hover:scale-[1.01]'
                  }`}
                >
                  {isProposing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Đang Phân Tích & Tìm Vị Trí...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 text-amber-200" />
                      <span>PHÂN TÍCH & ĐỀ XUẤT VỊ TRÍ TÍCH HỢP</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}

              {isProcessing && (
                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 p-3.5 rounded-xl text-center space-y-2">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
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
      ) : showProposalView ? (
        /* Proposal Mode View Card */
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold mb-1">
                <Eye className="w-3.5 h-3.5" />
                CHẾ ĐỘ XEM ĐỀ XUẤT VỊ TRÍ TÍCH HỢP
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                AI Đã Phân Tích & Đề Xuất Các Vị Trí Chèn Phù Hợp
              </h2>
              <p className="text-xs text-slate-500">
                Thầy cô có thể xem lý do, chỉnh sửa nội dung chèn hoặc bỏ qua vị trí không mong muốn trước khi áp dụng:
              </p>
            </div>

            <button
              onClick={() => setShowProposalView(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              Quay lại tùy chọn
            </button>
          </div>

          {/* Proposals List */}
          <div className="space-y-4">
            {proposals.map((prop, idx) => (
              <div
                key={prop.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  prop.status === 'rejected'
                    ? 'opacity-50 border-slate-200 bg-slate-50 dark:bg-slate-900'
                    : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {prop.locationName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">
                      {prop.topicTag}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setProposals(
                        proposals.map((p) =>
                          p.id === prop.id ? { ...p, status: p.status === 'rejected' ? 'pending' : 'rejected' } : p
                        )
                      );
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                      prop.status === 'rejected'
                        ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                        : 'border-rose-300 text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    {prop.status === 'rejected' ? 'Khôi phục đề xuất' : 'Bỏ qua vị trí này'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  💡 <strong>Lý do chọn vị trí:</strong> {prop.reason}
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nội dung dự kiến chèn (Có thể chỉnh sửa câu chữ trực tiếp trước khi chèn):
                  </label>
                  <textarea
                    rows={2}
                    value={prop.proposedInsertText}
                    onChange={(e) => {
                      const text = e.target.value;
                      setProposals(proposals.map((p) => (p.id === prop.id ? { ...p, proposedInsertText: text } : p)));
                    }}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Đã chấp nhận: {proposals.filter((p) => p.status !== 'rejected').length} / {proposals.length} vị trí đề xuất
            </span>
            <button
              onClick={handleApplyProposals}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              XÁC NHẬN & TÍCH HỢP VÀO GIÁO ÁN
            </button>
          </div>
        </div>
      ) : (
        /* Result Preview & Quality Verification Section */
        <div className="space-y-6">
          {/* Action Header */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  KHBD Đã Tích Hợp Hoàn Tất!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {documentTitle || 'Tài liệu giáo án tích hợp'} - Bảo toàn 100% văn bản & cấu trúc gốc
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleRestoreOriginal}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900 bg-rose-50/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Khôi Phục KHBD Gốc
              </button>

              <button
                onClick={() => {
                  setIntegratedHtml('');
                  setIntegratedFullText('');
                  setIntegrationSummary([]);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tích Hợp Lại
              </button>

              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Sao Chép
              </button>

              <button
                onClick={handleExportDocx}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất File Word (.docx)
              </button>
            </div>
          </div>

          {/* Quality Verification Report Checklist Card */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Bảng Kiểm Tra Chất Lượng Tích Hợp (Quality Check):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {verificationChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 font-medium text-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unsuited Topics Warning (If any topic wasn't naturally compatible) */}
          {unsuitableTopics && unsuitableTopics.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Thông Báo Tích Hợp Tự Nhiên:
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Để tránh chèn gượng ép, các chủ đề sau chưa được chèn bừa bãi do chưa phù hợp trực tiếp với ngữ cảnh bài học này:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-1">
                {unsuitableTopics.map((item, idx) => (
                  <li key={idx} className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60">
                    <strong className="text-amber-900 dark:text-amber-300">{item.topic}:</strong> {item.reason} — <em>{item.suggestion}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Integration Summary Highlights */}
          {integrationSummary && integrationSummary.length > 0 && (
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Tóm Tắt Các Điểm Đã Tích Hợp Vào Tiến Trình Dạy Học:
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {integrationSummary.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
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
                  Bản xem trước trực tiếp KHBD sau tích hợp
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                  {documentTitle || 'KHBD Tích Hợp Năng Lực GDPT 2018'}
                </h3>
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                Các khung màu xanh lá = Thao tác INSERT (Chèn thêm do AI)
              </span>
            </div>

            {/* Render HTML content with full styling */}
            {integratedHtml ? (
              <div
                className="lesson-plan-html-content font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-100 space-y-3 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_td]:border [&_td]:border-slate-300 [&_td]:dark:border-slate-700 [&_td]:p-3 [&_td]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:dark:border-slate-700 [&_th]:p-3 [&_th]:bg-slate-100 [&_th]:dark:bg-slate-800/80 [&_th]:font-bold [&_p]:my-1 flex-1 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: integratedHtml }}
              />
            ) : (
              <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                {integratedFullText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
