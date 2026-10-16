import PDFDocument from 'pdfkit';
import { amountInWordsPKR } from '../utils/amountInWords';

/**
 * Renders a receipt as a PDF buffer. Built with pdfkit (programmatic
 * drawing, no HTML/browser involved) rather than the HTML templates in
 * PDFGenerator - those only ever produced an HTML string for a client-side
 * converter to finish, never an actual PDF byte stream.
 */
export function buildReceiptPdf(detail: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const societyName = detail.society?.societyName || 'Housing Society';
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(societyName, { align: 'center' });

      if (detail.society?.address) {
        doc.fontSize(9).font('Helvetica').text(detail.society.address, { align: 'center' });
      }

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PAYMENT RECEIPT', { align: 'center', underline: true });
      doc.moveDown(1);

      const startY = doc.y;
      const col1X = doc.page.margins.left;
      const col2X = doc.page.margins.left + pageWidth / 2;

      doc.fontSize(10).font('Helvetica-Bold').text('Receipt No:', col1X, startY);
      doc.font('Helvetica').text(detail.receiptNo, col1X + 100, startY);

      doc.font('Helvetica-Bold').text('Date:', col2X, startY);
      doc
        .font('Helvetica')
        .text(new Date(detail.paymentDate).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }), col2X + 60, startY);

      doc.moveDown(1.5);

      const rows: Array<[string, string]> = [
        ['Member Name', detail.member?.memName || '—'],
        ['CNIC', detail.member?.memNic || '—'],
        ['File No', detail.file?.fileRegNo || '—'],
        ['Plot No', detail.plot?.plotNo || '—'],
        ['Paid Against', detail.targetDescription || '—'],
        ['Payment Mode', detail.paymentMode || '—'],
      ];
      if (detail.transactionRefNo) {
        rows.push(['Transaction Ref', detail.transactionRefNo]);
      }

      for (const [label, value] of rows) {
        const y = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text(`${label}:`, col1X, y, { width: 150 });
        doc.font('Helvetica').text(value, col1X + 150, y, { width: pageWidth - 150 });
        doc.moveDown(0.6);
      }

      doc.moveDown(1);
      doc
        .rect(col1X, doc.y, pageWidth, 50)
        .stroke();
      const boxY = doc.y + 10;
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Amount Received: PKR ${detail.amount.toLocaleString()}`, col1X + 10, boxY);
      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text(amountInWordsPKR(detail.amount), col1X + 10, boxY + 18, { width: pageWidth - 20 });

      doc.moveDown(5);
      const receivedByName =
        detail.receivedBy?.fullName ||
        [detail.receivedBy?.firstName, detail.receivedBy?.lastName].filter(Boolean).join(' ') ||
        '—';
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Received By: ${receivedByName}`, col1X, doc.y);

      doc.moveDown(2);
      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('#666666')
        .text('This is a computer-generated receipt and does not require a physical signature.', {
          align: 'center',
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
