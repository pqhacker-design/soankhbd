import {
  EducationLevel,
  Grade,
  Subject,
  TextbookSeries,
  ReferenceDocument,
} from '../types';

export const EDUCATION_LEVELS: EducationLevel[] = ['Tiểu học', 'THCS', 'THPT'];

export const GRADES_BY_LEVEL: Record<EducationLevel, Grade[]> = {
  'Tiểu học': ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
  THCS: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'],
  THPT: ['Lớp 10', 'Lớp 11', 'Lớp 12'],
};

export const SUBJECTS_BY_LEVEL: Record<EducationLevel, Subject[]> = {
  'Tiểu học': [
    'Toán',
    'Tiếng Việt',
    'Tiếng Anh',
    'Tin học & Công nghệ',
    'Lịch sử và Địa lí',
    'Khoa học',
    'Đạo đức',
    'Âm nhạc',
    'Mỹ thuật',
    'Giáo dục thể chất',
    'Hoạt động trải nghiệm',
  ],
  THCS: [
    'Toán',
    'Ngữ văn',
    'Tiếng Anh',
    'Tin học',
    'KHTN (Khoa học tự nhiên)',
    'Lịch sử và Địa lí',
    'GDCD (Giáo dục công dân)',
    'Công nghệ',
    'Âm nhạc',
    'Mỹ thuật',
    'Giáo dục thể chất',
    'Hoạt động trải nghiệm, hướng nghiệp',
  ],
  THPT: [
    'Toán',
    'Ngữ văn',
    'Tiếng Anh',
    'Tin học',
    'Vật lí',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lí',
    'GDKT & PL (Giáo dục kinh tế và pháp luật)',
    'Công nghệ',
    'Âm nhạc',
    'Mỹ thuật',
    'Giáo dục thể chất',
    'GDQP-AN (Giáo dục quốc phòng và an ninh)',
    'Hoạt động trải nghiệm, hướng nghiệp',
  ],
};

export const TEXTBOOK_SERIES: TextbookSeries[] = [
  'Kết nối tri thức với cuộc sống',
  'Chân trời sáng tạo',
  'Cánh Diều',
  'Bộ sách khác / Tổng hợp',
];

export const QUALITIES_PRESETS = [
  { name: 'Yêu nước', desc: 'Yêu thiên nhiên, di sản, tự hào dân tộc' },
  { name: 'Nhân ái', desc: 'Yêu thương, tôn trọng, sẻ chia, tha thứ' },
  { name: 'Chăm chỉ', desc: 'Ham học hỏi, siêng năng lao động, tự giác' },
  { name: 'Trung thực', desc: 'Thật thà, thẳng thắn, bảo vệ lẽ phải' },
  { name: 'Trách nhiệm', desc: 'Chấp hành quy định, có trách nhiệm với bản thân, gia đình, xã hội' },
];

export const GENERAL_COMPETENCIES_PRESETS = [
  { name: 'Tự chủ và tự học', desc: 'Tự giác thực hiện nhiệm vụ học tập, chủ động khám phá' },
  { name: 'Giao tiếp và hợp tác', desc: 'Trình bày ý kiến rõ ràng, chủ động phối hợp nhóm' },
  { name: 'Giải quyết vấn đề và sáng tạo', desc: 'Phát hiện mâu thuẫn, đề xuất giải pháp mới' },
];

export const SPECIFIC_COMPETENCIES_PRESETS = [
  'Năng lực Toán học',
  'Năng lực Ngôn ngữ',
  'Năng lực Tin học & Số',
  'Năng lực Khoa học tự nhiên',
  'Năng lực Tìm hiểu Tự nhiên & Xã hội',
  'Năng lực Lịch sử & Địa lí',
  'Năng lực Công nghệ',
  'Năng lực Thẩm mỹ (Âm nhạc / Mỹ thuật)',
  'Năng lực Thể chất',
  'Năng lực Thể nghiệm & Trải nghiệm',
];

export const TEACHING_METHODS_PRESETS = [
  'Dạy học dự án',
  'Dạy học khám phá / Nghiên cứu',
  'Dạy học STEM / STEAM',
  'Trò chơi học tập',
  'Hợp tác nhóm',
  'Kỹ thuật KWL',
  'Khăn trải bàn',
  'Mảnh ghép',
  'Think - Pair - Share',
  'Trạm học tập (Station learning)',
  'Thảo luận / Tranh luận',
  'Nêu và giải quyết vấn đề',
  'Dạy học phân hóa',
  'Dạy học cá thể hóa',
  'Dạy học kết hợp (Blended Learning)',
  'Đóng vai / Mô phỏng',
];

