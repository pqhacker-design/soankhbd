import { FullLessonPlan } from '../types';

/**
 * Cleans dollar signs around pure numbers or simple expressions from prompt text
 * to prevent NotebookLM or AI Slide generators from mistaking numbers like 25, 37 for currency $25, $37.
 */
function cleanMathForPrompt(text: string): string {
  if (!text) return '';
  return text
    // Replace $25$ with 25
    .replace(/\$(\d+(?:[.,]\d+)?)\$/g, '$1')
    // Replace isolated $25 with 25
    .replace(/(^|[^\w$])\$(\d+(?:[.,]\d+)?)(?!\$)/g, '$1$2')
    // Replace 25$ with 25
    .replace(/(\d+(?:[.,]\d+)?)\$/g, '$1');
}

/**
 * Builds a highly structured, pedagogical prompt designed specifically for Google NotebookLM 
 * or Gemini / PowerPoint AI tools to create slides, Audio Overviews, and study guides based on a lesson plan.
 */
export function buildNotebookLMPrompt(plan: FullLessonPlan): string {
  const reqs = (plan.objectives?.requirementsToAchieve || []).map((r) => `- ${cleanMathForPrompt(r)}`).join('\n');
  const qualities = (plan.objectives?.qualities || []).map(cleanMathForPrompt).join(', ');
  const comps = [
    ...(plan.objectives?.generalCompetencies || []),
    ...(plan.objectives?.specificCompetencies || []),
  ].map(cleanMathForPrompt).join(', ');

  const activitiesText = (plan.activities || [])
    .map(
      (act, idx) => `
### HOẠT ĐỘNG ${idx + 1}: ${cleanMathForPrompt(act.name)} (${cleanMathForPrompt(act.duration)})
- **Mục tiêu:** ${cleanMathForPrompt(act.objective)}
- **Nội dung:** ${cleanMathForPrompt(act.content)}
- **Sản phẩm:** ${cleanMathForPrompt(act.product)}
- **Tiến trình thực hiện (CV 5512/3535):**
  + a) Chuyển giao nhiệm vụ: ${cleanMathForPrompt(act.implementation?.transfer || '')}
  + b) Thực hiện nhiệm vụ: ${cleanMathForPrompt(act.implementation?.execution || '')}
  + c) Báo cáo, thảo luận: ${cleanMathForPrompt(act.implementation?.reporting || '')}
  + d) Kết luận, nhận định: ${cleanMathForPrompt(act.implementation?.conclusion || '')}
`
    )
    .join('\n');

  const quizList = (plan.supplementaryMaterials?.quizQuestions || [])
    .map(
      (q, idx) => `
Câu ${idx + 1} [Mức độ: ${q.level}]: ${cleanMathForPrompt(q.question)}
   A. ${cleanMathForPrompt(q.options[0])}
   B. ${cleanMathForPrompt(q.options[1])}
   C. ${cleanMathForPrompt(q.options[2])}
   D. ${cleanMathForPrompt(q.options[3])}
   => Đáp án đúng: ${String.fromCharCode(65 + q.correctAnswer)} | Lời giải: ${cleanMathForPrompt(q.explanation)}`
    )
    .join('\n');

  return `YÊU CẦU NOTEBOOKLM TẠO SLIDE POWERPOINT BÀI GIẢNG & TỔNG HỢP NỘI DUNG SƯ PHẠM GDPT 2018

Bạn là Chuyên gia Thiết kế Bài giảng Điện tử PowerPoint & Cố vấn Sư phạm thuộc Bộ GD&ĐT Việt Nam.
Dựa trên Kế hoạch bài dạy (Giáo án) chuẩn Công văn 5512/3535 dưới đây, hãy xử lý nguồn dữ liệu và thực hiện các nhiệm vụ thiết kế bài giảng điện tử cho ứng dụng NotebookLM / Gemini AI:

================================================================================
I. HỒ SƠ BÀI DẠY (SOURCE DATA FOR NOTEBOOKLM)
================================================================================
• Môn học: ${plan.subject} - ${plan.grade} (Bộ sách: ${plan.textbook})
• Tên bài dạy: ${cleanMathForPrompt(plan.info.lessonTitle)}
• Chủ đề / Chương: ${cleanMathForPrompt(plan.info.topic || plan.info.lessonTitle)}
• Tiết số: ${plan.info.periodNumber} | Thời lượng: ${plan.info.duration}
• Đơn vị: ${plan.info.schoolName || 'Trường THCS/THPT'} | Giáo viên: ${plan.info.teacherName || 'Giáo viên Bộ môn'} | Tổ chuyên môn: ${plan.info.departmentName || ''}

1. MỤC TIÊU CẦN ĐẠT & NĂNG LỰC:
- Yêu cầu cần đạt:
${reqs || '- Nắm vững kiến thức trọng tâm bài học.'}
- Phẩm chất chủ yếu: ${qualities || 'Chăm chỉ, Trung thực, Trách nhiệm'}
- Năng lực phát triển: ${comps || 'Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề'}

2. TIẾN TRÌNH 4 HOẠT ĐỘNG BÀI DẠY (CV 5512/3535):
${activitiesText}

3. BỘ CÂU HỎI QUIZ CỦNG CỐ MA TRẬN 4 MỨC ĐỘ:
${quizList || '(Các câu hỏi trắc nghiệm củng cố tự động được trích xuất từ nội dung bài)'}

================================================================================
II. QUY TẮC BẮT BUỘC TRÁNH LỖI KÝ HIỆU TIỀN TỆ ($) TRÊN SLIDE VÀ SƠ ĐỒ:
================================================================================
- TUYỆT ĐỐI KHÔNG tự ý chèn ký hiệu Đô-la ($) trước hoặc sau các con số tự nhiên, kích thước hoặc phép tính số học (Ví dụ: Viết 25, 37, 63, 25 x 100 = 2500; KHÔNG ĐƯỢC viết $25, $37, $63).
- Mọi con số, số lượng, phương trình, kích thước cạnh/diện tích phải được thể hiện dưới dạng số thuần túy (hoặc kèm đơn vị đo Việt Nam như cm, m, kg), KHÔNG có ký hiệu $.
- Đảm bảo khi AI render hình ảnh / sơ đồ / slide không tự động thêm ký hiệu tiền tệ Đô-la vào con số.

================================================================================
III. YÊU CẦU BẠN (NOTEBOOKLM / AI POWERPOINT) THỰC HIỆN:
================================================================================

Task 1: THIẾT KẾ DÀN Ý SLIDE POWERPOINT BÀI GIẢNG (10 - 12 SLIDES)
Mỗi Slide cần trình bày chi tiết các mục:
1. [Tiêu đề Slide]: Ngắn gọn, nêu bật kiến thức trọng tâm.
2. [Nội dung chính - Bullet points]: Tối đa 3 - 4 ý ngắn gọn, súc tích, dùng từ khóa hành động.
3. [Gợi ý thiết kế Visual / Đồ họa / Sơ đồ]: Mô tả chi tiết hình ảnh, icon, sơ đồ tư duy hoặc bảng so sánh nên chèn vào slide (chú ý số tự nhiên không ghi $).
4. [Lời thoại / Lời giảng của Giáo viên (Speaker Notes)]: Kịch bản chi tiết lời GV nói trên lớp khi chiếu slide này, phong cách truyền cảm hứng, tương tác cao với học sinh.

Task 2: KỊCH BẢN NÓI AUDIO OVERVIEW (PODCAST BÀI GIẢNG NOTEBOOKLM)
Hãy biên soạn kịch bản thảo luận 2 người dẫn (Host A & Host B) tóm tắt sinh động toàn bộ bài học trong 3-5 phút:
- Host A đóng vai Giáo viên chuyên gia gợi mở kiến thức.
- Host B đóng vai Học sinh tò mò đặt câu hỏi thực tế.
- Tập trung làm nổi bật thông điệp bài học và ứng dụng thực tiễn.

Task 3: SƠ ĐỒ TƯ DUY & CÂU HỎI MỞ ĐÀO SÂU
- Trích xuất 1 Sơ đồ tư duy dạng văn bản (Mindmap text structure) tóm tắt toàn bộ bài.
- Đưa ra 3 câu hỏi tình huống thực tế để tổ chức cuộc thi tranh luận / thảo luận nhóm trên lớp.

================================================================================
HÃY BẮT ĐẦU TẠO DÀN Ý SLIDE POWERPOINT VÀ KỊCH BẢN BÀI GIẢNG CHI TIẾT THEO CÁC YÊU CẦU TRÊN.
`;
}

