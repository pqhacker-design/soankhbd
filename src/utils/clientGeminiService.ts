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

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
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

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
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

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
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

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  return response.text || '';
}

export async function integrateLessonPlanDirect(payload: any): Promise<any> {
  const ai = getClientGemini();
  const {
    uploadedText,
    selectedTopics,
    customInstructions,
    schoolName,
    teacherName,
  } = payload;

  const topicList = (selectedTopics && selectedTopics.length > 0)
    ? selectedTopics.join(', ')
    : 'Năng lực số, Bảo vệ Môi trường, Giáo dục Hướng nghiệp, An toàn giao thông, Giáo dục địa phương';

  const prompt = `
Bạn là Chuyên gia Cao cấp về Chuẩn hóa và Tích hợp Giáo dục Phổ thông GDPT 2018 Việt Nam (Công văn 5512/BGDĐT, Công văn 3535).

Dưới đây là NỘI DUNG GIÁO ÁN / TÀI LIỆU DẠY HỌC do giáo viên tải lên (Có thể chứa 1 bài hoặc NHIỀU BÀI / NHIỀU TIẾT / NHIỀU CHƯƠNG theo định dạng riêng của giáo viên):
================================================================================
${uploadedText}
================================================================================

NHIỆM VỤ CỦA BẠN:
1. **BẢO TOÀN NGUYÊN VĂN 100% TOÀN BỘ NỘI DUNG VÀ ĐỊNH DẠNG TÀI LIỆU GỐC**:
   - Nếu tài liệu chứa 1 bài, 3 bài hay 10 bài -> Giữ lại ĐẦY ĐỦ 100% tất cả các bài, tất cả các tiết, tất cả các đoạn văn, tiêu đề, câu hỏi và nội dung gốc.
   - TUYỆT ĐỐI KHÔNG TÓM TẮT, KHÔNG CẮT GIẢM, KHÔNG ÉP CẢ TÀI LIỆU VÀO KHUÔN MẪU MỘT BÀI ĐƠN LẺ NẾU CÓ NHIỀU BÀI.

2. **CHỈ CHÈN BỔ SUNG CÁC ĐIỂM TÍCH HỢP VÀO CÁC VỊ TRÍ THÍCH HỢP**:
   Danh sách các chủ đề tích hợp cần bổ sung: [${topicList}].
   - **Tích hợp Năng lực số**: Chèn thêm việc sử dụng phần mềm, khai thác học liệu số, ứng dụng CNTT, tra cứu trực tuyến, an toàn mạng.
   - **Tích hợp Môi trường & Biến đổi khí hậu**: Chèn thêm liên hệ tiết kiệm năng lượng, bảo vệ cảnh quan, phân loại rác, ứng phó biến đổi khí hậu.
   - **Tích hợp Hướng nghiệp**: Chèn thêm liên hệ định hướng ứng dụng nghề nghiệp tương lai, vị trí công việc thực tế.
   - **Tích hợp An toàn giao thông**: Chèn thêm tình huống chấp hành luật giao thông, văn hóa giao thông an toàn.
   - **Tích hợp Giáo dục địa phương**: Chèn thêm liên hệ thực tiễn lịch sử, danh lam thắng cảnh, văn hóa di sản, sản vật, kinh tế xã hội địa phương.

3. **QUY CÁCH CHÈN**:
   Đặt tất cả các điểm bổ sung trong ngoặc vuông nổi bật:
   • [TÍCH HỢP NĂNG LỰC SỐ: ...]
   • [TÍCH HỢP MÔI TRƯỜNG: ...]
   • [TÍCH HỢP HƯỚNG NGHIỆP: ...]
   • [TÍCH HỢP AN TOÀN GIAO THÔNG: ...]
   • [TÍCH HỢP GIÁO DỤC ĐỊA PHƯƠNG: ...]

Yêu cầu bổ sung từ giáo viên: ${customInstructions || 'Không có.'}

Trả về duy nhất một đối tượng JSON chuẩn xác theo cấu trúc sau:
{
  "documentTitle": "Tên tổng quan giáo án hoặc tiêu đề các bài trong giáo án gốc",
  "integrationSummary": [
    "Tóm tắt điểm tích hợp Năng lực số đã bổ sung...",
    "Tóm tắt điểm tích hợp Môi trường đã bổ sung...",
    "Tóm tắt điểm tích hợp Hướng nghiệp đã bổ sung...",
    "Tóm tắt điểm tích hợp An toàn giao thông đã bổ sung...",
    "Tóm tắt điểm tích hợp Giáo dục địa phương đã bổ sung..."
  ],
  "integratedFullText": "Toàn bộ văn bản giáo án gốc được giữ nguyên 100% tất cả các bài/tiết và được chèn thêm các nhãn [TÍCH HỢP ...]"
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
  return cleanAndParseJson(jsonText);
}
