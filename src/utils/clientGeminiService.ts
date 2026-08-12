import { GoogleGenAI } from '@google/genai';
import { getUserApiKey } from './apiHelper';
import { DEFAULT_REFERENCE_DOCUMENTS } from '../data/presets';
import { cleanAndParseJson } from './jsonRepair';

export function getClientGemini(customKey?: string): GoogleGenAI {
  const apiKey = (customKey || getUserApiKey()).trim();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY: Vui lòng nhập mã Gemini API Key cá nhân trong phần Cấu Hình Kết Nối API.');
  }
  return new GoogleGenAI({ apiKey });
}

export function formatGeminiError(err: any): string {
  if (!err) return 'Lỗi hệ thống Gemini AI. Vui lòng thử lại sau.';
  let msg = typeof err === 'string' ? err : err.message || '';

  if (!msg && typeof err === 'object') {
    try {
      msg = JSON.stringify(err);
    } catch {
      msg = '';
    }
  }

  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('Spikes in demand')) {
    return 'Hệ thống AI Gemini hiện đang quá tải tạm thời từ phía Google (Mã lỗi 503). Đã tự động thử lại. Thầy/cô vui lòng bấm thử lại sau vài giây!';
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Tài khoản Gemini API Key của thầy/cô đã vượt quá hạn mức lưu lượng (Mã 429). Vui lòng đợi 1 phút hoặc kiểm tra lại hạn mức API Key.';
  }
  if (msg.includes('MISSING_API_KEY') || msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
    return 'Mã Gemini API Key cá nhân chưa đúng hoặc chưa được thiết lập. Vui lòng kiểm tra lại trong phần Cấu Hình API Key.';
  }

  if (msg.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.error?.message) {
        return formatGeminiError(parsed.error.message);
      }
    } catch {
      // ignore
    }
  }

  return msg || 'Lỗi xử lý AI. Vui lòng thử lại sau.';
}

export async function generateContentWithRetryDirect(
  ai: GoogleGenAI,
  params: {
    model?: string;
    contents: any;
    config?: any;
  },
  maxRetries = 1
): Promise<any> {
  const requestedModel = (params.model && params.model !== 'gemini-3.6-flash') ? params.model : 'gemini-2.5-flash';
  const modelsToTry = [
    requestedModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;

  for (const modelName of uniqueModels) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        }

        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });

        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = typeof err === 'object' ? JSON.stringify(err) : String(err);
        const errMsg = err.message || errStr;

        if (errMsg.includes('MISSING_API_KEY') || errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
          throw new Error(formatGeminiError(err));
        }

        // If model doesn't exist or not supported, break out immediately to try next model
        if (errMsg.includes('not found') || errMsg.includes('404') || errMsg.includes('INVALID_ARGUMENT') || errMsg.includes('is not supported')) {
          console.warn(`[Client Gemini Retry] Model ${modelName} not supported/not found, trying next model...`);
          break;
        }

        console.warn(`[Client Gemini Retry] Model ${modelName} attempt ${attempt + 1} error: ${errMsg.slice(0, 150)}`);
      }
    }
  }

  throw new Error(formatGeminiError(lastError));
}

export async function validateApiKeyDirect(apiKey: string): Promise<boolean> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return false;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    return res.ok;
  } catch (e) {
    console.warn('Direct fetch validation failed:', e);
    // Fallback attempt using SDK if fetch fails
    try {
      const ai = getClientGemini(cleanKey);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Ping',
      });
      return !!response.text;
    } catch {
      return false;
    }
  }
}