export const TEACHING_TECHNIQUES_PRESETS = [
  'Brainstorming (Công não)',
  'XYZ (635)',
  'Fishbone (Xương cá)',
  'Sơ đồ tư duy (Mindmap)',
  'Gallery Walk (Triển lãm)',
  '5W1H',
  'Khăn trải bàn',
  'Mảnh ghép',
  'Lược đồ tư duy',
  'Các mảnh ghép thông tin',
];

export const ORGANIZATION_FORMS_PRESETS = [
  'Cá nhân',
  'Cặp đôi',
  'Nhóm nhỏ (3-5 HS)',
  'Cả lớp',
  'Ngoài trời / Thực địa',
  'Phòng máy / Lab',
  'Trực tuyến (Zoom/Teams)',
  'Dạy học kết hợp',
];

export const EQUIPMENTS_PRESETS = [
  'Máy chiếu (Projector)',
  'Tivi thông minh',
  'Máy tính / Laptop',
  'Điện thoại thông minh',
  'Internet / Wifi',
  'Phiếu học tập / Bảng nhóm',
  'Bảng phụ / Giấy A0, A1',
  'Video clip / Âm thanh',
  'Mô hình / Tranh ảnh minh họa',
  'Thiết bị thí nghiệm / Dụng cụ thực hành',
  'Thước kẻ, compa, bộ đồ dùng học tập',
];

export const INTEGRATED_TOPICS_PRESETS = [
  'Giáo dục địa phương',
  'Giáo dục bảo vệ môi trường',
  'Giáo dục tài chính',
  'An toàn giao thông',
  'Chuyển đổi số & Kỹ năng số',
  'Kỹ năng sống & Tự vệ',
  'Hướng nghiệp & Khởi nghiệp',
  'Giáo dục STEM / STEAM',
  'Giáo dục công dân số',
];

export const INTEGRATED_TOPICS_DETAILED = [
  { id: 'fin_edu', name: 'Giáo dục tài chính', desc: 'Quản lý ngân sách, mua sắm' },
  { id: 'stem_edu', name: 'Giáo dục STEM', desc: 'Tư duy thiết kế chế tạo' },
  { id: 'competency_eval', name: 'Đánh giá năng lực', desc: 'Mục tiêu định lượng kỹ năng' },
  { id: 'quality_eval', name: 'Đánh giá phẩm chất', desc: 'Theo dõi sự chăm chỉ, trách nhiệm' },
  { id: 'differentiated_teaching', name: 'Dạy học phân hóa', desc: 'Giao nhiệm vụ riêng biệt nâng cao' },
  { id: 'digital_competency', name: 'Năng lực số', desc: 'Bồi dưỡng 24 kỹ năng số' },
  { id: 'digital_trans', name: 'Chuyển đổi số', desc: 'Thiết bị số, TV thông minh, QR' },
  { id: 'local_edu', name: 'Giáo dục địa phương', desc: 'Liên kết di sản văn hóa vùng miền' },
  { id: 'defense_edu', name: 'Giáo dục quốc phòng và an ninh', desc: 'Lồng ghép quốc phòng, an ninh bản...' },
];

export interface SamplePlanEditModeOption {
  id: string;
  title: string;
  desc: string;
  reqNote: string;
  badgeColor: string;
}

export const SAMPLE_PLAN_EDIT_MODES: SamplePlanEditModeOption[] = [
  {
    id: 'mode_full',
    title: 'Tích hợp toàn diện vào giáo án mẫu',
    desc: 'Phân tích tài liệu Word tải lên ở Khu vực 4, giữ cấu trúc gốc và bổ sung đầy đủ các mục đã chọn ở Khu vực 3 - Nội dung tích hợp.',
    reqNote: '(Yêu cầu phải tải lên file giáo án mẫu .docx ở Khu vực 4)',
    badgeColor: 'bg-indigo-500',
  },
  {
    id: 'mode_ai',
    title: 'Chỉ bổ sung yếu tố trí tuệ nhân tạo (AI)',
    desc: 'Giữ nguyên sườn giáo án đính kèm, lồng ghép thêm học liệu số và các nhiệm vụ ứng dụng AI thông minh.',
    reqNote: '(Yêu cầu phải tải lên file giáo án mẫu .docx ở Khu vực 4)',
    badgeColor: 'bg-purple-500',
  },
  {
    id: 'mode_stem',
    title: 'Chỉ bổ sung tích hợp Giáo dục STEM',
    desc: 'Thiết kế bổ sung các hoạt động STEM trải nghiệm gắn với bài học có sẵn trong tài liệu.',
    reqNote: '(Yêu cầu phải tải lên file giáo án mẫu .docx ở Khu vực 4)',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 'mode_digital_competency',
    title: 'Chỉ bổ sung tích hợp Năng lực số',
    desc: 'Ghép nối các mục tiêu rèn luyện năng lực số được chỉ định vào các bước bài học gốc.',
    reqNote: '(Yêu cầu phải tải lên file giáo án mẫu .docx ở Khu vực 4)',
    badgeColor: 'bg-emerald-500',
  },
  {
    id: 'mode_digital_trans',
    title: 'Chỉ bổ sung công nghệ Chuyển đổi số',
    desc: 'Tăng cường trang thiết bị công nghệ số, Quiz, quét mã QR học tập vào sườn giáo án mẫu.',
    reqNote: '(Yêu cầu phải tải lên file giáo án mẫu .docx ở Khu vực 4)',
    badgeColor: 'bg-sky-500',
  },
];

