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

          createSectionHeader('IV. HƯỚNG DẪN ĐÁNH GIÁ & PHÂN HÓA'),
          createBullet(plan.differentiation.weakSupport, 'Phân hóa HS yếu / hỗ trợ:'),
          createBullet(plan.differentiation.advancedSupport, 'Phân hóa HS khá / giỏi:'),
          createBullet(`${plan.assessment.type} - ${plan.assessment.details}`, 'Phương pháp đánh giá:'),

          ...(() => {
            const supp: (Paragraph | Table)[] = [];
            supp.push(createSectionHeader('V. PHỤ LỤC: NGÂN HÀNG HỌC LIỆU BỔ TRỢ & BỘ CÂU HỎI QUIZ CỦNG CỐ'));

            // 1. Worksheets
            const worksheets = plan.supplementaryMaterials?.worksheets || [];

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
            const quizQuestions = plan.supplementaryMaterials?.quizQuestions || [];

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