export async function generateLessonPlanDirect(payload: any): Promise<any> {
  const ai = getClientGemini();
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
  } = payload;

  const numberOfPeriods = info?.numberOfPeriods || 1;

  let sampleInstruction = '';
  if (sampleEditMode && sampleEditMode !== 'none') {
    const modeTitles: Record<string, string> = {
      mode_full: 'TÍCH HỢP TOÀN DIỆN VÀO GIÁO ÁN MẪU',
      mode_ai: 'BỔ SUNG YẾU TỐ TRÍ TUỆ NHÂN TẠO - AI',
      mode_stem: 'BỔ SUNG TÍCH HỢP GIÁO DỤC STEM',
      mode_digital_competency: 'BỔ SUNG TÍCH HỢP NĂNG LỰC SỐ',
      mode_digital_trans: 'BỔ SUNG CÔNG NGHỆ CHUYỂN ĐỔI SỐ',
    };

    sampleInstruction = `
YÊU CẦU ĐẶC BIỆT: CHỈNH SỬA / TÍCH HỢP BỔ SUNG VÀO GIÁO ÁN MẪU ĐƯỢC TẢI LÊN (${sampleFileName || 'Tài liệu Word .docx'}):
- CHẾ ĐỘ CHỌN: ${modeTitles[sampleEditMode] || sampleEditMode}
- BẠN BẮT BUỘC BÁM SÁT SƯỜN CẤU TRÚC VÀ TIẾN TRÌNH CỦA GIÁO ÁN MẪU ĐÍNH KÈM.
- BỔ SUNG & TÍCH HỢP SÂU CÁC TIÊU CHÍ: ${(integratedTopics || []).join(', ')}
`;
  }

  const prompt = `
Bạn là Chuyên gia Giáo dục Phổ thông Việt Nam hàng đầu, am hiểu sâu sắc Chương trình GDPT 2018 (Công văn 5512/BGDĐT-GDTrH, Công văn 3535/BGDĐT-GDTH).

Hãy soạn/chỉnh sửa một KẾ HOẠCH BÀI DẠY (GIÁO ÁN) hoàn chỉnh:
${sampleInstruction}
- Cấp học: ${level}
- Lớp: ${grade}
- Môn học: ${subject}
- Bộ sách: ${textbook}
- Tên bài dạy / Chủ đề: ${info?.lessonTitle || 'Bài học mới'}
- Số tiết thực hiện: ${numberOfPeriods} tiết (${numberOfPeriods * 45} phút)
- Tiết số: ${info?.periodNumber || '1'}
- Trường: ${info?.schoolName || 'Trường THCS/THPT'}
- Giáo viên: ${info?.teacherName || 'Giáo viên bộ môn'}

MỤC TIÊU CẦN ĐẠT:
- Phẩm chất: ${(qualities || []).join(', ')}
- Năng lực chung: ${(generalCompetencies || []).join(', ')}
- Năng lực đặc thù: ${(specificCompetencies || []).join(', ')}
- Yêu cầu cần đạt: ${(requirementsToAchieve || []).join(', ')}

PHƯƠNG PHÁP & THIẾT BỊ:
- Phương pháp: ${(methods || []).join(', ')}
- Kỹ thuật: ${(techniques || []).join(', ')}
- Hình thức tổ chức: ${(organizationForms || []).join(', ')}
- Thiết bị: ${(equipments || []).join(', ')}
- Học liệu: ${(materials || []).join(', ')}
- Nội dung tích hợp: ${(integratedTopics || []).join(', ')}

HƯỚNG DẪN ĐỊNH DẠNG CÔNG THỨC TOÁN HỌC:
- CHỈ kẹp dấu $ đối với công thức, phương trình, phân số LaTeX (Ví dụ: $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$, $a^2 + b^2 = c^2$).
- KHÔNG kẹp $ quanh con số tự nhiên (viết 25, 37, 63, KHÔNG viết $25$).

Ghi chú: ${customNote || 'Tạo tiến trình dạy học sinh động.'}

TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON VỚI CẤU TRÚC:
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
    "qualities": ["chuỗi phẩm chất..."],
    "generalCompetencies": ["chuỗi năng lực chung..."],
    "specificCompetencies": ["chuỗi năng lực đặc thù..."],
    "requirementsToAchieve": ["chi tiết yêu cầu cần đạt..."]
  },
  "methodologies": {
    "methods": ["danh sách phương pháp..."],
    "techniques": ["danh sách kỹ thuật..."],
    "organizationForms": ["danh sách hình thức..."]
  },
  "equipmentsAndMaterials": {
    "equipments": ["danh sách thiết bị..."],
    "materials": ["danh sách học liệu..."]
  },
  "integratedTopics": ["danh sách chủ đề tích hợp..."],
  "differentiation": {
    "weakSupport": "Hỗ trợ học sinh yếu...",
    "averageSupport": "Hướng dẫn học sinh trung bình...",
    "advancedSupport": "Nhiệm vụ nâng cao khá...",
    "giftedSupport": "Thử thách sáng tạo học sinh giỏi...",
    "specialNeedsSupport": "Nhu cầu đặc biệt..."
  },
  "activities": [
    {
      "id": "act-1",
      "type": "warmup",
      "name": "Hoạt động 1: Mở đầu / Khởi động",
      "duration": "5-7 phút",
      "objective": "Mục tiêu hoạt động 1...",
      "content": "Nội dung...",
      "product": "Sản phẩm...",
      "implementation": {
        "transfer": "a) Chuyển giao...",
        "execution": "b) Thực hiện...",
        "reporting": "c) Báo cáo...",
        "conclusion": "d) Kết luận..."
      },
      "teacherRole": "Vai trò GV...",
      "studentRole": "Vai trò HS...",
      "promptsAndQuestions": ["Câu hỏi 1"],
      "anticipatedSituations": "Tình huống dự kiến...",
      "supportMeasures": "Biện pháp hỗ trợ..."
    },
    {
      "id": "act-2",
      "type": "knowledge",
      "name": "Hoạt động 2: Hình thành kiến thức mới",
      "duration": "18-20 phút",
      "objective": "Mục tiêu hoạt động 2...",
      "content": "Nội dung...",
      "product": "Sản phẩm...",
      "implementation": {
        "transfer": "a) Chuyển giao...",
        "execution": "b) Thực hiện...",
        "reporting": "c) Báo cáo...",
        "conclusion": "d) Kết luận..."
      },
      "teacherRole": "GV hướng dẫn...",
      "studentRole": "HS khám phá...",
      "promptsAndQuestions": ["Câu hỏi 1"],
      "anticipatedSituations": "Thắc mắc...",
      "supportMeasures": "Trợ giúp..."
    },
    {
      "id": "act-3",
      "type": "practice",
      "name": "Hoạt động 3: Luyện tập",
      "duration": "10-12 phút",
      "objective": "Củng cố...",
      "content": "Bài tập...",
      "product": "Lời giải...",
      "implementation": {
        "transfer": "a) Chuyển giao...",
        "execution": "b) Thực hiện...",
        "reporting": "c) Báo cáo...",
        "conclusion": "d) Kết luận..."
      },
      "teacherRole": "GV quan sát...",
      "studentRole": "HS làm bài...",
      "promptsAndQuestions": ["Bài tập 1"],
      "anticipatedSituations": "Lỗi sai...",
      "supportMeasures": "Chữa lỗi..."
    },
    {
      "id": "act-4",
      "type": "application",
      "name": "Hoạt động 4: Vận dụng",
      "duration": "5-8 phút",
      "objective": "Vận dụng thực tế...",
      "content": "Nhiệm vụ thực tế...",
      "product": "Phương án...",
      "implementation": {
        "transfer": "a) Chuyển giao...",
        "execution": "b) Thực hiện...",
        "reporting": "c) Báo cáo...",
        "conclusion": "d) Kết luận..."
      },
      "teacherRole": "GV định hướng...",
      "studentRole": "HS liên hệ...",
      "promptsAndQuestions": ["Câu hỏi thực tế"],
      "anticipatedSituations": "Tình huống...",
      "supportMeasures": "Gợi ý..."
    }
  ],
  "assessment": {
    "type": "Đánh giá thường xuyên",
    "details": "GV nhận xét tuyên dương thái độ...",
    "rubrics": [
      {
        "criteria": "Thái độ tham gia nhóm",
        "level4": "Chủ động, tích cực",
        "level3": "Tham gia đầy đủ",
        "level2": "Cần nhắc nhở",
        "level1": "Chưa chú ý"
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

  const response = await generateContentWithRetryDirect(ai, {
    model: 'gemini-2.5-flash',
    contents: geminiContents.length === 1 ? prompt : geminiContents,
    config: { responseMimeType: 'application/json' },
  });

  return cleanAndParseJson(response.text || '{}');
}

export async function extractObjectivesDirect(payload: any): Promise<any> {
  const ai = getClientGemini();
  const { fileBase64, mimeType, textContent, subject, grade, textbook } = payload;

  const promptText = `
