import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Math,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import { saveAs } from 'file-saver';
import { FullLessonPlan } from '../types';
import { convertTextWithMathToDocxRuns, DocxTextRunOptions } from './latexToDocxMath';

export async function exportHtmlToDocx(
  htmlContent: string,
  fileName: string = 'Giao_An_Tich_Hop'
) {
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '');
  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${cleanTitle}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForCustomXSL/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4;
          margin: 20mm 20mm 20mm 20mm;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 13pt;
          line-height: 1.25;
          color: #000000;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        th, td {
          border: 1px solid #000000;
          padding: 6px 8px;
          vertical-align: top;
        }
        th {
          background-color: #f8fafc;
          font-weight: bold;
          text-align: center;
        }
        p {
          margin-top: 3px;
          margin-bottom: 3px;
        }
        strong {
          font-weight: bold;
        }
        em {
          font-style: italic;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  try {
    const blob = new Blob(['\ufeff' + fullHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const cleanFileName = fileName.endsWith('.doc') || fileName.endsWith('.docx')
      ? fileName
      : `${fileName}.doc`;
    saveAs(blob, cleanFileName);
  } catch (err) {
    console.error('Error exporting HTML to DOC:', err);
  }
}


export async function exportLessonPlanToDocx(plan: FullLessonPlan) {
  const primaryColor = '1E3A8A'; // Dark Navy Blue

  // Helper for title heading
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 26, // 13pt
          color: primaryColor,
          font: 'Times New Roman',
        }),
      ],
    });
  };

  const createSubHeader = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 180, after: 80 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 24, // 12pt
          color: '0F172A',
          font: 'Times New Roman',
        }),
      ],
    });
  };

  const createMathParagraph = (
    text: string,
    options?: DocxTextRunOptions & { alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacing?: { before?: number; after?: number }; bullet?: any }
  ) => {
    const children = convertTextWithMathToDocxRuns(text, options);
    return new Paragraph({
      alignment: options?.alignment,
      spacing: options?.spacing || { before: 40, after: 40 },
      bullet: options?.bullet,
      children: children.length > 0 ? children : [new TextRun({ text: '', font: 'Times New Roman', size: options?.size || 22 })],
    });
  };

  const createBullet = (text: string, boldPrefix?: string) => {
    const runs: (TextRun | Math)[] = [];
    if (boldPrefix) {
      runs.push(
        new TextRun({
          text: boldPrefix + ' ',
          bold: true,
          size: 24,
          font: 'Times New Roman',
        })
      );
    }
    runs.push(...convertTextWithMathToDocxRuns(text, { font: 'Times New Roman', size: 24 }));

    return new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 40 },
      children: runs,
    });
  };

  // Header Table (School name & Teacher name)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'TRƯỜNG: ', bold: true, font: 'Times New Roman', size: 22 }),
                  new TextRun({ text: plan.info.schoolName || '..............................................', font: 'Times New Roman', size: 22 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'TỔ CHUYÊN MÔN: ', bold: true, font: 'Times New Roman', size: 22 }),
                  new TextRun({ text: plan.info.departmentName || '..............................................', font: 'Times New Roman', size: 22 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'HỌ VÀ TÊN GV: ', bold: true, font: 'Times New Roman', size: 22 }),
                  new TextRun({ text: plan.info.teacherName || '..............................................', font: 'Times New Roman', size: 22 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `LỚP: ${plan.info.classGroup || plan.grade} | NGÀY: ${plan.info.date}`, font: 'Times New Roman', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Main Banner Title
  const bannerParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: 'KẾ HOẠCH BÀI DẠY (GIÁO ÁN)',
          bold: true,
          size: 32, // 16pt
          color: primaryColor,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 60 },
      children: [
        new TextRun({ text: 'BÀI: ', bold: true, size: 28, font: 'Times New Roman' }),
        ...convertTextWithMathToDocxRuns(plan.info.lessonTitle.toUpperCase(), { bold: true, size: 28, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [
        new TextRun({
          text: `Môn học: ${plan.subject} - ${plan.grade} | Bộ sách: ${plan.textbook} | Tiết: ${plan.info.periodNumber} (${plan.info.duration})`,
          italics: true,
          size: 22,
          color: '475569',
          font: 'Times New Roman',
        }),
      ],
    }),
  ];

  // Activities Table according to layoutFormat
  const activityElements: (Paragraph | Table)[] = [];
  const layoutFmt = plan.layoutFormat || 'standard';

  plan.activities.forEach((act, idx) => {
    activityElements.push(
      new Paragraph({
        spacing: { before: 160, after: 80 },
        children: [
          new TextRun({
            text: `HOẠT ĐỘNG ${idx + 1}: `,
            bold: true,
            size: 24,
            color: '0F766E',
            font: 'Times New Roman',
          }),
          ...convertTextWithMathToDocxRuns(`${act.name.toUpperCase()} (${act.duration})`, {
            bold: true,
            size: 24,
            color: '0F766E',
            font: 'Times New Roman',
          }),
        ],
      })
    );

    if (layoutFmt === 'three_column') {
      // 3-Column Table Format
      const threeColTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 35, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'HOẠT ĐỘNG CỦA GIÁO VIÊN', bold: true, color: '1E3A8A', font: 'Times New Roman', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 35, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'HOẠT ĐỘNG CỦA HỌC SINH', bold: true, color: '0F766E', font: 'Times New Roman', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'NỘI DUNG & SẢN PHẨM CẦN ĐẠT', bold: true, color: '9A3412', font: 'Times New Roman', size: 22 })] })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '• Mục tiêu: ', bold: true, font: 'Times New Roman', size: 22 }), ...convertTextWithMathToDocxRuns(act.objective, { font: 'Times New Roman', size: 22 })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '• Nội dung học tập: ', bold: true, font: 'Times New Roman', size: 22 }), ...convertTextWithMathToDocxRuns(act.content, { font: 'Times New Roman', size: 22 })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '• Sản phẩm mong đợi: ', bold: true, font: 'Times New Roman', size: 22 }), ...convertTextWithMathToDocxRuns(act.product, { font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '1. Chuyển giao nhiệm vụ:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.transfer, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'HS lắng nghe, tiếp nhận nhiệm vụ và chuẩn bị sẵn sàng.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Nhiệm vụ rõ ràng, 100% HS nắm bắt được yêu cầu.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '2. Theo dõi, hỗ trợ:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: 'GV quan sát, theo dõi các nhóm/cá nhân, gợi mở và hỗ trợ kịp thời.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '2. Thực hiện nhiệm vụ:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.execution, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Sản phẩm trung gian, kết quả thảo luận nhóm.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '3. Điều hành báo cáo:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: 'GV mời đại diện nhóm/cá nhân trình bày, tổ chức cho HS nhận xét.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '3. Báo cáo, thảo luận:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.reporting, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Sản phẩm hoàn chỉnh, ý kiến phản biện của các nhóm.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '4. Kết luận, nhận định:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.conclusion, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'HS lắng nghe GV chốt kiến thức và ghi vở.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Nội dung ghi vở cốt lõi:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.product, { font: 'Times New Roman', size: 22, bold: true }),
                ],
              }),
            ],
          }),
        ],
      });
      activityElements.push(threeColTable);

    } else if (layoutFmt === 'two_column') {
      // 2-Column Table Format
      const twoColTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'TIẾN TRÌNH HOẠT ĐỘNG CỦA GV VÀ HS', bold: true, color: '1E3A8A', font: 'Times New Roman', size: 22 })] })],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'SẢN PHẨM DỰ KIẾN & NỘI DUNG HỌC TẬP', bold: true, color: '0F766E', font: 'Times New Roman', size: 22 })] })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '• Mục tiêu: ', bold: true, font: 'Times New Roman', size: 22 }), ...convertTextWithMathToDocxRuns(act.objective, { font: 'Times New Roman', size: 22 })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: '• Nội dung trọng tâm: ', bold: true, font: 'Times New Roman', size: 22 }), ...convertTextWithMathToDocxRuns(act.content, { font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Bước 1: Chuyển giao nhiệm vụ', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.transfer, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'HS tiếp nhận nhiệm vụ và hiểu rõ định hướng.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Bước 2: Thực hiện nhiệm vụ', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.execution, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Kết quả thảo luận nhóm, bài giải trên phiếu học tập.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Bước 3: Báo cáo, thảo luận', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.reporting, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Bài trình chiếu, bảng phụ hoặc bài viết hoàn chỉnh.', font: 'Times New Roman', size: 22 })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Bước 4: Kết luận, nhận định', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.implementation.conclusion, { font: 'Times New Roman', size: 22 }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Sản phẩm cốt lõi ghi vở:', bold: true, font: 'Times New Roman', size: 22 })] }),
                  createMathParagraph(act.product, { font: 'Times New Roman', size: 22, bold: true }),
                ],
              }),
            ],
          }),
        ],
      });
      activityElements.push(twoColTable);

    } else {
      // Standard Layout (Công văn 5512 truyền thống)
      activityElements.push(createBullet(act.objective, 'a) Mục tiêu:'));
      activityElements.push(createBullet(act.content, 'b) Nội dung:'));
      activityElements.push(createBullet(act.product, 'c) Sản phẩm:'));

      activityElements.push(
        new Paragraph({
          spacing: { before: 80, after: 60 },
          children: [
            new TextRun({
              text: 'd) Tổ chức thực hiện:',
              bold: true,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );

      const implTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Các bước thực hiện', bold: true, font: 'Times New Roman', size: 22 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Nội dung chi tiết', bold: true, font: 'Times New Roman', size: 22 })],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Bước 1: Chuyển giao nhiệm vụ', bold: true, font: 'Times New Roman', size: 22 })] })],
              }),
              new TableCell({
                children: [createMathParagraph(act.implementation.transfer, { font: 'Times New Roman', size: 22 })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Bước 2: Thực hiện nhiệm vụ', bold: true, font: 'Times New Roman', size: 22 })] })],
              }),
              new TableCell({
                children: [createMathParagraph(act.implementation.execution, { font: 'Times New Roman', size: 22 })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Bước 3: Báo cáo, thảo luận', bold: true, font: 'Times New Roman', size: 22 })] })],
              }),
              new TableCell({
                children: [createMathParagraph(act.implementation.reporting, { font: 'Times New Roman', size: 22 })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Bước 4: Kết luận, nhận định', bold: true, font: 'Times New Roman', size: 22 })] })],
              }),
              new TableCell({
                children: [createMathParagraph(act.implementation.conclusion, { font: 'Times New Roman', size: 22 })],
              }),
            ],
          }),
        ],
      });

      activityElements.push(implTable);
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          headerTable,
          ...bannerParagraphs,

          createSectionHeader('I. MỤC TIÊU BÀI HỌC'),
          createSubHeader('1. Yêu cầu cần đạt:'),
          ...plan.objectives.requirementsToAchieve.map((req) => createBullet(req)),

          createSubHeader('2. Năng lực:'),
          createBullet(plan.objectives.generalCompetencies.join(', '), 'a) Năng lực chung:'),
          createBullet(plan.objectives.specificCompetencies.join(', '), 'b) Năng lực đặc thù:'),

          createSubHeader('3. Phẩm chất:'),
          createBullet(plan.objectives.qualities.join(', ')),

          createSectionHeader('II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU'),
          createBullet(plan.equipmentsAndMaterials.equipments.join(', '), '1. Giáo viên:'),
          createBullet(plan.equipmentsAndMaterials.materials.join(', '), '2. Học sinh:'),

          createSectionHeader('III. TIẾN TRÌNH DẠY HỌC'),
          ...activityElements,

          createSectionHeader('IV. HƯỚNG DẪN ĐÁNH GIÁ & PHÂN HÓA DẠY HỌC'),
          createBullet(plan.differentiation.weakSupport || 'Cung cấp mẫu khung hướng dẫn từng bước; phân công bạn khá hỗ trợ.', 'Phân hóa HS yếu / cần hỗ trợ:'),
          createBullet(plan.differentiation.averageSupport || 'Yêu cầu hoàn thành các câu hỏi cơ bản và thực hành phiếu học tập.', 'Phân hóa HS trung bình:'),
          createBullet(plan.differentiation.advancedSupport || 'Khuyến khích tìm tòi các cách giải khác nhau, tổng hợp kiến thức.', 'Phân hóa HS khá / giỏi:'),
          createBullet(plan.differentiation.giftedSupport || 'Giao bài tập vận dụng cao, thiết kế dự án nhỏ hoặc câu hỏi mở sáng tạo.', 'Phân hóa HS năng khiếu / đặc biệt:'),
          createBullet(`${plan.assessment.type} (${plan.assessment.details})`, 'Phương pháp & Hình thức đánh giá:'),

          // Rubrics Table
          createSubHeader('Bảng Ma trận Tiêu chí Đánh giá Rubrics:'),
          (() => {
            const rubricsList = (plan.assessment.rubrics && plan.assessment.rubrics.length > 0)
              ? plan.assessment.rubrics
              : [
                  {
                    criteria: 'Thái độ & Ý thức làm việc nhóm',
                    level4: 'Chủ động dẫn dắt, tích cực thảo luận và trợ giúp thành viên khác',
                    level3: 'Tham gia đầy đủ, hoàn thành nhiệm vụ nhóm đúng hạn',
                    level2: 'Cần sự nhắc nhở của GV để hoàn thành bài tập',
                    level1: 'Thụ động, chưa chú ý thực hiện nhiệm vụ nhóm',
                  },
                  {
                    criteria: 'Chất lượng Sản phẩm Phiếu học tập',
                    level4: 'Chính xác tuyệt đối, trình bày khoa học, có sáng tạo',
                    level3: 'Đầy đủ nội dung cơ bản, tính toán chính xác',
                    level2: 'Còn 1-2 sai sót nhỏ hoặc trình bày chưa cẩn thận',
                    level1: 'Chưa hoàn thành sản phẩm hoặc sai sót nhiều',
                  },
                ];

            const rubricRows: TableRow[] = [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Tiêu chí', bold: true, color: '1E3A8A', font: 'Times New Roman', size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Mức 4 (Xuất sắc)', bold: true, color: '0F766E', font: 'Times New Roman', size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Mức 3 (Đạt yêu cầu)', bold: true, color: '1D4ED8', font: 'Times New Roman', size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Mức 2 (Cần cố gắng)', bold: true, color: 'B45309', font: 'Times New Roman', size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Mức 1 (Chưa đạt)', bold: true, color: 'BE123C', font: 'Times New Roman', size: 22 })] })],
                  }),
                ],
              }),
            ];

            rubricsList.forEach((r) => {
              rubricRows.push(
                new TableRow({
                  children: [
                    new TableCell({ children: [createMathParagraph(r.criteria, { bold: true, font: 'Times New Roman', size: 22 })] }),
                    new TableCell({ children: [createMathParagraph(r.level4, { font: 'Times New Roman', size: 22 })] }),
                    new TableCell({ children: [createMathParagraph(r.level3, { font: 'Times New Roman', size: 22 })] }),
                    new TableCell({ children: [createMathParagraph(r.level2, { font: 'Times New Roman', size: 22 })] }),
                    new TableCell({ children: [createMathParagraph(r.level1, { font: 'Times New Roman', size: 22 })] }),
                  ],
                })
              );
            });

            return new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
              },
              rows: rubricRows,
            });
          })(),

          ...(() => {
            const supp: (Paragraph | Table)[] = [];
            supp.push(createSectionHeader('V. PHỤ LỤC: NGÂN HÀNG HỌC LIỆU BỔ TRỢ & BỘ CÂU HỎI QUIZ CỦNG CỐ'));

            // 1. Worksheets
            const worksheets = (plan.supplementaryMaterials?.worksheets && plan.supplementaryMaterials.worksheets.length > 0)
              ? plan.supplementaryMaterials.worksheets
              : [
                  {
                    id: 'ws-default-1',
                    title: `PHIẾU HỌC TẬP SỐ 1: KHÁM PHÁ KIẾN THỨC BÀI ${plan.info.lessonTitle.toUpperCase()}`,
                    instructions: 'Học sinh đọc kỹ SGK và thảo luận nhóm để hoàn thành các câu hỏi dưới đây:',
                    questions: [
                      {
                        id: 'q1',
                        number: 1,
                        text: `Hãy phát biểu định nghĩa / khái niệm trọng tâm của bài ${plan.info.lessonTitle}.`,
                        spaceForAnswer: '(Học sinh ghi câu trả lời và ý chính vào khung này...)',
                      },
                      {
                        id: 'q2',
                        number: 2,
                        text: 'Nêu các bước thực hiện hoặc công thức áp dụng trong bài học.',
                        spaceForAnswer: '(Học sinh viết công thức và các bước chi tiết...)',
                      },
                    ],
                  },
                  {
                    id: 'ws-default-2',
                    title: `PHIẾU HỌC TẬP SỐ 2: LUYỆN TẬP VÀ VẬN DỤNG BÀI ${plan.info.lessonTitle.toUpperCase()}`,
                    instructions: 'Học sinh làm việc cá nhân hoàn thành bài tập củng cố:',
                    questions: [
                      {
                        id: 'q3',
                        number: 1,
                        text: 'Giải bài tập áp dụng trực tiếp kiến thức vừa học.',
                        spaceForAnswer: '(Học sinh trình bày lời giải chi tiết...)',
                      },
                    ],
                  },
                ];

            supp.push(createSubHeader('1. Phiếu học tập (Worksheets) dành cho học sinh:'));

            worksheets.forEach((ws) => {
              supp.push(
                new Paragraph({
                  spacing: { before: 120, after: 60 },
                  children: [
                    ...convertTextWithMathToDocxRuns(ws.title, { bold: true, size: 24, color: '1E3A8A', font: 'Times New Roman' }),
                  ],
                })
              );

              supp.push(
                new Paragraph({
                  spacing: { before: 40, after: 80 },
                  children: [
                    new TextRun({ text: 'Hướng dẫn: ', italics: true, bold: true, size: 22, font: 'Times New Roman' }),
                    ...convertTextWithMathToDocxRuns(ws.instructions, { italics: true, size: 22, font: 'Times New Roman' }),
                  ],
                })
              );

              const wsRows: TableRow[] = [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 15, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Câu số', bold: true, font: 'Times New Roman', size: 22 })] })],
                    }),
                    new TableCell({
                      width: { size: 85, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Nội dung câu hỏi & Khung trả lời của học sinh', bold: true, font: 'Times New Roman', size: 22 })] })],
                    }),
                  ],
                })
              ];

              ws.questions.forEach((q) => {
                wsRows.push(
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: `Câu ${q.number}`, bold: true, font: 'Times New Roman', size: 22 })] })],
                      }),
                      new TableCell({
                        children: [
                          createMathParagraph(q.text, { bold: true, font: 'Times New Roman', size: 22 }),
                          createMathParagraph(q.spaceForAnswer || '(Học sinh ghi câu trả lời vào đây...)', { italics: true, color: '64748B', font: 'Times New Roman', size: 20 }),
                        ],
                      }),
                    ],
                  })
                );
              });

              const wsTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                  left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                },
                rows: wsRows,
              });

              supp.push(wsTable);
            });

            // 2. Quiz Questions
            const quizQuestions = (plan.supplementaryMaterials?.quizQuestions && plan.supplementaryMaterials.quizQuestions.length > 0)
              ? plan.supplementaryMaterials.quizQuestions
              : [
                  {
                    id: 'quiz-def-1',
                    question: `Kiến thức cốt lõi quan trọng nhất của bài ${plan.info.lessonTitle} là gì?`,
                    options: [
                      'Khái niệm và định nghĩa chính xác trong SGK',
                      'Phương pháp giải bài tập thực hành',
                      'Ứng dụng thực tế đời sống',
                      'Tất cả các phương án trên đều đúng',
                    ],
                    correctAnswer: 3,
                    explanation: 'Bài học bao gồm cả lý thuyết nền tảng, kỹ năng thực hành và vận dụng thực tiễn.',
                    level: 'Nhận biết',
                  },
                  {
                    id: 'quiz-def-2',
                    question: `Khi thực hiện bài tập liên quan đến ${plan.info.lessonTitle}, học sinh cần lưu ý điều gì đầu tiên?`,
                    options: [
                      'Đọc kỹ đề bài và xác định dữ kiện ban đầu',
                      'Viết ngay kết quả mà không cần trình bày',
                      'Bỏ qua các bước kiểm tra',
                      'Chỉ làm phần bài tập nâng cao',
                    ],
                    correctAnswer: 0,
                    explanation: 'Đọc kỹ đề bài là bước tiên quyết để xác định đúng phương pháp giải.',
                    level: 'Thông hiểu',
                  },
                  {
                    id: 'quiz-def-3',
                    question: `Ứng dụng thực tế của bài học ${plan.info.lessonTitle} giúp giải quyết vấn đề nào trong học tập và đời sống?`,
                    options: [
                      'Tối ưu hóa các tính toán và phân tích logic',
                      'Hệ thống hóa kiến thức phục vụ kiểm tra đánh giá',
                      'Phát triển năng lực giải quyết vấn đề thực tiễn',
                      'Cả 3 đáp án trên',
                    ],
                    correctAnswer: 3,
                    explanation: 'Chương trình GDPT 2018 chú trọng phát triển toàn diện năng lực và phẩm chất học sinh.',
                    level: 'Vận dụng',
                  },
                  {
                    id: 'quiz-def-4',
                    question: `Để mở rộng và sáng tạo từ kiến thức bài ${plan.info.lessonTitle}, định hướng phát triển nào là tối ưu?`,
                    options: [
                      'Xây dựng dự án học tập nhỏ hoặc sản phẩm STEM liên môn',
                      'Chỉ học thuộc lòng lý thuyết',
                      'Không cần liên hệ thực tế',
                      'Chỉ giải các bài tập đơn giản',
                    ],
                    correctAnswer: 0,
                    explanation: 'Dự án STEM và học tập trải nghiệm giúp khắc sâu kiến thức ở mức độ vận dụng cao.',
                    level: 'Vận dụng cao',
                  },
                ];

            supp.push(createSubHeader('2. Bộ câu hỏi Quiz Trắc nghiệm Củng cố & Ma trận Đánh giá (4 Mức độ):'));

            quizQuestions.forEach((q, idx) => {
              supp.push(
                new Paragraph({
                  spacing: { before: 100, after: 40 },
                  children: [
                    new TextRun({
                      text: `Câu ${idx + 1} [Mức độ: ${q.level}]: `,
                      bold: true,
                      size: 22,
                      color: '0F766E',
                      font: 'Times New Roman',
                    }),
                    ...convertTextWithMathToDocxRuns(q.question, { bold: true, size: 22, font: 'Times New Roman' }),
                  ],
                })
              );

              q.options.forEach((opt, optIdx) => {
                supp.push(
                  new Paragraph({
                    indent: { left: 360 },
                    spacing: { before: 20, after: 20 },
                    children: [
                      new TextRun({
                        text: `${String.fromCharCode(65 + optIdx)}. `,
                        bold: true,
                        font: 'Times New Roman',
                        size: 22,
                      }),
                      ...convertTextWithMathToDocxRuns(opt, { font: 'Times New Roman', size: 22 }),
                    ],
                  })
                );
              });
            });

            // Answer Key Table
            supp.push(
              new Paragraph({
                spacing: { before: 140, after: 60 },
                children: [
                  new TextRun({
                    text: 'Bảng Đáp Án Chi Tiết & Hướng Dẫn Giải (Answer Key & Rubrics):',
                    bold: true,
                    size: 22,
                    color: '1E3A8A',
                    font: 'Times New Roman',
                  }),
                ],
              })
            );

            const quizAnsRows: TableRow[] = [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Câu', bold: true, font: 'Times New Roman', size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Mức độ', bold: true, font: 'Times New Roman', size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Đáp án', bold: true, font: 'Times New Roman', size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Lời giải chi tiết & Căn cứ sư phạm', bold: true, font: 'Times New Roman', size: 22 })] })],
                  }),
                ],
              })
            ];

            quizQuestions.forEach((q, idx) => {
              quizAnsRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, bold: true, font: 'Times New Roman', size: 22 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: q.level, font: 'Times New Roman', size: 22 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: String.fromCharCode(65 + q.correctAnswer), bold: true, color: '0F766E', font: 'Times New Roman', size: 22 })] })],
                    }),
                    new TableCell({
                      children: [createMathParagraph(q.explanation, { font: 'Times New Roman', size: 22 })],
                    }),
                  ],
                })
              );
            });

            const quizAnsTable = new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
              },
              rows: quizAnsRows,
            });

            supp.push(quizAnsTable);

            // 3. Digital Resource Bank Table
            supp.push(createSubHeader('3. Danh mục Ngân hàng Học liệu Số & Đường liên kết tham khảo:'));

            const resourcesTable = new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 10, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true, font: 'Times New Roman', size: 22 })] })],
                    }),
                    new TableCell({
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Loại học liệu', bold: true, font: 'Times New Roman', size: 22 })] })],
                    }),
                    new TableCell({
                      width: { size: 35, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Tên học liệu / Mô tả', bold: true, font: 'Times New Roman', size: 22 })] })],
                    }),
                    new TableCell({
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Khai thác dạy học', bold: true, font: 'Times New Roman', size: 22 })] })],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '1', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Video bài giảng số', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Video tư liệu khám phá bài ${plan.info.lessonTitle}`, font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Trình chiếu phần Mở đầu / Khám phá kiến thức', font: 'Times New Roman', size: 22 })] })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '2', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sơ đồ tư duy số (Mindmap)', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sơ đồ hệ thống hóa kiến thức bài học', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Học sinh tổng kết bài phần Luyện tập', font: 'Times New Roman', size: 22 })] })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '3', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Slide NotebookLM / PPT', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Bộ Slide tương tác sinh từ Prompt NotebookLM AI', font: 'Times New Roman', size: 22 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Giảng dạy trực tiếp trên lớp', font: 'Times New Roman', size: 22 })] })] }),
                  ],
                }),
              ],
            });

            supp.push(resourcesTable);

            return supp;
          })(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Giao_An_${plan.info.lessonTitle.replace(/\s+/g, '_')}_CV5512.docx`;
  saveAs(blob, filename);
}

export async function exportPreservedDocumentToDocx(
  fullText: string,
  documentTitle: string = 'Giáo Án Tích Hợp AI'
) {
  const lines = fullText.split('\n');
  const docParagraphs: Paragraph[] = [];

  // Header banner paragraph in Word document
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: (documentTitle || 'GIÁO ÁN TÍCH HỢP AI').toUpperCase(),
          bold: true,
          size: 28, // 14pt
          color: '1E3A8A', // Dark navy
          font: 'Times New Roman',
        }),
      ],
    })
  );

  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: '(Bản giáo án tích hợp AI - Giữ nguyên 100% nội dung & định dạng tài liệu gốc)',
          italics: true,
          size: 22, // 11pt
          color: '475569',
          font: 'Times New Roman',
        }),
      ],
    })
  );

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      docParagraphs.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Check if line is an integrated line like *Kỹ năng số: ..., *Môi trường: ..., *STEM: ..., [TÍCH HỢP ...
    const isIntegrationLine =
      /^\s*\*?(Kỹ năng số|Năng lực số|Môi trường|Hướng nghiệp|An toàn giao thông|Giáo dục địa phương|STEM|Tích hợp[^:]*):/i.test(trimmed) ||
      /^\s*\*+[^*]+\*+/.test(trimmed) ||
      /\[TÍCH HỢP [^\]]+\]/i.test(trimmed);

    if (isIntegrationLine) {
      docParagraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 60, line: 276 },
          children: [
            new TextRun({
              text: trimmed,
              italics: true,
              bold: true,
              font: 'Times New Roman',
              size: 26, // 13pt
              color: '0F766E', // Dark Teal green for integration additions
            }),
          ],
        })
      );
      continue;
    }

    // Parse [TÍCH HỢP ...] tags inside line if any
    const runs: (TextRun | Math)[] = [];
    const tagRegex = /\[TÍCH HỢP [^\]]+\]/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(rawLine)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = rawLine.substring(lastIndex, match.index);
        runs.push(...convertTextWithMathToDocxRuns(textBefore, { font: 'Times New Roman', size: 26 }));
      }
      runs.push(
        new TextRun({
          text: match[0],
          bold: true,
          font: 'Times New Roman',
          size: 26, // 13pt
          color: '0F766E', // Teal green for integration additions
        })
      );
      lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < rawLine.length) {
      const remainingText = rawLine.substring(lastIndex);
      runs.push(...convertTextWithMathToDocxRuns(remainingText, { font: 'Times New Roman', size: 26 }));
    }

    // Check heading styles
    const isMainTitle =
      /^(BÀI|CHƯƠNG|KẾ HOẠCH BÀI DẠY|GIÁO ÁN|PHẦN|BÀI HỌC|TIẾT)\b/i.test(trimmed) ||
      /^[I|V|X]+\.\s+/i.test(trimmed) ||
      /^#{1,2}\s+/.test(trimmed);

    const isSubTitle =
      /^(HOẠT ĐỘNG|MỤC TIÊU|THIẾT BỊ|TIẾN TRÌNH|ĐÁNH GIÁ|DẶN DÒ|LUYỆN TẬP|VẬN DỤNG|\d+\.|[a-z]\))\s+/i.test(trimmed) ||
      /^#{3,4}\s+/.test(trimmed);

    const cleanLineText = trimmed.replace(/^#{1,6}\s+/, '');

    if (isMainTitle) {
      docParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          children: runs.length > 0 ? runs : [
            new TextRun({
              text: cleanLineText,
              bold: true,
              size: 28,
              color: '1E3A8A',
              font: 'Times New Roman',
            })
          ],
        })
      );
    } else if (isSubTitle) {
      docParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: runs.length > 0 ? runs : [
            new TextRun({
              text: cleanLineText,
              bold: true,
              size: 26,
              color: '0F172A',
              font: 'Times New Roman',
            })
          ],
        })
      );
    } else {
      docParagraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 80, line: 276 }, // 1.15 line spacing
          children: runs,
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 }, // Standard margins
          },
        },
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${(documentTitle || 'Giao_An_Tich_Hop').replace(/[/\\?%*:|"<>]/g, '_')}_TichHop.docx`;
  saveAs(blob, safeFilename);
}

