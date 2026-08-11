import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers,
  CheckSquare,
  Wand2,
  ChevronRight,
  ChevronLeft,
  Info,
  Sliders,
  Award,
  Users,
  Tv,
  Puzzle,
  RefreshCw,
  Zap,
  Upload,
  FileText,
  Image,
  Clock,
  Loader2,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  EducationLevel,
  Grade,
  Subject,
  TextbookSeries,
  FullLessonPlan,
} from '../types';
import {
  EDUCATION_LEVELS,
  GRADES_BY_LEVEL,
  SUBJECTS_BY_LEVEL,
  TEXTBOOK_SERIES,
  QUALITIES_PRESETS,
  GENERAL_COMPETENCIES_PRESETS,
  SPECIFIC_COMPETENCIES_PRESETS,
  TEACHING_METHODS_PRESETS,
  TEACHING_TECHNIQUES_PRESETS,
  ORGANIZATION_FORMS_PRESETS,
  EQUIPMENTS_PRESETS,
  INTEGRATED_TOPICS_PRESETS,
  INTEGRATED_TOPICS_DETAILED,
  SAMPLE_PLAN_EDIT_MODES,
} from '../data/presets';
import { getApiKeyHeaders } from '../utils/apiHelper';

interface PlannerWizardProps {
  onPlanGenerated: (plan: FullLessonPlan) => void;
}

