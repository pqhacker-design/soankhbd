import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { DEFAULT_REFERENCE_DOCUMENTS } from './src/data/presets';
import { ReferenceDocument } from './src/types';
import { cleanAndParseJson } from './src/utils/jsonRepair';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini Client using user-provided API key
function getGeminiClient(req: express.Request): GoogleGenAI {
  const userKey = (req.headers['x-user-api-key'] as string) || req.body?.userApiKey || '';
  const activeKey = userKey.trim();

  if (!activeKey) {
    throw new Error('MISSING_API_KEY: Mỗi giáo viên cần cấu hình Gemini API Key cá nhân của mình. Vui lòng bấm "Cấu hình API Key" ở góc trên giao diện để nhập mã API Key cá nhân.');
  }

  return new GoogleGenAI({
    apiKey: activeKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory documents library for demonstration & RAG Q&A
let documentsLibrary: ReferenceDocument[] = [...DEFAULT_REFERENCE_DOCUMENTS];

// API: Validate Gemini API Key
app.post('/api/validate-api-key', async (req, res) => {
  try {
    const ai = getGeminiClient(req);
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Respond with "OK" if this key is active.',
    });
    res.json({ success: true, message: 'Gemini API Key kết nối thành công!' });
  } catch (error: any) {
    console.error('API Key validation error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Mã API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.',
    });
  }
});

// API: Get reference documents
app.get('/api/documents', (req, res) => {
  res.json({ documents: documentsLibrary });
});

// API: Upload reference document
app.post('/api/documents/upload', (req, res) => {
  const { title, category, filename, contentText, snippet } = req.body;
  const newDoc: ReferenceDocument = {
    id: `doc-${Date.now()}`,
    title: title || 'Tài liệu hướng dẫn mới',
    category: category || 'Khac',
    filename: filename || 'tai_lieu.pdf',
    uploadDate: new Date().toISOString().split('T')[0],
    fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    snippet: snippet || (contentText ? contentText.slice(0, 150) + '...' : 'Trích đoạn nội dung tài liệu...'),
    contentText: contentText || 'Nội dung chi tiết văn bản hướng dẫn chuyên môn...',
  };
  documentsLibrary.unshift(newDoc);
  res.json({ success: true, document: newDoc });
});

// API: Delete reference document
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  documentsLibrary = documentsLibrary.filter((d) => d.id !== id);
  res.json({ success: true });
});