Bạn là Chuyên gia Đánh giá Chuẩn Cần Đạt GDPT 2018 Việt Nam.
Hãy phân tích tài liệu/ảnh chụp (Môn: ${subject || 'Chung'}, Lớp: ${grade || 'Chung'}, Bộ sách: ${textbook || 'GDPT 2018'}).
Tài liệu bổ sung: ${textContent || 'Không'}

TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON:
{
  "lessonTitle": "Tên bài học nhận diện được",
  "topic": "Chủ đề / Chương",
  "requirementsToAchieve": "Mô tả chi tiết Yêu cầu cần đạt...",
  "suggestedQualities": ["Chăm chỉ", "Trung thực"],
  "suggestedGeneralCompetencies": ["Tự chủ và tự học", "Giao tiếp và hợp tác"],
  "suggestedSpecificCompetencies": ["Năng lực đặc thù..."]
}
`;

  let contents: any[] = [];
  if (fileBase64 && mimeType) {
    const base64Clean = fileBase64.replace(/^data:[^;]+;base64,/, '');
    contents = [
      { inlineData: { data: base64Clean, mimeType } },
      promptText,
    ];
  } else {
    contents = [promptText];
  }

  const response = await generateContentWithRetryDirect(ai, {
    model: 'gemini-2.5-flash',
    contents,
    config: { responseMimeType: 'application/json' },
  });

  return cleanAndParseJson(response.text || '{}');
}

export async function generateMaterialsDirect(payload: any): Promise<any> {
  const ai = getClientGemini();
  const { lessonTitle, subject, grade, textbook, promptType } = payload;

  const prompt = `
