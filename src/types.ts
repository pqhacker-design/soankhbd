export type EducationLevel = 'Tiểu học' | 'THCS' | 'THPT';

export type Subject =
  | 'Toán'
  | 'Ngữ văn'
  | 'Tiếng Anh'
  | 'Tin học'
  | 'Lịch sử'
  | 'Địa lí'
  | 'Lịch sử và Địa lí'
  | 'KHTN'
  | 'Vật lí'
  | 'Hóa học'
  | 'Sinh học'
  | 'GDCD'
  | 'Công nghệ'
  | 'Mỹ thuật'
  | 'Âm nhạc'
  | 'Thể dục'
  | 'Hoạt động trải nghiệm'
  | 'GDQP-AN'
  | string;

export type Grade =
  | 'Lớp 1'
  | 'Lớp 2'
  | 'Lớp 3'
  | 'Lớp 4'
  | 'Lớp 5'
  | 'Lớp 6'
  | 'Lớp 7'
  | 'Lớp 8'
  | 'Lớp 9'
  | 'Lớp 10'
  | 'Lớp 11'
  | 'Lớp 12';

export type TextbookSeries =
  | 'Kết nối tri thức với cuộc sống'
  | 'Chân trời sáng tạo'
  | 'Cánh Diều'
  | string;

export interface LessonInfo {
  lessonTitle: string;
  topic: string;
  periodNumber: string;
  numberOfPeriods?: number;
  duration: string;
  date: string;
  classGroup: string;
  schoolName?: string;
  teacherName?: string;
  departmentName?: string;
}

export interface LessonObjectives {
  qualities: string[];
  generalCompetencies: string[];
  specificCompetencies: string[];
  requirementsToAchieve: string[];
}

export interface TeachingMethodologies {
  methods: string[];
  techniques: string[];
  organizationForms: string[];
}

export interface EquipmentsAndMaterials {
  equipments: string[];
  materials: string[];
}

export type IntegratedTopic =
  | 'Giáo dục địa phương'
  | 'Giáo dục môi trường'
  | 'Giáo dục tài chính'
  | 'An toàn giao thông'
  | 'Chuyển đổi số & Kỹ năng số'
  | 'Kỹ năng sống'
  | 'Hướng nghiệp & Khởi nghiệp'
  | 'Giáo dục STEM / STEAM'
  | 'Giáo dục công dân số';

export interface StudentDifferentiation {
  weakSupport: string;
  averageSupport: string;
  advancedSupport: string;
  giftedSupport: string;
  specialNeedsSupport: string;
}

export interface ActivityImplementation {
  transfer: string; // a) Chuyển giao nhiệm vụ
  execution: string; // b) Thực hiện nhiệm vụ
  reporting: string; // c) Báo cáo, thảo luận
  conclusion: string; // d) Kết luận, nhận định
}

export interface LessonActivity {
  id: string;
  type: 'warmup' | 'knowledge' | 'practice' | 'application' | 'extension';
  name: string;
  duration: string;
  objective: string;
  content: string;
  product: string;
  implementation: ActivityImplementation;
  teacherRole: string;
  studentRole: string;
  promptsAndQuestions: string[];
  anticipatedSituations: string;
  supportMeasures: string;
}

export interface RubricLevel {
  criteria: string;
  level4: string; // Xuất sắc / Mức 4
  level3: string; // Tốt / Mức 3
  level2: string; // Đạt / Mức 2
  level1: string; // Cần cố gắng / Mức 1
}

export interface AssessmentMethod {
  type: string;
  details: string;
  rubrics?: RubricLevel[];
  checklistItems?: string[];
}

export interface Worksheet {
  id: string;
  title: string;
  instructions: string;
  questions: {
    id: string;
    number: number;
    text: string;
    spaceForAnswer: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
}

export interface PptSlide {
  slideNumber: number;
  title: string;
  mainPoints: string[];
  visualSuggestions: string;
  speakerNotes: string;
}

export interface GeneratedMaterials {
  worksheets?: Worksheet[];
  quizQuestions?: QuizQuestion[];
  pptSlides?: PptSlide[];
}

export interface FullLessonPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  level: EducationLevel;
  subject: Subject;
  grade: Grade;
  textbook: TextbookSeries;
  info: LessonInfo;
  objectives: LessonObjectives;
  methodologies: TeachingMethodologies;
  equipmentsAndMaterials: EquipmentsAndMaterials;
  integratedTopics: string[];
  differentiation: StudentDifferentiation;
  activities: LessonActivity[];
  assessment: AssessmentMethod;
  layoutFormat?: 'standard' | 'two_column' | 'three_column';
  supplementaryMaterials?: GeneratedMaterials;
  notes?: string;
}

export interface ReferenceDocument {
  id: string;
  title: string;
  category: 'CongVan5512' | 'CongVan3535' | 'CongVan2345' | 'ThongTu22' | 'ThongTu27' | 'Khac';
  filename: string;
  uploadDate: string;
  fileSize: string;
  snippet: string;
  contentText: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Giáo viên';
  school: string;
  avatarUrl: string;
}