// API: Extract Learning Objectives from Uploaded Document/Image (PDF, PNG, JPG)
app.post('/api/extract-objectives', async (req, res) => {
  try {
    const ai = getGeminiClient(req);
    const { fileBase64, mimeType, fileName, textContent, subject, grade, textbook } = req.body;

    let contents: any[] = [];

    const promptText = `
Bạn là Chuyên gia Đánh giá Chuẩn Cần Đạt Giáo Dục Phổ Thông 2018 Việt Nam.
Hãy phân tích tài liệu/ảnh chụp trang sách giáo khoa hoặc bài học dưới đây (Môn: ${subject || 'Chung'}, Lớp: ${grade || 'Chung'}, Bộ sách: ${textbook || 'GDPT 2018'}).

Nhiệm vụ của bạn:
1. Nhận diện Tên Bài Học & Chủ đề/Chương (nếu có trong tài liệu/ảnh).
2. Trích xuất chi tiết "Yêu Cầu Cần Đạt" (Học sinh thực hiện/nhận biết/vận dụng/giải quyết được những gì chuẩn mực).
3. Đề xuất các Phẩm chất chủ yếu & Năng lực chung/đặc thù phù hợp nhất với bài học này.

Tài liệu văn bản bổ sung (nếu có): ${textContent || 'Không có'}

HÃY TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON VỚI CẤU TRÚC SAU:
{
  "lessonTitle": "Tên bài học nhận diện được (hoặc để trống nếu không thấy)",
  "topic": "Chủ đề / Chương nhận diện được",
  "requirementsToAchieve": "Mô tả chi tiết, rõ ràng các Yêu cầu cần đạt chuẩn GDPT 2018 cho bài học này...",
  "suggestedQualities": ["Chăm chỉ", "Trung thực"],
  "suggestedGeneralCompetencies": ["Tự chủ và tự học", "Giao tiếp và hợp tác"],
  "suggestedSpecificCompetencies": ["Năng lực đặc thù tương ứng"]
}
`;

    if (fileBase64 && mimeType) {
      const base64Clean = fileBase64.replace(/^data:[^;]+;base64,/, '');
      contents = [
        {
          inlineData: {
            data: base64Clean,
            mimeType: mimeType,
          },
        },
        promptText,
      ];
    } else {
      contents = [promptText];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    res.json({ success: true, extractedData: cleanAndParseJson(jsonText) });
  } catch (error: any) {
    console.error('Error extracting objectives:', error);
    const isMissing = error.message?.includes('MISSING_API_KEY');
    res.status(isMissing ? 400 : 500).json({
      success: false,
      apiKeyRequired: isMissing,
      error: error.message || 'Lỗi khi trích xuất Yêu cầu cần đạt từ tài liệu',
    });
  }
});

// API: AI Lesson Plan Generator
app.post('/api/generate-lesson-plan', async (req, res) => {
  try {
    const ai = getGeminiClient(req);
    const {
      level,
      subject,
      grade,
      textbook,
      info,
      qualities,
      generalCompetencies,
      specificCompetencies,
      requirementsToAchieve,
      methods,
      techniques,
      organizationForms,
      equipments,
      materials,
      integratedTopics,
      differentiation,
      customNote,
      sampleFileBase64,
      sampleMimeType,
      sampleFileName,
      sampleEditMode,
    } = req.body;

    // Attach active BGD&ĐT reference guidelines context
    const docsContext = documentsLibrary
      .map((d) => `[${d.title}]: ${d.snippet}`)
      .join('\n');

    const numberOfPeriods = info?.numberOfPeriods || 1;

    let sampleInstruction = '';
    if (sampleEditMode && sampleEditMode !== 'none') {
      const modeTitles: Record<string, string> = {
        mode_full: 'TÍCH HỢP TOÀN DIỆN VÀO GIÁO ÁN MẪU (Phân tích tài liệu đính kèm, giữ cấu trúc gốc và bổ sung đầy đủ các tiêu chí tích hợp)',
        mode_ai: 'BỔ SUNG YẾU TỐ TRÍ TUỆ NHÂN TẠO - AI (Giữ nguyên sườn giáo án đính kèm, lồng ghép học liệu số & nhiệm vụ ứng dụng AI thông minh)',
        mode_stem: 'BỔ SUNG TÍCH HỢP GIÁO DỤC STEM (Thiết kế bổ sung các hoạt động STEM trải nghiệm gắn với bài học trong tài liệu gốc)',
        mode_digital_competency: 'BỔ SUNG TÍCH HỢP NĂNG LỰC SỐ (Ghép nối các mục tiêu rèn luyện 24 kỹ năng số vào các bước bài học gốc)',
        mode_digital_trans: 'BỔ SUNG CÔNG NGHỆ CHUYỂN ĐỔI SỐ (Tăng cường thiết bị công nghệ số, Quiz, quét mã QR học tập vào sườn giáo án)',
      };

      sampleInstruction = `
================================================================================
YÊU CẦU ĐẶC BIỆT: CHỈNH SỬA / TÍCH HỢP BỔ SUNG VÀO GIÁO ÁN MẪU ĐƯỢC TẢI LÊN (${sampleFileName || 'Tài liệu Word/PDF .docx'}):
- CHẾ ĐỘ CHỌN: ${modeTitles[sampleEditMode] || sampleEditMode}
- BẠN BẮT BUỘC BÁM SÁT SƯỜN CẤU TRÚC, NỘI DUNG VÀ TIẾN TRÌNH CỦA TÀI LIỆU GIÁO ÁN MẪU ĐƯỢC TẢI LÊN TRONG TỆP ĐÍNH KÈM.
- BỔ SUNG & TÍCH HỢP SÂU CÁC TIÊU CHÍ SAU VÀO TỪNG TIẾN TRÌNH HOẠT ĐỘNG: ${(integratedTopics || []).join(', ')}
- ĐẢM BẢO SỰ HÀI HÒA, KHÔNG LÀM XÁO TRỘN KIẾN THỨC NỀN CỦA BÀI HỌC GỐC NHƯNG LÀM NỔI BẬT NĂNG LỰC VÀ YẾU TỐ TÍCH HỢP MỚI.
================================================================================
`;
    }

    const prompt = `
Bạn là Chuyên gia Giáo dục Phổ thông Việt Nam hàng đầu, am hiểu sâu sắc Chương trình GDPT 2018 và các văn bản hướng dẫn mới nhất của Bộ Giáo dục và Đào tạo (Công văn 5512/BGDĐT-GDTrH đối với THCS/THPT, Công văn 3535/BGDĐT-GDTH đối với Tiểu học, Thông tư 22/2021/TT-BGDĐT, Thông tư 27/2020/TT-BGDĐT).

Hãy soạn/chỉnh sửa một KẾ HOẠCH BÀI DẠY (GIÁO ÁN) hoàn chỉnh, chuẩn mực chuyên môn cao, linh hoạt theo đúng thông tin sau:
${sampleInstruction}
- Cấp học: ${level}
- Lớp: ${grade}
- Môn học: ${subject}
- Bộ sách: ${textbook}
- Tên bài dạy / Chủ đề: ${info?.lessonTitle || 'Bài học mới'}
- Số tiết thực hiện bài học: ${numberOfPeriods} tiết (Tổng thời lượng: ${numberOfPeriods * 45} phút)
- Tiết số trong phân phối chương trình: ${info?.periodNumber || '1'}
- Trường: ${info?.schoolName || 'Trường THCS/THPT'}
- Giáo viên: ${info?.teacherName || 'Giáo viên bộ môn'}

ĐẶC BIỆT CHÚ Ý VỀ SỐ TIẾT (${numberOfPeriods} TIẾT):
- Vui lòng phân bổ tiến trình bài dạy thành các hoạt động tương ứng với ${numberOfPeriods} tiết học một cách hợp lý và khoa học.
- Mỗi hoạt động cần ghi rõ phân bổ thời gian và tiết học tương ứng (Ví dụ: [Tiết 1] Hoạt động 1: Mở đầu; [Tiết 1] Hoạt động 2: Hình thành kiến thức...; [Tiết 2] Hoạt động 3: Luyện tập...).

MỤC TIÊU CẦN ĐẠT & NĂNG LỰC CẦN PHÁT TRIỂN:
- Phẩm chất: ${(qualities || []).join(', ')}
- Năng lực chung: ${(generalCompetencies || []).join(', ')}
- Năng lực đặc thù: ${(specificCompetencies || []).join(', ')}
- Yêu cầu cần đạt: ${(requirementsToAchieve || []).join(', ')}

PHƯƠNG PHÁP & THIẾT BỊ:
- Phương pháp dạy học: ${(methods || []).join(', ')}
- Kỹ thuật dạy học: ${(techniques || []).join(', ')}
- Hình thức tổ chức: ${(organizationForms || []).join(', ')}
- Thiết bị dạy học: ${(equipments || []).join(', ')}
- Học liệu: ${(materials || []).join(', ')}
- Nội dung tích hợp: ${(integratedTopics || []).join(', ')}

HƯỚNG DẪN THAM CHIẾU CÁC VĂN BẢN QUY ĐỊNH BGD&ĐT:
${docsContext}

HƯỚNG DẪN ĐỊNH DẠNG CÔNG THỨC TOÁN HỌC / KHOA HỌC:
- CHỈ kẹp dấu $ đối với các công thức, phương trình, phân số, căn thức, chỉ số hoặc ký hiệu toán học phức tạp (Ví dụ: $x = \frac{-b \pm \sqrt{\Delta}}{2a}$, $S = \pi r^2$, $a^2 + b^2 = c^2$, $\frac{a}{b}$).
- QUAN TRỌNG: TUYỆT ĐỐI KHÔNG kẹp dấu $ quanh các con số tự nhiên, kích thước, hình học hoặc phép tính số học đơn giản (Ví dụ: Viết 25, 37, 63, 25 x 100 = 2500; KHÔNG ĐƯỢC viết $25$, $37$, $63$ hay $25$ vì sẽ bị AI thiết kế Slide/NotebookLM hiểu nhầm thành số tiền tệ Đô-la $25, $37).

Ghi chú/Yêu cầu bổ sung từ giáo viên: ${customNote || 'Tạo tiến trình dạy học sinh động, chi tiết, phù hợp tâm lý lứa tuổi.'}

HÃY TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON ĐÚNG ĐỊNH DẠNG SAU:
{
  "id": "lp-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "updatedAt": "${new Date().toISOString()}",
  "level": "${level}",
  "subject": "${subject}",
  "grade": "${grade}",
  "textbook": "${textbook}",
  "info": {
    "lessonTitle": "${info?.lessonTitle || ''}",
    "topic": "${info?.topic || ''}",
    "periodNumber": "${info?.periodNumber || '1'}",
    "numberOfPeriods": ${numberOfPeriods},
    "duration": "${numberOfPeriods * 45} phút (${numberOfPeriods} tiết)",
    "date": "${info?.date || new Date().toISOString().split('T')[0]}",
    "classGroup": "${info?.classGroup || grade}",
    "schoolName": "${info?.schoolName || ''}",
    "teacherName": "${info?.teacherName || ''}",
    "departmentName": "${info?.departmentName || ''}"
  },
  "objectives": {
    "qualities": ["danh sách chuỗi phẩm chất cụ thể..."],
    "generalCompetencies": ["danh sách năng lực chung..."],
    "specificCompetencies": ["danh sách năng lực đặc thù..."],
    "requirementsToAchieve": ["chi tiết yêu cầu cần đạt theo chuẩn GDPT 2018..."]
  },
  "methodologies": {
    "methods": ["danh sách phương pháp..."],
    "techniques": ["danh sách kỹ thuật..."],
    "organizationForms": ["danh sách hình thức tổ chức..."]
  },
  "equipmentsAndMaterials": {
    "equipments": ["danh sách thiết bị..."],
    "materials": ["danh sách học liệu..."]
  },
  "integratedTopics": ["danh sách chủ đề tích hợp..."],
  "differentiation": {
    "weakSupport": "Biện pháp hỗ trợ học sinh cần hỗ trợ / yếu kém...",
    "averageSupport": "Hướng dẫn đối với học sinh trung bình...",
    "advancedSupport": "Nhiệm vụ nâng cao cho học sinh khá...",
    "giftedSupport": "Thử thách sáng tạo cho học sinh giỏi/năng khiếu...",
    "specialNeedsSupport": "Hỗ trợ học sinh có nhu cầu đặc biệt (nếu có)..."
  },
  "activities": [
    {
      "id": "act-1",
      "type": "warmup",
      "name": "Hoạt động 1: Mở đầu / Khởi động",
      "duration": "5-7 phút",
      "objective": "Mục tiêu cụ thể của hoạt động 1...",
      "content": "Nội dung học sinh thực hiện (ví dụ: tham gia trò chơi, trả lời câu hỏi mở đầu)...",
      "product": "Sản phẩm dự kiến của học sinh (câu trả lời, thái độ hào hứng)...",
      "implementation": {
        "transfer": "a) Chuyển giao nhiệm vụ: GV trình chiếu/nêu câu hỏi/thể lệ trò chơi...",
        "execution": "b) Thực hiện nhiệm vụ: HS làm việc cá nhân/nhóm...",
        "reporting": "c) Báo cáo, thảo luận: Đại diện HS trả lời, các HS khác nhận xét...",
        "conclusion": "d) Kết luận, nhận định: GV chốt đáp án, nhận xét thái độ và dẫn dắt vào bài mới..."
      },
      "teacherRole": "Vai trò điều phối, gợi mở của giáo viên",
      "studentRole": "Vai trò chủ động, tích cực của học sinh",
      "promptsAndQuestions": ["Câu hỏi gợi mở 1", "Câu hỏi gợi mở 2"],
      "anticipatedSituations": "Tình huống dự kiến HS trả lời chưa chính xác và cách xử lý...",
      "supportMeasures": "Gợi ý đối với học sinh lúng túng..."
    },
    {
      "id": "act-2",
      "type": "knowledge",
      "name": "Hoạt động 2: Hình thành kiến thức mới",
      "duration": "18-20 phút",
      "objective": "Mục tiêu chiếm lĩnh kiến thức trọng tâm...",
      "content": "Nội dung khám phá kiến thức...",
      "product": "Sản phẩm ghi chép, phiếu học tập hoàn thành...",
      "implementation": {
        "transfer": "a) Chuyển giao nhiệm vụ...",
        "execution": "b) Thực hiện nhiệm vụ...",
        "reporting": "c) Báo cáo, thảo luận...",
        "conclusion": "d) Kết luận, nhận định..."
      },
      "teacherRole": "GV hướng dẫn, tổ chức trạm/nhóm...",
      "studentRole": "HS đọc SGK, thảo luận nhóm...",
      "promptsAndQuestions": ["Câu hỏi tư duy 1", "Câu hỏi phát hiện 2"],
      "anticipatedSituations": "Tình huống thắc mắc của HS...",
      "supportMeasures": "Phiếu trợ giúp cho nhóm yếu..."
    },
    {
      "id": "act-3",
      "type": "practice",
      "name": "Hoạt động 3: Luyện tập",
      "duration": "10-12 phút",
      "objective": "Củng cố, rèn luyện kỹ năng giải bài tập/thực hành...",
      "content": "Bài tập/Nhiệm vụ thực hành...",
      "product": "Lời giải/Bài làm chính xác...",
      "implementation": {
        "transfer": "a) Chuyển giao nhiệm vụ...",
        "execution": "b) Thực hiện nhiệm vụ...",
        "reporting": "c) Báo cáo, thảo luận...",
        "conclusion": "d) Kết luận, nhận định..."
      },
      "teacherRole": "GV quan sát, chấm bài mẫu...",
      "studentRole": "HS làm bài tập cá nhân/cặp đôi...",
      "promptsAndQuestions": ["Câu hỏi củng cố 1", "Bài tập nhanh 2"],
      "anticipatedSituations": "HS làm sai lỗi phổ biến...",
      "supportMeasures": "GV chữa lỗi sai mẫu..."
    },
    {
      "id": "act-4",
      "type": "application",
      "name": "Hoạt động 4: Vận dụng",
      "duration": "5-8 phút",
      "objective": "Vận dụng kiến thức vào giải quyết vấn đề thực tiễn...",
      "content": "Nhiệm vụ liên hệ thực tế/đời sống...",
      "product": "Phương án giải quyết vấn đề, ý tưởng thực tiễn...",
      "implementation": {
        "transfer": "a) Chuyển giao nhiệm vụ...",
        "execution": "b) Thực hiện nhiệm vụ...",
        "reporting": "c) Báo cáo, thảo luận...",
        "conclusion": "d) Kết luận, nhận định..."
      },
      "teacherRole": "GV định hướng thực tiễn...",
      "studentRole": "HS liên hệ đời sống...",
      "promptsAndQuestions": ["Câu hỏi thực tế 1"],
      "anticipatedSituations": "HS thiếu vốn sống...",
      "supportMeasures": "GV đưa thêm ví dụ minh họa..."
    }
  ],
  "assessment": {
    "type": "Đánh giá thường xuyên qua quan sát, sản phẩm học tập và câu hỏi củng cố",
    "details": "GV nhận xét tuyên dương thái độ hợp tác nhóm, chấm điểm sản phẩm phiếu học tập và kiểm tra nhanh.",
    "rubrics": [
      {
        "criteria": "Thái độ tham gia hoạt động nhóm",
        "level4": "Chủ động, tích cực dẫn dắt nhóm, hỗ trợ bạn nhiệt tình",
        "level3": "Tham gia tích cực, hoàn thành tốt nhiệm vụ được giao",
        "level2": "Có tham gia nhưng cần sự nhắc nhở của giáo viên",
        "level1": "Uể ả, chưa chú ý thực hiện nhiệm vụ nhóm"
      },
      {
        "criteria": "Chất lượng sản phẩm học tập",
        "level4": "Chính xác tuyệt đối, sáng tạo, trình bày khoa học",
        "level3": "Chính xác, đầy đủ các yêu cầu cơ bản",
        "level2": "Còn 1-2 sai sót nhỏ, trình bày tạm ổn",
        "level1": "Chưa hoàn thành sản phẩm hoặc sai sót nhiều"
      }
    ]
  }
}
`;

    const geminiContents: any[] = [];
    if (sampleFileBase64) {
      const cleanBase64 = sampleFileBase64.replace(/^data:.*?;base64,/, '');
      geminiContents.push({
        inlineData: {
          mimeType: sampleMimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          data: cleanBase64,
        },
      });
    }
    geminiContents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: geminiContents.length === 1 ? prompt : geminiContents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    const lessonPlanData = cleanAndParseJson(jsonText);
    res.json({ success: true, lessonPlan: lessonPlanData });
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    const isMissing = error.message?.includes('MISSING_API_KEY');
    res.status(isMissing ? 400 : 500).json({
      success: false,
      apiKeyRequired: isMissing,
      error: error.message || 'Lỗi khi tạo Kế hoạch bài dạy bằng AI',
    });
  }
});

// API: Generate Supplementary Materials (Worksheets, Quizzes, Slides Outline)
app.post('/api/generate-materials', async (req, res) => {
  try {
    const ai = getGeminiClient(req);
    const { lessonTitle, subject, grade, textbook, promptType } = req.body;

    const prompt = `
Bạn là Chuyên gia thiết kế học liệu giáo dục Việt Nam.
Hãy tạo bộ học liệu bổ trợ chuyên sâu cho bài dạy: "${lessonTitle}" (Môn ${subject}, ${grade}, Bộ sách ${textbook}).

Yêu cầu sinh loại học liệu: "${promptType || 'all'}" (gồm Phiếu học tập Worksheet, Bộ câu hỏi Quiz trắc nghiệm củng cố có đáp án + giải thích theo 4 mức độ nhận thức, và Dàn ý Slide PowerPoint bài giảng).

LƯU Ý VỀ CÔNG THỨC TOÁN HỌC / KHOA HỌC:
- Mọi công thức, phân số, phương trình hoặc ký hiệu toán học phức tạp viết dạng LaTeX kẹp giữa $ (Ví dụ: $x = \frac{-b \pm \sqrt{\Delta}}{2a}$, $a^2 + b^2 = c^2$).
- KHÔNG kẹp $ quanh các con số tự nhiên hoặc phép tính thuần túy (viết 25, 37, 63, KHÔNG viết $25$ hay $37$).

Trả về định dạng JSON duy nhất:
{
  "worksheets": [
    {
      "id": "ws-1",
      "title": "PHIẾU HỌC TẬP SỐ 1: KHÁM PHÁ KIẾN THỨC BÀI ${lessonTitle}",
      "instructions": "Học sinh đọc kỹ thông tin và hoàn thành các câu hỏi dưới đây trong 10 phút.",
      "questions": [
        { "id": "q1", "number": 1, "text": "Nội dung câu hỏi 1...", "spaceForAnswer": "Trống 4 dòng để trả lời..." },
        { "id": "q2", "number": 2, "text": "Nội dung câu hỏi 2...", "spaceForAnswer": "Trống 5 dòng để trả lời..." }
      ]
    }
  ],
  "quizQuestions": [
    {
      "id": "quiz-1",
      "question": "Câu hỏi kiểm tra nhận biết...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 0,
      "explanation": "Giải thích chi tiết vì sao A đúng...",
      "level": "Nhận biết"
    },
    {
      "id": "quiz-2",
      "question": "Câu hỏi thông hiểu/vận dụng...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 1,
      "explanation": "Giải thích chi tiết...",
      "level": "Thông hiểu"
    },
    {
      "id": "quiz-3",
      "question": "Câu hỏi vận dụng cao...",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 2,
      "explanation": "Giải thích chi tiết...",
      "level": "Vận dụng cao"
    }
  ],
  "pptSlides": [
    {
      "slideNumber": 1,
      "title": "Slide 1: Trang tiêu đề Bài ${lessonTitle}",
      "mainPoints": ["Tên bài dạy", "Tên giáo viên & Lớp dạy", "Hình ảnh minh họa gây chú ý"],
      "visualSuggestions": "Hình ảnh chất lượng cao liên quan chủ đề bài học",
      "speakerNotes": "GV nhiệt liệt chào mừng học sinh và giới thiệu bài học."
    },
    {
      "slideNumber": 2,
      "title": "Slide 2: Khởi động & Tạo không khí",
      "mainPoints": ["Câu hỏi/Trò chơi mở đầu", "Thể lệ tham gia"],
      "visualSuggestions": "Biểu tượng đồng hồ đếm ngược 3 phút",
      "speakerNotes": "GV tổ chức hoạt động sôi nổi."
    },
    {
      "slideNumber": 3,
      "title": "Slide 3: Kiến thức trọng tâm",
      "mainPoints": ["Khái niệm chính", "Hình vẽ/Sơ đồ tư duy"],
      "visualSuggestions": "Sơ đồ khối liên kết",
      "speakerNotes": "GV chốt kiến thức cốt lõi."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    res.json({ success: true, materials: cleanAndParseJson(jsonText) });
  } catch (error: any) {
    console.error('Error generating materials:', error);
    const isMissing = error.message?.includes('MISSING_API_KEY');
    res.status(isMissing ? 400 : 500).json({
      success: false,
      apiKeyRequired: isMissing,
      error: error.message || 'Lỗi khi tạo học liệu bổ trợ',
    });
  }
});

// API: Refine Specific Activity with AI
app.post('/api/refine-activity', async (req, res) => {
  try {
    const ai = getGeminiClient(req);
    const { activity, instruction } = req.body;

    const prompt = `
Bạn là Chuyên gia Đổi mới Phương pháp Dạy học.
Dưới đây là thông tin một Hoạt động dạy học hiện tại:
${JSON.stringify(activity, null, 2)}

Yêu cầu cải tiến của giáo viên: "${instruction}" (Ví dụ: Thêm yếu tố STEM, tăng cường tính tương tác nhóm, bổ sung tình huống ứng biến cho học sinh yếu, v.v.)

Hãy trả về duy nhất đối tượng JSON Hoạt động dạy học mới đã được tinh chỉnh hoàn hảo, đúng cấu trúc:
{
  "id": "${activity.id}",
  "type": "${activity.type}",
  "name": "${activity.name}",
  "duration": "${activity.duration}",
  "objective": "Mục tiêu đã tinh chỉnh...",
  "content": "Nội dung...",
  "product": "Sản phẩm...",
  "implementation": {
    "transfer": "a) Chuyển giao...",
    "execution": "b) Thực hiện...",
    "reporting": "c) Báo cáo...",
    "conclusion": "d) Kết luận..."
  },
  "teacherRole": "...",
  "studentRole": "...",
  "promptsAndQuestions": ["..."],
  "anticipatedSituations": "...",
  "supportMeasures": "..."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const jsonText = response.text || '{}';
    res.json({ success: true, activity: cleanAndParseJson(jsonText) });
  } catch (error: any) {
    console.error('Error refining activity:', error);
    const isMissing = error.message?.includes('MISSING_API_KEY');
    res.status(isMissing ? 400 : 500).json({
      success: false,
      apiKeyRequired: isMissing,
      error: error.message || 'Lỗi khi tinh chỉnh hoạt động',
    });
  }
});

// API: AI Q&A Reference Advisor
app.post('/api/chat-reference', async (req, res) => {
  try {
    const ai = getGeminiClient(req);
    const { query, history } = req.body;

    const docsText = documentsLibrary
      .map((d) => `--- [Nguồn tài liệu: ${d.title}] ---\n${d.contentText}`)
      .join('\n\n');

    const prompt = `
Bạn là Trợ lý AI Chuyên tư vấn Kế hoạch bài dạy & Quy định Giáo dục Việt Nam.
Bạn căn cứ chính xác vào các Văn bản quy định của Bộ GD&ĐT bên dưới (Công văn 5512, Công văn 3535, Thông tư 22, Thông tư 27) để giải đáp thắc mắc cho giáo viên.

TÀI LIỆU VĂN BẢN TRUY XUẤT:
${docsText}

Lịch sử trò chuyện trước đó: ${JSON.stringify(history || [])}
Câu hỏi mới của giáo viên: "${query}"

Hãy trả lời bằng tiếng Việt văn minh, mạch lạc, dễ hiểu, dẫn chứng rõ điều/khoản/công văn có liên quan và đưa ra lời khuyên thực tiễn giúp giáo viên ứng dụng tốt nhất.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error('Error in chat-reference:', error);
    const isMissing = error.message?.includes('MISSING_API_KEY');
    res.status(isMissing ? 400 : 500).json({
      success: false,
      apiKeyRequired: isMissing,
      error: error.message || 'Lỗi khi hỏi đáp AI',
    });
  }
});

// Vite Middleware & Production Static Serving
async function startServer() {
  if (process.env.VERCEL) {
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Lesson Planner Pro Việt Nam Server running at http://localhost:${PORT}`);
  });
}

startServer();

export default app;

