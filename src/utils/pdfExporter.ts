import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { FullLessonPlan } from '../types';

export function generatePrintableHtmlBody(plan: FullLessonPlan, layoutFormat: string = 'three_column'): string {
  const schoolName = plan.info?.schoolName || 'TRƯỜNG THCS / THPT........................';
  const teacherName = plan.info?.teacherName || 'GIÁO VIÊN: .......................................';
  const departmentName = plan.info?.departmentName || '.............................';
  const lessonTitle = plan.info?.lessonTitle || 'BÀI HỌC';
  const subject = plan.subject || '';
  const grade = plan.grade || '';
  const textbook = plan.textbook || '';
  const periodNumber = plan.info?.periodNumber || '1';
  const duration = plan.info?.duration || '45 phút';

  const requirements = plan.objectives?.requirementsToAchieve || [];
  const generalComp = plan.objectives?.generalCompetencies || [];
  const specificComp = plan.objectives?.specificCompetencies || [];
  const qualities = plan.objectives?.qualities || [];

  const equipments = plan.equipmentsAndMaterials?.equipments || [];
  const materials = plan.equipmentsAndMaterials?.materials || [];

  const activities = plan.activities || [];

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #000000; background-color: #ffffff; line-height: 1.4; font-size: 13pt; max-width: 800px; margin: 0 auto; padding: 15px; box-sizing: border-box;">
      <!-- Header Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: none;">
        <tr>
          <td style="width: 50%; text-align: left; vertical-align: top; border: none; padding: 0;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 11pt;">${schoolName}</div>
            <div style="font-size: 11pt;">Tổ chuyên môn: ${departmentName}</div>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: top; border: none; padding: 0;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 11pt;">HỌ VÀ TÊN GV: ${teacherName}</div>
            <div style="font-size: 11pt;">Ngày soạn: ${plan.info?.date || '..../..../2026'}</div>
          </td>
        </tr>
      </table>

      <!-- Title -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 5px 0; color: #000000;">KẾ HOẠCH BÀI DẠY (GIÁO ÁN)</h2>
        <h3 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 5px 0; color: #000000;">BÀI: ${lessonTitle}</h3>
        <div style="font-size: 12pt; font-style: italic; color: #333333;">
          Môn: ${subject} - ${grade} (${textbook}) | Tiết phân phối chương trình: ${periodNumber} (${duration})
        </div>
      </div>

      <!-- I. MỤC TIÊU -->
      <div style="margin-bottom: 15px;">
        <h4 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #000000;">I. MỤC TIÊU BÀI HỌC</h4>
        <div style="margin-left: 15px;">
          <p style="font-weight: bold; margin: 4px 0;">1. Yêu cầu cần đạt:</p>
          <ul style="margin: 4px 0 8px 20px; padding: 0;">
            ${requirements.map((req) => `<li style="margin-bottom: 3px;">${req}</li>`).join('')}
          </ul>

          <p style="font-weight: bold; margin: 4px 0;">2. Năng lực cần phát triển:</p>
          <div style="margin-left: 15px;">
            <p style="margin: 3px 0;">a) Năng lực chung: ${generalComp.join(', ')}</p>
            <p style="margin: 3px 0;">b) Năng lực đặc thù: ${specificComp.join(', ')}</p>
          </div>

          <p style="font-weight: bold; margin: 6px 0 4px 0;">3. Phẩm chất chủ yếu:</p>
          <p style="margin-left: 15px; margin-top: 2px;">${qualities.join(', ')}</p>
        </div>
      </div>

      <!-- II. THIẾT BỊ DẠY HỌC -->
      <div style="margin-bottom: 15px;">
        <h4 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #000000;">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h4>
        <div style="margin-left: 15px;">
          <p style="margin: 3px 0;"><strong>1. Giáo viên:</strong> ${equipments.join(', ')}</p>
          <p style="margin: 3px 0;"><strong>2. Học sinh:</strong> ${materials.join(', ')}</p>
        </div>
      </div>

      <!-- III. TIẾN TRÌNH DẠY HỌC -->
      <div style="margin-bottom: 15px;">
        <h4 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; color: #000000;">III. TIẾN TRÌNH DẠY HỌC</h4>

        ${activities
          .map((act, idx) => {
            if (layoutFormat === 'three_column') {
              return `
                <div style="margin-bottom: 20px; page-break-inside: avoid;">
                  <h5 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #1e3a8a; margin-bottom: 6px;">
                    HOẠT ĐỘNG ${idx + 1}: ${act.name} (${act.duration})
                  </h5>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11pt;" border="1" cellPadding="6">
                    <thead>
                      <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold; color: #000000;">
                        <th style="width: 38%; border: 1px solid #333; padding: 6px;">HOẠT ĐỘNG CỦA GIÁO VIÊN</th>
                        <th style="width: 32%; border: 1px solid #333; padding: 6px;">HOẠT ĐỘNG CỦA HỌC SINH</th>
                        <th style="width: 30%; border: 1px solid #333; padding: 6px;">NỘI DUNG & SẢN PHẨM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <strong>a) Mục tiêu:</strong> ${act.objective || ''}
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <strong>b) Nội dung:</strong> ${act.content || ''}
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <strong>c) Sản phẩm:</strong> ${act.product || ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">1. Chuyển giao nhiệm vụ:</p>
                          <p style="margin: 0;">${act.implementation?.transfer || ''}</p>
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="margin: 0;">Lắng nghe, tiếp nhận nhiệm vụ từ GV.</p>
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="margin: 0;">Nắm rõ định hướng hoạt động.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">2. Theo dõi & Hỗ trợ:</p>
                          <p style="margin: 0;">GV quan sát, điều phối, hỗ trợ học sinh gặp khó khăn.</p>
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">2. Thực hiện nhiệm vụ:</p>
                          <p style="margin: 0;">${act.implementation?.execution || ''}</p>
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="margin: 0;">Kết quả/nháp sản phẩm thảo luận.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">3. Đánh giá & Báo cáo:</p>
                          <p style="margin: 0;">GV mời đại diện báo cáo, tổ chức cho các nhóm nhận xét chéo.</p>
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">3. Báo cáo, thảo luận:</p>
                          <p style="margin: 0;">${act.implementation?.reporting || ''}</p>
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="margin: 0;">Nội dung phát biểu & ý kiến phản biện.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;" colspan="2">
                          <p style="font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">4. Kết luận, nhận định (GV):</p>
                          <p style="margin: 0;">${act.implementation?.conclusion || ''}</p>
                        </td>
                        <td style="border: 1px solid #333; vertical-align: top; padding: 6px;">
                          <p style="font-weight: bold; margin: 0 0 4px 0; color: #0f172a;">Nội dung chuẩn ghi vở:</p>
                          <p style="margin: 0;">Sản phẩm hoàn chỉnh học sinh ghi chép.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              `;
            } else {
              // Standard Paragraph Layout
              return `
                <div style="margin-bottom: 15px; page-break-inside: avoid;">
                  <h5 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #1e3a8a; margin-bottom: 4px;">
                    HOẠT ĐỘNG ${idx + 1}: ${act.name} (${act.duration})
                  </h5>
                  <div style="margin-left: 15px;">
                    <p style="margin: 3px 0;"><strong>a) Mục tiêu:</strong> ${act.objective || ''}</p>
                    <p style="margin: 3px 0;"><strong>b) Nội dung:</strong> ${act.content || ''}</p>
                    <p style="margin: 3px 0;"><strong>c) Sản phẩm:</strong> ${act.product || ''}</p>
                    <p style="margin: 3px 0;"><strong>d) Tổ chức thực hiện:</strong></p>
                    <div style="margin-left: 15px;">
                      <p style="margin: 3px 0;">- <em>Bước 1: Chuyển giao nhiệm vụ:</em> ${act.implementation?.transfer || ''}</p>
                      <p style="margin: 3px 0;">- <em>Bước 2: Thực hiện nhiệm vụ:</em> ${act.implementation?.execution || ''}</p>
                      <p style="margin: 3px 0;">- <em>Bước 3: Báo cáo, thảo luận:</em> ${act.implementation?.reporting || ''}</p>
                      <p style="margin: 3px 0;">- <em>Bước 4: Kết luận, nhận định:</em> ${act.implementation?.conclusion || ''}</p>
                    </div>
                  </div>
                </div>
              `;
            }
          })
          .join('')}
      </div>

      <!-- IV. ĐÁNH GIÁ -->
      ${
        plan.assessment
          ? `
        <div style="margin-bottom: 15px;">
          <h4 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #000000;">IV. HƯỚNG DẪN ĐÁNH GIÁ</h4>
          <div style="margin-left: 15px;">
            <p style="margin: 3px 0;"><strong>Hình thức:</strong> ${plan.assessment.type || ''}</p>
            <p style="margin: 3px 0;"><strong>Chi tiết:</strong> ${plan.assessment.details || ''}</p>
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;
}

// Download Standalone Printable A4 HTML Document
export function downloadPrintableHtml(plan: FullLessonPlan, layoutFormat: string = 'three_column') {
  const cleanTitle = (plan.info?.lessonTitle || 'Lesson').replace(/[\/\\?%*:|"<>]/g, '_').trim();
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Giáo Án A4 - ${plan.info?.lessonTitle || 'Bài dạy'}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Times New Roman', Times, serif; background: #e2e8f0; margin: 0; padding: 20px; }
          .page-container { background: white; max-width: 800px; margin: 0 auto; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 4px; }
          @media print {
            body { background: white; padding: 0; }
            .page-container { box-shadow: none; max-width: 100%; padding: 0; }
            .no-print { display: none !important; }
          }
          .btn-print {
            position: fixed; top: 20px; right: 20px; background: #1e3a8a; color: white; border: none; padding: 12px 24px;
            font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 9999;
          }
          .btn-print:hover { background: #1e40af; }
        </style>
      </head>
      <body>
        <button class="btn-print no-print" onclick="window.print()">🖨️ In / Lưu thành file PDF (Ctrl+P)</button>
        <div class="page-container">
          ${generatePrintableHtmlBody(plan, layoutFormat)}
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `Giao_An_${cleanTitle}_A4.html`);
}

// Export Lesson Plan directly to PDF
export async function exportLessonPlanToPdf(
  plan: FullLessonPlan,
  layoutFormat: string = 'three_column',
  _sourceElement?: HTMLElement | null
): Promise<boolean> {
  const cleanTitle = (plan.info?.lessonTitle || 'Lesson').replace(/[\/\\?%*:|"<>]/g, '_').trim();
  const fileName = `Giao_An_${cleanTitle}.pdf`;

  // Create clean, properly styled container in DOM for html2canvas
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px'; // 210mm at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.zIndex = '-99999';
  container.style.padding = '20px';
  container.style.boxSizing = 'border-box';
  container.innerHTML = generatePrintableHtmlBody(plan, layoutFormat);

  document.body.appendChild(container);

  // Allow DOM to compute styles and fonts
  await new Promise((resolve) => setTimeout(resolve, 250));

  try {
    let pdfWorker: any = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any)?.default;
    if (!pdfWorker && typeof (window as any).html2pdf === 'function') {
      pdfWorker = (window as any).html2pdf;
    }

    if (pdfWorker) {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await pdfWorker().set(opt).from(container).save();
      return true;
    } else {
      console.warn('html2pdf library not available, using HTML fallback.');
      downloadPrintableHtml(plan, layoutFormat);
      return false;
    }
  } catch (err) {
    console.error('PDF Export Error:', err);
    // Fallback to downloading standalone printable HTML
    downloadPrintableHtml(plan, layoutFormat);
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
