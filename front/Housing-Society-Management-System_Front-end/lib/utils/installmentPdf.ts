import jsPDF from 'jspdf';
import { Installment } from '@/lib/types/installment';
import { formatCurrency, formatDate } from './format';

export const generateInstallmentInvoice = (installment: Installment) => {
  const doc = new jsPDF();

  // Colors
  const primaryColor = [25, 118, 210];
  const lightGray = [242, 242, 242];
  const darkGray = [51, 51, 51];

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('INVOICE', 20, 25);

  // Document number
  doc.setFontSize(11);
  doc.text(`Installment #${installment.installmentNo}`, 20, 35);

  // Company info section
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.text('Housing Society Management System', 20, 55);
  doc.text('Financial Services', 20, 62);

  // Invoice date and due date
  doc.setFontSize(9);
  doc.text(`Invoice Date: ${formatDate(new Date())}`, 140, 55);
  doc.text(`Due Date: ${formatDate(installment.dueDate)}`, 140, 62);

  // Member Information
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(20, 75, 170, 30, 'F');

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('BILL TO:', 25, 82);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  const memberName = typeof installment.memId === 'object'
    ? installment.memId.memName
    : 'Member';
  const fileNo = typeof installment.fileId === 'object'
    ? installment.fileId.fileRegNo
    : 'File';

  doc.text(memberName, 25, 90);
  doc.text(`File No: ${fileNo}`, 25, 97);

  // Installment Details Table
  const tableTop = 115;
  const tableData = [
    ['Description', 'Amount Due', 'Paid', 'Balance'],
    [
      installment.installmentTitle,
      formatCurrency(installment.amountDue),
      formatCurrency(installment.amountPaid),
      formatCurrency(installment.balanceAmount)
    ]
  ];

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);

  const colWidths = [80, 40, 30, 40];
  let currentX = 20;

  // Draw table header
  tableData[0].forEach((header, i) => {
    doc.rect(currentX, tableTop, colWidths[i], 8, 'F');
    doc.text(header, currentX + 2, tableTop + 6);
    currentX += colWidths[i];
  });

  // Draw table row
  currentX = 20;
  doc.setFont(undefined, 'normal');
  doc.setFillColor(255, 255, 255);

  tableData[1].forEach((value, i) => {
    doc.rect(currentX, tableTop + 8, colWidths[i], 8, 'S');
    const align = i > 0 ? 'right' : 'left';
    doc.text(
      value,
      align === 'right' ? currentX + colWidths[i] - 2 : currentX + 2,
      tableTop + 14,
      { align }
    );
    currentX += colWidths[i];
  });

  // Summary section
  const summaryTop = tableTop + 25;

  doc.setFont(undefined, 'bold');
  doc.text('SUMMARY', 120, summaryTop);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  const summaryItems = [
    [`Total Due: ${formatCurrency(installment.amountDue)}`, summaryTop + 8],
    [`Paid: ${formatCurrency(installment.amountPaid)}`, summaryTop + 14],
    [`Balance: ${formatCurrency(installment.balanceAmount)}`, summaryTop + 20],
    [`Status: ${installment.status}`, summaryTop + 26]
  ];

  summaryItems.forEach(([text, y]) => {
    doc.text(text, 120, y as number);
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'This is an automatically generated invoice. Please contact the society office for any discrepancies.',
    20,
    doc.internal.pageSize.getHeight() - 15,
    { maxWidth: 170 }
  );

  doc.text(
    `Generated on ${formatDate(new Date())}`,
    20,
    doc.internal.pageSize.getHeight() - 8
  );

  // Download
  const filename = `Installment-${installment.installmentNo}-${installment.memId && typeof installment.memId === 'object' ? installment.memId.memName : 'Member'}.pdf`;
  doc.save(filename);
};