export const PlannerWizard: React.FC<PlannerWizardProps> = ({ onPlanGenerated }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  // Form State
  const [level, setLevel] = useState<EducationLevel>('THCS');
  const [grade, setGrade] = useState<Grade>('Lớp 7');
  const [subject, setSubject] = useState<Subject>('Toán');
  const [textbook, setTextbook] = useState<TextbookSeries>('Kết nối tri thức với cuộc sống');

  const [lessonTitle, setLessonTitle] = useState<string>('Biểu thức đại số và Bảng tần số');
  const [topic, setTopic] = useState<string>('Chương IV: Một số yếu tố Thống kê và Xác suất');
  const [periodNumber, setPeriodNumber] = useState<string>('Tiết 28');
  const [numberOfPeriods, setNumberOfPeriods] = useState<number>(1);
  const [duration, setDuration] = useState<string>('45 phút (1 tiết)');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classGroup, setClassGroup] = useState<string>('7A1');
  const [schoolName, setSchoolName] = useState<string>('Trường THCS Nguyễn Du');
  const [teacherName, setTeacherName] = useState<string>('Nguyễn Văn An');
  const [departmentName, setDepartmentName] = useState<string>('Tổ Toán - Tự Nhiên');
  const [layoutFormat, setLayoutFormat] = useState<'standard' | 'two_column' | 'three_column'>('standard');

  // AI Document Extraction State
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState<boolean>(false);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);

  const handleObjectiveFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingDoc(true);
    setUploadedDocName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const payload = {
          fileBase64: base64Data,
          mimeType: file.type || 'image/jpeg',
          fileName: file.name,
          subject,
          grade,
          textbook,
        };

        let extractedData: any = null;

        try {
          const res = await fetch('/api/extract-objectives', {
            method: 'POST',
            headers: getApiKeyHeaders(),
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.extractedData) {
              extractedData = data.extractedData;
            }
          }
        } catch (serverErr) {
          console.warn('Server endpoint error, using client-side Gemini fallback:', serverErr);
        }

        if (!extractedData) {
          try {
            const { extractObjectivesDirect } = await import('../utils/clientGeminiService');
            extractedData = await extractObjectivesDirect(payload);
          } catch (clientErr: any) {
            console.error('Client fallback extraction error:', clientErr);
          }
        }

        if (extractedData) {
          const ext = extractedData;
          if (ext.requirementsToAchieve) {
            setRequirementsToAchieveText(ext.requirementsToAchieve);
          }
          if (ext.lessonTitle && !lessonTitle) {
            setLessonTitle(ext.lessonTitle);
          }
          if (ext.topic && !topic) {
            setTopic(ext.topic);
          }
          if (Array.isArray(ext.suggestedQualities) && ext.suggestedQualities.length > 0) {
            setSelectedQualities((prev) => Array.from(new Set([...prev, ...ext.suggestedQualities])));
          }
          if (Array.isArray(ext.suggestedGeneralCompetencies) && ext.suggestedGeneralCompetencies.length > 0) {
            setSelectedGeneralCompetencies((prev) => Array.from(new Set([...prev, ...ext.suggestedGeneralCompetencies])));
          }
          if (Array.isArray(ext.suggestedSpecificCompetencies) && ext.suggestedSpecificCompetencies.length > 0) {
            setSelectedSpecificCompetencies((prev) => Array.from(new Set([...prev, ...ext.suggestedSpecificCompetencies])));
          }
          alert(`Đã tự động trích xuất Yêu cầu cần đạt & mục tiêu từ tài liệu "${file.name}" thành công!`);
        } else {
          alert('Không thể trích xuất thông tin từ tài liệu. Vui lòng kiểm tra lại API Key hoặc file đính kèm.');
        }
        setIsAnalyzingDoc(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi đọc file.');
      setIsAnalyzingDoc(false);
    }
  };

  // Objectives State
  const [selectedQualities, setSelectedQualities] = useState<string[]>([
    'Chăm chỉ',
    'Trung thực',
    'Trách nhiệm',
  ]);
  const [selectedGeneralCompetencies, setSelectedGeneralCompetencies] = useState<string[]>([
    'Tự chủ và tự học',
    'Giao tiếp và hợp tác',
    'Giải quyết vấn đề và sáng tạo',
  ]);
  const [selectedSpecificCompetencies, setSelectedSpecificCompetencies] = useState<string[]>([
    'Năng lực Toán học',
    'Năng lực Tin học & Số',
  ]);
  const [requirementsToAchieveText, setRequirementsToAchieveText] = useState<string>(
    'Học sinh nhận biết được khái niệm biểu thức đại số, lập được bảng tần số cho dãy số liệu đơn giản và vận dụng được vào giải quyết bài toán thực tiễn.'
  );

  // Methodologies State
  const [selectedMethods, setSelectedMethods] = useState<string[]>([
    'Trò chơi học tập',
    'Hợp tác nhóm',
    'Dạy học khám phá / Nghiên cứu',
  ]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([
    'Brainstorming (Công não)',
    'Sơ đồ tư duy (Mindmap)',
  ]);
  const [selectedOrgForms, setSelectedOrgForms] = useState<string[]>([
    'Nhóm nhỏ (3-5 HS)',
    'Cả lớp',
  ]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([
    'Máy chiếu (Projector)',
    'Phiếu học tập / Bảng nhóm',
    'Máy tính / Laptop',
  ]);

  // Integrated Topics State
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([
    'Giáo dục tài chính',
    'Giáo dục STEM',
    'Đánh giá năng lực',
    'Đánh giá phẩm chất',
    'Năng lực số',
    'Chuyển đổi số',
  ]);

  // Sample Lesson Plan Editing / Integration State
  const [sampleFileName, setSampleFileName] = useState<string>('');
  const [sampleFileBase64, setSampleFileBase64] = useState<string>('');
  const [sampleMimeType, setSampleMimeType] = useState<string>('');
  const [sampleEditMode, setSampleEditMode] = useState<string>('mode_full');

  const [customNote, setCustomNote] = useState<string>(
    'Thiết kế bài dạy sinh động, giữ cấu trúc bài dạy gốc, lồng ghép thêm học liệu số và hoạt động trải nghiệm.'
  );

  const handleSampleDocxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSampleFileName(file.name);
    setSampleMimeType(file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSampleFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // Level & Grade change handler
  const handleLevelChange = (newLevel: EducationLevel) => {
    setLevel(newLevel);
    const availableGrades = GRADES_BY_LEVEL[newLevel];
    if (availableGrades.length > 0) {
      setGrade(availableGrades[0]);
    }
    const availableSubjects = SUBJECTS_BY_LEVEL[newLevel];
    if (availableSubjects.length > 0) {
      setSubject(availableSubjects[0]);
    }
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  // Submit & Call Express Server API
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress('Đang kết nối AI Gemini 3.6 & Phân tích chuẩn GDPT 2018...');

    const payload = {
      level,
      subject,
      grade,
      textbook,
      info: {
        lessonTitle,
        topic,
        periodNumber,
        numberOfPeriods,
        duration,
        date,
        classGroup,
        schoolName,
        teacherName,
        departmentName,
      },
      qualities: selectedQualities,
      generalCompetencies: selectedGeneralCompetencies,
      specificCompetencies: selectedSpecificCompetencies,
      requirementsToAchieve: [requirementsToAchieveText],
      methods: selectedMethods,
      techniques: selectedTechniques,
      organizationForms: selectedOrgForms,
      equipments: selectedEquipments,
      materials: ['SGK', 'Phiếu học tập'],
      integratedTopics: selectedIntegrations,
      customNote,
      sampleFileBase64,
      sampleMimeType,
      sampleFileName,
      sampleEditMode,
    };

    let generatedPlan: any = null;
    let errorMessage = '';

    try {
      setTimeout(() => setGenerationProgress('Đang sinh 4 thành phần mục tiêu & Năng lực đặc thù...'), 1200);
      setTimeout(() => setGenerationProgress('Đang thiết kế tiến trình 5 Hoạt động theo CV 5512/3535...'), 2800);
      setTimeout(() => setGenerationProgress('Đang tạo phiếu hỗ trợ phân hóa học sinh & Rubric đánh giá...'), 4500);

      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: getApiKeyHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.lessonPlan) {
          generatedPlan = data.lessonPlan;
        } else {
          errorMessage = data.error || '';
        }
      } else {
        try {
          const data = await response.json();
          errorMessage = data.error || '';
        } catch {
          // Response is not JSON
        }
      }
    } catch (serverErr) {
      console.warn('Server endpoint error, attempting client-side fallback:', serverErr);
    }

    if (!generatedPlan) {
      try {
        const { generateLessonPlanDirect } = await import('../utils/clientGeminiService');
        generatedPlan = await generateLessonPlanDirect(payload);
      } catch (clientErr: any) {
        console.error('Client Gemini generation error:', clientErr);
        if (!errorMessage) {
          errorMessage = clientErr.message || 'Lỗi khi tạo bài dạy bằng AI.';
        }
      }
    }

    if (generatedPlan) {
      onPlanGenerated({
        ...generatedPlan,
        layoutFormat: layoutFormat,
      });
    } else {
      alert('Lỗi tạo bài dạy: ' + (errorMessage || 'Vui lòng kiểm tra lại Gemini API Key hoặc thử lại!'));
    }

    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 saas-card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
              Soạn Kế Hoạch Bài Dạy Chuẩn Công Văn 5512 / 3535
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Nhập thông tin yêu cầu, AI Gemini 3.6 sẽ tự động sinh giáo án hoàn chỉnh 100% chuẩn quy định.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#244F70] dark:text-blue-300 bg-[#EAF3F8] dark:bg-[#244F70]/30 px-3.5 py-1.5 rounded-full border border-[#244F70]/20 dark:border-blue-500/30 self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-amber-500" /> Bước {currentStep} / 4
          </div>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-200/80 dark:border-slate-800 pt-4">
          {[
            { step: 1, label: 'Thông tin chung' },
            { step: 2, label: 'Mục tiêu & Năng lực' },
            { step: 3, label: 'Phương pháp & Thiết bị' },
            { step: 4, label: 'Tích hợp & Phân hóa' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`text-left p-2.5 rounded-xl transition-all ${
                currentStep === s.step
                  ? 'bg-[#244F70] text-white font-bold shadow-xs'
                  : currentStep > s.step
                  ? 'bg-[#EAF3F8] dark:bg-slate-800 text-[#244F70] dark:text-slate-300 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-medium'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Bước {s.step}</div>
              <div className="text-xs truncate">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: GENERAL LESSON INFO */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <GraduationCap className="w-5 h-5 text-[#244F70] dark:text-blue-400" />
            1. Khung Chương Trình &amp; Thông Tin Tiết Dạy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cấp Học
              </label>
              <select
                value={level}
                onChange={(e) => handleLevelChange(e.target.value as EducationLevel)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Khối Lớp
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              >
                {GRADES_BY_LEVEL[level].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Môn Học
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              >
                {SUBJECTS_BY_LEVEL[level].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bộ Sách Giáo Khoa
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {TEXTBOOK_SERIES.map((tb) => (
                <button
                  key={tb}
                  type="button"
                  onClick={() => setTextbook(tb)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    textbook === tb
                      ? 'border-[#244F70] bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 ring-2 ring-[#244F70]/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {tb}
                </button>
              ))}
            </div>
          </div>

          {/* Formats Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hình Thức Trình Bày Giáo Án (Định Dạng Bảng)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'standard',
                  title: '1. Tiêu chuẩn (CV 5512)',
                  desc: 'Trình bày dạng đoạn văn nối tiếp chuẩn CV 5512 (Mục tiêu, Thiết bị, Tiến trình 5 hoạt động).',
                },
                {
                  id: 'two_column',
                  title: '2. Dạng Bảng 2 Cột',
                  desc: 'Cột 1: Tiến trình Hoạt động GV & HS | Cột 2: Sản phẩm & Nội dung dung học tập.',
                },
                {
                  id: 'three_column',
                  title: '3. Dạng Bảng 3 Cột',
                  desc: 'Cột 1: Hoạt động của GV | Cột 2: Hoạt động của HS | Cột 3: Nội dung & Sản phẩm.',
                },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setLayoutFormat(fmt.id as any)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between space-y-1.5 ${
                    layoutFormat === fmt.id
                      ? 'border-[#244F70] bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 ring-2 ring-[#244F70]/20 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold">{fmt.title}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{fmt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Số tiết cho bài học */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#244F70]" />
                Số Tiết Thực Hiện Bài Học <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-[#244F70] dark:text-blue-400 font-medium">
                AI sẽ tự động phân bổ tiến trình bài dạy tương ứng số tiết chọn
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { count: 1, label: '1 Tiết', time: '45 phút' },
                { count: 2, label: '2 Tiết', time: '90 phút' },
                { count: 3, label: '3 Tiết', time: '135 phút' },
                { count: 4, label: '4 Tiết', time: '180 phút' },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => {
                    setNumberOfPeriods(item.count);
                    setDuration(`${item.time} (${item.count} tiết)`);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    numberOfPeriods === item.count
                      ? 'border-[#244F70] bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 font-bold ring-2 ring-[#244F70]/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-[11px] opacity-75 font-normal mt-0.5">{item.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin Trường, Giáo viên */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-[#244F70] dark:text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#244F70]" />
              Thông Tin Đơn Vị &amp; Giáo Viên
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Trường / Đơn Vị
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Ví dụ: Trường THCS Nguyễn Du"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ &amp; Tên Giáo Viên
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tổ Chuyên Môn
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="Ví dụ: Tổ Toán - Tự Nhiên"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên Bài Học / Bài Dạy <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Ví dụ: Biểu thức đại số và Bảng tần số..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Chủ Đề / Chương
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Chương IV: Một số yếu tố Thống kê..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tiết Số
              </label>
              <input
                type="text"
                value={periodNumber}
                onChange={(e) => setPeriodNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Thời Lượng
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Lớp Dạy
              </label>
              <input
                type="text"
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ngày Dạy
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: OBJECTIVES & COMPETENCIES */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Award className="w-5 h-5 text-teal-600" />
            2. Tích Hợp Phẩm Chất &amp; Năng Lực Theo GDPT 2018
          </h2>

          {/* Phẩm chất */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Phẩm Chất Chủ Yếu
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {QUALITIES_PRESETS.map((q) => {
                const isSelected = selectedQualities.includes(q.name);
                return (
                  <button
                    key={q.name}
                    type="button"
                    onClick={() => toggleArrayItem(selectedQualities, setSelectedQualities, q.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#244F70] bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckSquare className={`w-4 h-4 ${isSelected ? 'text-[#244F70]' : 'text-slate-300'}`} />
                      {q.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{q.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Năng lực chung */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Năng Lực Cốt Lõi / Năng Lực Chung
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {GENERAL_COMPETENCIES_PRESETS.map((gc) => {
                const isSelected = selectedGeneralCompetencies.includes(gc.name);
                return (
                  <button
                    key={gc.name}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(selectedGeneralCompetencies, setSelectedGeneralCompetencies, gc.name)
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckSquare className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-300'}`} />
                      {gc.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{gc.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Năng lực đặc thù */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Năng Lực Đặc Thù Môn Học
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIFIC_COMPETENCIES_PRESETS.map((sc) => {
                const isSelected = selectedSpecificCompetencies.includes(sc);
                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(selectedSpecificCompetencies, setSelectedSpecificCompetencies, sc)
                    }
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF] dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Yêu cầu cần đạt chi tiết */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Yêu Cầu Cần Đạt Chi Tiết
              </label>
              <span className="text-[11px] text-[#244F70] dark:text-blue-400 font-medium">
                Tải file bài học để AI tự nhận biết hoặc gõ thủ công
              </span>
            </div>

            {/* Document Upload Card */}
            <div className="bg-[#EAF3F8] dark:bg-slate-800/80 border border-[#244F70]/20 dark:border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#244F70] dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#6C63FF]" />
                    Tự Động Trích Xuất Bằng AI Từ Sách Giáo Khoa / PDF
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Tải lên ảnh chụp trang sách (JPG, PNG) hoặc file PDF bài học, AI Gemini 3.6 sẽ tự quét &amp; điền chuẩn xác Yêu cầu cần đạt.
                  </p>
                </div>
                {isAnalyzingDoc && (
                  <div className="flex items-center gap-1.5 bg-[#244F70] text-white text-[11px] font-bold px-3 py-1.5 rounded-full animate-pulse shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang nhận dạng...
                  </div>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#244F70]/30 dark:border-slate-700 hover:border-[#244F70] bg-white dark:bg-slate-900 p-3 rounded-xl cursor-pointer transition-all text-xs font-semibold text-[#244F70] dark:text-blue-300">
                <Upload className="w-4 h-4 text-[#244F70]" />
                <span>
                  {uploadedDocName
                    ? `📄 File đã tải: ${uploadedDocName} (Bấm để chọn file khác)`
                    : 'Thả hoặc Tải lên file Ảnh SGK (JPG, PNG) hoặc tài liệu PDF bài học'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleObjectiveFileUpload}
                  className="hidden"
                  disabled={isAnalyzingDoc}
                />
              </label>
            </div>

            <textarea
              rows={4}
              value={requirementsToAchieveText}
              onChange={(e) => setRequirementsToAchieveText(e.target.value)}
              placeholder="Nhập hoặc bổ sung Yêu cầu cần đạt cụ thể..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
            />
          </div>
        </div>
      )}

      {/* STEP 3: METHODOLOGIES & EQUIPMENTS */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-7 animate-fadeIn">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Puzzle className="w-5 h-5 text-amber-600" />
            3. Phương Pháp, Kỹ Thuật Dạy Học &amp; Thiết Bị
          </h2>

          {/* Phương pháp dạy học */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Puzzle className="w-4 h-4 text-amber-600" />
                Phương Pháp Dạy Học Chủ Đạo
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Đã chọn: <strong className="text-amber-700 dark:text-amber-400">{selectedMethods.length}</strong> phương pháp
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {TEACHING_METHODS_PRESETS.map((m) => {
                const isSelected = selectedMethods.includes(m);
                return (
                  <div
                    key={m}
                    onClick={() => toggleArrayItem(selectedMethods, setSelectedMethods, m)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 shrink-0 pointer-events-none"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {m}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kỹ thuật dạy học */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" />
                Kỹ Thuật Dạy Học Tích Cực
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Đã chọn: <strong className="text-indigo-700 dark:text-indigo-400">{selectedTechniques.length}</strong> kỹ thuật
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {TEACHING_TECHNIQUES_PRESETS.map((t) => {
                const isSelected = selectedTechniques.includes(t);
                return (
                  <div
                    key={t}
                    onClick={() => toggleArrayItem(selectedTechniques, setSelectedTechniques, t)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 shrink-0 pointer-events-none"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {t}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thiết bị dạy học */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-sky-600" />
                Thiết Bị Dạy Học &amp; Học Liệu Số
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Đã chọn: <strong className="text-sky-700 dark:text-sky-400">{selectedEquipments.length}</strong> thiết bị
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {EQUIPMENTS_PRESETS.map((eq) => {
                const isSelected = selectedEquipments.includes(eq);
                return (
                  <div
                    key={eq}
                    onClick={() => toggleArrayItem(selectedEquipments, setSelectedEquipments, eq)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 shrink-0 pointer-events-none"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {eq}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: INTEGRATED TOPICS & GENERATION */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 saas-card-shadow space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-[#6C63FF]" />
            4. Tích Hợp Chủ Đề, Phân Hóa &amp; Hoàn Thiện Bài Dạy
          </h2>

          {/* Tích hợp chủ đề */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Lồng Ghép &amp; Tích Hợp Nâng Cao (STEM, Tài chính, Chuyển đổi số)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INTEGRATED_TOPICS_PRESETS.map((it) => {
                const isSelected = selectedIntegrations.includes(it);
                return (
                  <button
                    key={it}
                    type="button"
                    onClick={() => toggleArrayItem(selectedIntegrations, setSelectedIntegrations, it)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-[#244F70] bg-[#EAF3F8] dark:bg-[#244F70]/30 text-[#244F70] dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <CheckSquare className={`w-4 h-4 ${isSelected ? 'text-[#244F70]' : 'text-slate-300'}`} />
                      {it}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* File mẫu giáo án đính kèm */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#244F70]" />
                File Giáo Án Mẫu Đính Kèm (Không Bắt Buộc)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Hỗ trợ .docx, .pdf, .txt</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#244F70] bg-white dark:bg-slate-900 p-3.5 rounded-xl cursor-pointer transition-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Upload className="w-4 h-4 text-[#244F70]" />
                <span className="truncate">
                  {sampleFileName ? `📄 ${sampleFileName}` : 'Chọn file Word / PDF mẫu để AI học phong cách'}
                </span>
                <input
                  type="file"
                  accept=".docx,.pdf,.txt"
                  onChange={handleSampleDocxUpload}
                  className="hidden"
                />
              </label>

              <select
                value={sampleEditMode}
                onChange={(e) => setSampleEditMode(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
              >
                {SAMPLE_PLAN_EDIT_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ghi chú tùy chỉnh cho AI */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ghi Chú Hoặc Yêu Cầu Tùy Chỉnh Cho AI (Prompting Custom)
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ví dụ: Thiết kế trò chơi khởi động sôi nổi, lồng ghép ví dụ thực tế môn Toán với Sinh học..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244F70]/20"
            />
          </div>

          {/* Action Call / Progress */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {isGenerating ? (
              <div className="bg-[#EAF3F8] dark:bg-slate-800/90 border border-[#244F70]/20 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#244F70] text-white flex items-center justify-center animate-spin">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  ✨ AI Gemini 3.6 đang xây dựng bài dạy...
                </h3>
                <p className="text-xs text-[#244F70] dark:text-blue-300 font-semibold animate-pulse">
                  {generationProgress}
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#244F70] h-full w-3/4 animate-pulse rounded-full" />
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-[#244F70] to-[#193B55] hover:from-[#193B55] hover:to-[#122A3D] text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-[#244F70]/20 hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                TẠO KẾ HOẠCH BÀI DẠY HOÀN CHỈNH BẰNG AI GEMINI 3.6
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons Row */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentStep === 1 || isGenerating}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Quay Lại
        </button>

        {currentStep < 4 && (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
            className="flex items-center gap-2 bg-[#244F70] hover:bg-[#193B55] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Tiếp Theo <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