Bạn là Chuyên gia thiết kế học liệu giáo dục Việt Nam.
Hãy tạo bộ học liệu bổ trợ chuyên sâu cho bài dạy: "${lessonTitle}" (Môn ${subject}, ${grade}, Bộ sách ${textbook}).
Loại học liệu: "${promptType || 'all'}".

Trả về JSON duy nhất:
{
  "worksheets": [
    {
      "id": "ws-1",
      "title": "PHIẾU HỌC TẬP SỐ 1: BÀI ${lessonTitle}",
      "instructions": "Hướng dẫn học sinh...",
      "questions": [
        { "id": "q1", "number": 1, "text": "Câu hỏi 1...", "spaceForAnswer": "Trống 4 dòng..." }
      ]
    }
  ],
  "quizQuestions": [
    {
      "id": "quiz-1",
      "question": "Câu hỏi...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Giải thích...",
      "level": "Nhận biết"
    }
  ],
  "pptSlides": [
    {
      "slideNumber": 1,
      "title": "Slide 1: Bài ${lessonTitle}",
      "mainPoints": ["Điểm chính 1"],
      "visualSuggestions": "Gợi ý hình ảnh",
      "speakerNotes": "Ghi chú GV"
    }
  ]
}
`;

  const response = await generateContentWithRetryDirect(ai, {
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return cleanAndParseJson(response.text || '{}');
}

export async function chatReferenceDirect(payload: any): Promise<string> {
  const ai = getClientGemini();
  const { query, history } = payload;

  const docsText = DEFAULT_REFERENCE_DOCUMENTS
    .map((d) => `--- [Nguồn tài liệu: ${d.title}] ---\n${d.contentText}`)
    .join('\n\n');

  const prompt = `
Bạn là Trợ lý AI Chuyên tư vấn Kế hoạch bài dạy & Quy định Giáo dục Việt Nam.
Căn cứ vào Văn bản BGD&ĐT:
${docsText}

Lịch sử: ${JSON.stringify(history || [])}
Câu hỏi: "${query}"

Trả lời tiếng Việt văn minh, dẫn chứng quy định và gợi ý thực tiễn.
`;

  const response = await generateContentWithRetryDirect(ai, {
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || '';
}

export async function integrateLessonPlanDirect(payload: any): Promise<any> {
  const ai = getClientGemini();
  const {
    uploadedHtml,
    uploadedText,
    selectedTopics,
    customInstructions,
    integrationRequirements,
    schoolName,
    teacherName,
  } = payload;

  const topicList = (selectedTopics && selectedTopics.length > 0)
    ? selectedTopics.join(', ')
    : 'An toàn giao thông, Giáo dục bảo vệ môi trường, Kỹ năng số';

  const contentToProcess = uploadedHtml || (uploadedText ? uploadedText.split('\n').map((line: string) => `<p>${line}</p>`).join('') : '');

  const prompt = `