export const DEFAULT_REFERENCE_DOCUMENTS: ReferenceDocument[] = [
  {
    id: 'doc-5512',
    title: 'Công văn 5512/BGDĐT-GDTrH về Xây dựng và thực hiện kế hoạch giáo dục',
    category: 'CongVan5512',
    filename: 'Cong_van_5512_BGDDT.pdf',
    uploadDate: '2021-12-18',
    fileSize: '1.2 MB',
    snippet: 'Hướng dẫn khung Kế hoạch bài dạy gồm 4 phần: I. Mục tiêu; II. Thiết bị dạy học và học liệu; III. Tiến trình dạy học (Hoạt động 1, 2, 3, 4); IV. Phụ lục.',
    contentText: `BỘ GIÁO DỤC VÀ ĐÀO TẠO - CÔNG VĂN 5512/BGDĐT-GDTrH
1. Khung Kế hoạch bài dạy (Giáo án) của giáo viên:
I. MỤC TIÊU:
1. Về kiến thức / Yêu cầu cần đạt.
2. Về năng lực: Năng lực chung và Năng lực đặc thù.
3. Về phẩm chất: Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm.
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
- Giáo viên chuẩn bị.
- Học sinh chuẩn bị.
III. TIẾN TRÌNH DẠY HỌC:
1. Hoạt động 1: Mở đầu (Khởi động, Tạo tình huống xuất phát)
2. Hoạt động 2: Hình thành kiến thức mới
3. Hoạt động 3: Luyện tập
4. Hoạt động 4: Vận dụng
Mỗi hoạt động gồm 4 bước: a) Chuyển giao nhiệm vụ; b) Thực hiện nhiệm vụ; c) Báo cáo, thảo luận; d) Kết luận, nhận định.`,
  },
  {
    id: 'doc-3535',
    title: 'Công văn 3535/BGDĐT-GDTH Hướng dẫn kế hoạch bài dạy cấp Tiểu học',
    category: 'CongVan3535',
    filename: 'Cong_van_3535_Tieu_Hoc.pdf',
    uploadDate: '2021-09-09',
    fileSize: '890 KB',
    snippet: 'Điều chỉnh cấu trúc bài dạy cấp Tiểu học linh hoạt, phát huy tính tích cực, trải nghiệm của học sinh tiểu học theo chương trình GDPT 2018.',
    contentText: `CÔNG VĂN 3535/BGDĐT-GDTH DÀNH CHO TIỂU HỌC:
Kế hoạch bài dạy do giáo viên thiết kế linh hoạt, đảm bảo đạt Yêu cầu cần đạt.
Gồm các hoạt động: Khởi động, Khám phá, Luyện tập - Thực hành, Vận dụng - Trải nghiệm.
Chú trọng quan sát, đánh giá thường xuyên theo Thông tư 27/2020/TT-BGDĐT.`,
  },
  {
    id: 'doc-tt22',
    title: 'Thông tư 22/2021/TT-BGDĐT Quy định về đánh giá học sinh THCS và THPT',
    category: 'ThongTu22',
    filename: 'Thong_tu_22_Danh_gia_HS.pdf',
    uploadDate: '2021-07-20',
    fileSize: '1.5 MB',
    snippet: 'Đánh giá bằng nhận xét và đánh giá bằng điểm số; kết hợp đánh giá thường xuyên và định kỳ; khuyến khích sử dụng Rubric và bảng kiểm.',
    contentText: `THÔNG TƯ 22/2021/TT-BGDĐT:
Đánh giá thường xuyên thực hiện trong quá trình dạy học thông qua hỏi đáp, viết, thuyết trình, thực hành, sản phẩm học tập, hồ sơ học tập.
Sử dụng câu hỏi gợi mở, bảng kiểm (Checklist), tiêu chí đánh giá (Rubric) để nhận xét sự tiến bộ của học sinh.`,
  },
];