Bạn là Chuyên gia Tích hợp Giáo dục GDPT 2018. Dưới đây là TÀI LIỆU KHBD GỐC do giáo viên tải lên:
================================================================================
${contentToProcess}
================================================================================

QUY TẮC BẮT BUỘC (PRESERVE -> ANALYZE -> LOCATE -> GENERATE -> INSERT -> VERIFY):
1. **TUYỆT ĐỐI BẢO TOÀN NGUYÊN VẸN 100% KHBD GỐC**:
   - File KHBD hiện có là nội dung NGUỒN BẤT BIẾN (read-only).
   - KHÔNG ĐƯỢC làm thay đổi, sửa, xóa, viết lại, tóm tắt hoặc định dạng lại bất kỳ từ ngữ, câu chữ, tiêu đề, mục, bảng biểu hay số thứ tự nào của KHBD gốc.
   - Giữ nguyên 100% cấu trúc bảng (1 cột, 2 cột...), thứ tự các bước và dữ liệu ban đầu.

2. **CHỈ THỰC HIỆN THAO TÁC INSERT (CHÈN THÊM TRỰC TIẾP TẠI VỊ TRÍ NỘI DUNG/HOẠT ĐỘNG PHÙ HỢP)**:
   - **CHÈN TẠI CHỖ (IN-PLACE INSERTION)**: Nội dung tích hợp thuộc hoạt động nào BẮT BUỘC phải nằm ngay bên trong/sau hoạt động đó trong thân bài dạy (Ví dụ: Chèn ngay bên trong Hoạt động 1: Khởi động, Hoạt động 2: Khám phá, Hoạt động 3: Luyện tập, hoặc ở Bước b/c của nhiệm vụ học tập).
   - **TUYỆT ĐỐI KHÔNG DỒN XUỐNG CUỐI GIÁO ÁN**: KHÔNG ĐƯỢC gom tất cả nội dung tích hợp để dồn xuống cuối giáo án hay tạo thành một mục tích hợp riêng ở cuối bài. Phải đan xen trực tiếp vào đúng vị trí tiến trình dạy học đang diễn ra.
   - Các chủ đề tích hợp yêu cầu: [${topicList}].
   - Yêu cầu tích hợp cụ thể từ giáo viên: "${integrationRequirements || customInstructions || 'Tích hợp nhẹ nhàng, tự nhiên vào các hoạt động dạy học phù hợp'}".
   - Tất cả nội dung chèn thêm BẮT BUỘC phải có nhãn nhận diện rõ ràng theo cú pháp:
     <p style="color: #0f766e; background-color: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 10px; margin: 6px 0; font-weight: 600;">
       <strong>[TÍCH HỢP TÊN_CHỦ_ĐỀ]</strong> Nội dung tích hợp chèn thêm...
     </p>
     Ví dụ: [TÍCH HỢP AN TOÀN GIAO THÔNG], [TÍCH HỢP BẢO VỆ MÔI TRƯỜNG], [TÍCH HỢP KỸ NĂNG SỐ], [TÍCH HỢP HƯỚNG NGHIỆP], [TÍCH HỢP GIÁO DỤC PHÁP LUẬT], [TÍCH HỢP STEM], v.v.

3. **KHÔNG TÍCH HỢP GƯỢNG ÉP**:
   - Nếu chủ đề tích hợp nào KHÔNG phù hợp với ngữ cảnh bài học, KHÔNG được gượng ép chèn bừa bãi.
   - Liệt kê các chủ đề chưa phù hợp đó vào mảng "unsuitableTopics" kèm lý do và đề xuất giải pháp.

Trả về duy nhất một đối tượng JSON chuẩn xác theo cấu trúc:
{
  "documentTitle": "Tiêu đề bài dạy hoặc tên tài liệu gốc",
  "integrationSummary": [
    "Tóm tắt 1: [TÍCH HỢP AN TOÀN GIAO THÔNG] Đã chèn vào Hoạt động Khởi động...",
    "Tóm tắt 2: [TÍCH HỢP KỸ NĂNG SỐ] Đã chèn vào Hoạt động Luyện tập..."
  ],
  "unsuitableTopics": [
    { "topic": "Tên chủ đề chưa phù hợp", "reason": "Lý do chưa phù hợp", "suggestion": "Đề xuất gợi ý" }
  ],
  "verificationChecks": [
    "CHECK 1: Bảo toàn 100% văn bản & bảng biểu KHBD gốc (0 ký tự gốc bị xóa hoặc sửa)",
    "CHECK 2: Đã đánh dấu nhãn [TÍCH HỢP ...] rõ ràng cho từng nội dung bổ sung",
    "CHECK 3: Vị trí chèn tự nhiên, phù hợp với tiến trình bài dạy"
  ],
  "integratedHtml": "Toàn bộ HTML giáo án gốc giữ nguyên 100% và được chèn thêm các thẻ <p> [TÍCH HỢP ...] </p> ở vị trí phù hợp."
}
`;

  const response = await generateContentWithRetryDirect(ai, {
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const jsonText = response.text || '{}';
  const result = cleanAndParseJson(jsonText);

  if (result.integratedHtml && !result.integratedFullText) {
    result.integratedFullText = result.integratedHtml.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
  }

  return result;
}

export async function proposeLessonIntegrationDirect(payload: any): Promise<any> {
  const ai = getClientGemini();
  const {
    uploadedHtml,
    uploadedText,
    selectedTopics,
    customInstructions,
    integrationRequirements,
  } = payload;

  const topicList = (selectedTopics && selectedTopics.length > 0)
    ? selectedTopics.join(', ')
    : 'An toàn giao thông, Giáo dục bảo vệ môi trường, Kỹ năng số';

  const contentToProcess = uploadedHtml || (uploadedText ? uploadedText.split('\n').map((line: string) => `<p>${line}</p>`).join('') : '');

  const prompt = `
Bạn là Chuyên gia Đánh giá & Phân tích Giáo án. Dưới đây là KHBD GỐC do giáo viên tải lên:
================================================================================
${contentToProcess}
================================================================================

Danh sách chủ đề yêu cầu tích hợp: [${topicList}].
Yêu cầu cụ thể từ giáo viên: "${integrationRequirements || customInstructions || 'Đề xuất các điểm tích hợp hợp lý nhất'}".

Hãy phân tích KHBD gốc và đưa ra DÀN ĐỀ XUẤT VỊ TRÍ TÍCH HỢP trước khi thực hiện chèn chính thức.

Trả về duy nhất đối tượng JSON chuẩn:
{
  "documentTitle": "Tiêu đề bài học / giáo án",
  "detectedSections": [
    "Khởi động / Mở đầu",
    "Hình thành kiến thức mới / Khám phá",
    "Luyện tập",
    "Vận dụng"
  ],
  "proposals": [
    {
      "id": "prop-1",
      "locationName": "Hoạt động 2: Khám phá kiến thức - Trạm 1",
      "topicTag": "[TÍCH HỢP KỸ NĂNG SỐ]",
      "reason": "Hoạt động đang yêu cầu học sinh làm việc với số liệu, phù hợp để hướng dẫn học sinh thao tác phần mềm tra cứu trực tuyến.",
      "proposedInsertText": "GV đặt câu hỏi mở rộng: Hướng dẫn HS sử dụng thiết bị số để tra cứu thông tin chính thống về chủ đề.",
      "status": "pending"
    },
    {
      "id": "prop-2",
      "locationName": "Hoạt động 4: Vận dụng",
      "topicTag": "[TÍCH HỢP BẢO VỆ MÔI TRƯỜNG]",
      "reason": "Hoạt động vận dụng yêu cầu giải quyết bài toán thực tế, rất thích hợp để lồng ghép hành động bảo vệ môi trường.",
      "proposedInsertText": "GV giao nhiệm vụ liên hệ: Hãy đề xuất 2 giải pháp giảm thiểu chất thải nhựa trong gia đình em.",
      "status": "pending"
    }
  ],
  "unsuitableTopics": [
    { "topic": "Tên chủ đề chưa phù hợp", "reason": "Lý do chưa tìm thấy vị trí tự nhiên trong bài này", "suggestion": "Đề xuất lồng ghép ngoại khóa hoặc tiết học sau" }
  ]
}
`;

  const response = await generateContentWithRetryDirect(ai, {
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const jsonText = response.text || '{}';
  return cleanAndParseJson(jsonText);
}
