import { ClientSession, Types } from 'mongoose';
import File from '../../File/models/models-file';
import Installment, { InstallmentStatus } from '../../Installment/models/models-installment';
import BillInfo, { BillStatus } from '../../BillI/models/models-bill-info';
import Plot from '../../Plots/models/models-plot';
import Member from '../../Member/models/models-member';
import Society from '../../Society/models/models-society';
import Payment, { generateReceiptNo } from '../models/models-payment';
import { CreateReceiptParams, PaymentQueryParams } from '../types/types-payment';
import { amountInWordsPKR } from '../utils/amountInWords';

const toPlainObject = (doc: any): any => {
  const plainObj = doc.toObject ? doc.toObject() : doc;
  if (!plainObj.createdAt && doc.createdAt) plainObj.createdAt = doc.createdAt;
  if (!plainObj.updatedAt && doc.updatedAt) plainObj.updatedAt = doc.updatedAt;
  return plainObj;
};

export const paymentService = {
  /**
   * Creates one Payment (receipt) document. Called from inside the same
   * transaction as the balance/status update in installmentService.recordPayment
   * and billInfoService.recordPayment, so a failed payment never leaves an
   * orphaned receipt (and a failed receipt never leaves a payment recorded
   * without one).
   */
  async createReceipt(params: CreateReceiptParams, session: ClientSession | undefined): Promise<any> {
    const receiptNo = await generateReceiptNo(session);

    const [payment] = await Payment.create(
      [
        {
          receiptNo,
          fileId: params.fileId,
          paidByMemId: params.paidByMemId,
          targetType: params.targetType,
          targetId: params.targetId,
          amount: params.amount,
          paymentDate: new Date(params.paymentDate),
          paymentMode: params.paymentMode,
          transactionRefNo: params.transactionRefNo,
          receivedBy: params.receivedBy,
          remarks: params.remarks,
          reversed: false,
          migrated: false,
          societyId: params.societyId,
          isDeleted: false,
        },
      ],
      { session }
    );

    return payment;
  },

  /**
   * Payments for a file's "Payments" section - newest first, across both
   * installment and bill receipts.
   */
  async getPaymentsByFile(fileId: string): Promise<any[]> {
    const payments = await Payment.find({
      fileId: new Types.ObjectId(fileId),
      isDeleted: false,
    })
      .populate('receivedBy', 'firstName lastName fullName')
      .sort({ paymentDate: -1, createdAt: -1 });

    return payments.map(toPlainObject);
  },

  async getPaymentsByTarget(targetType: string, targetId: string): Promise<any[]> {
    const payments = await Payment.find({
      targetType,
      targetId: new Types.ObjectId(targetId),
      isDeleted: false,
    })
      .populate('receivedBy', 'firstName lastName fullName')
      .sort({ paymentDate: -1, createdAt: -1 });

    return payments.map(toPlainObject);
  },

  async getPayments(params: PaymentQueryParams): Promise<{
    payments: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { page = 1, limit = 20, fileId, targetType, targetId } = params;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };
    if (fileId) query.fileId = new Types.ObjectId(fileId);
    if (targetType) query.targetType = targetType;
    if (targetId) query.targetId = new Types.ObjectId(targetId);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('receivedBy', 'firstName lastName fullName')
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .then(docs => docs.map(toPlainObject)),
      Payment.countDocuments(query),
    ]);

    return { payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  /**
   * Full receipt detail for display/PDF - resolves society/member/plot/file
   * and the specific installment title or bill month+type being paid.
   */
  async getReceiptDetail(id: string): Promise<any> {
    const payment = await Payment.findOne({ _id: id, isDeleted: false }).populate(
      'receivedBy',
      'firstName lastName fullName'
    );
    if (!payment) {
      throw new Error('Receipt not found');
    }

    const [file, member, society] = await Promise.all([
      File.findById(payment.fileId).select('fileRegNo plotId'),
      Member.findById(payment.paidByMemId).select('memName memNic'),
      Society.findById(payment.societyId).select('societyName address contactPhone contactEmail'),
    ]);

    const plot = file?.plotId ? await Plot.findById(file.plotId).select('plotNo') : null;

    let targetDescription = 'Payment';
    if (payment.targetType === 'installment') {
      const installment = await Installment.findById(payment.targetId).select(
        'installmentTitle installmentNo'
      );
      if (installment) {
        targetDescription = installment.installmentTitle;
      }
    } else if (payment.targetType === 'bill') {
      const bill = await BillInfo.findById(payment.targetId)
        .select('billMonth billTypeId')
        .populate('billTypeId', 'billTypeName');
      if (bill) {
        const billTypeName = (bill.billTypeId as any)?.billTypeName || 'Bill';
        targetDescription = `${billTypeName} - ${bill.billMonth}`;
      }
    }

    return {
      ...toPlainObject(payment),
      file: file ? { fileRegNo: file.fileRegNo } : null,
      member: member ? { memName: member.memName, memNic: member.memNic } : null,
      plot: plot ? { plotNo: plot.plotNo } : null,
      society: society
        ? {
            societyName: society.societyName,
            address: (society as any).address,
            contactPhone: (society as any).contactPhone,
            contactEmail: (society as any).contactEmail,
          }
        : null,
      targetDescription,
      amountInWords: amountInWordsPKR(payment.amount),
    };
  },

  /**
   * Collected (from the Payment ledger) vs due (from Installment/BillInfo
   * totalPayable on their dueDate) by calendar month, for the dashboard
   * trend chart. Always returns exactly `months` trailing points, including
   * months with no activity, so the chart has a continuous x-axis.
   */
  async getMonthlyTrend(
    months = 12
  ): Promise<{ monthKey: string; month: string; collected: number; due: number }[]> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const [collectedAgg, dueInstallmentAgg, dueBillAgg] = await Promise.all([
      Payment.aggregate([
        { $match: { isDeleted: false, reversed: false, paymentDate: { $gte: start } } },
        {
          $group: {
            _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
            amount: { $sum: '$amount' },
          },
        },
      ]),
      Installment.aggregate([
        {
          $match: {
            isDeleted: false,
            status: { $nin: [InstallmentStatus.CANCELLED, InstallmentStatus.REFUNDED] },
            dueDate: { $gte: start },
          },
        },
        {
          $group: {
            _id: { year: { $year: '$dueDate' }, month: { $month: '$dueDate' } },
            amount: { $sum: '$totalPayable' },
          },
        },
      ]),
      BillInfo.aggregate([
        {
          $match: {
            isDeleted: false,
            status: { $ne: BillStatus.CANCELLED },
            dueDate: { $gte: start },
          },
        },
        {
          $group: {
            _id: { year: { $year: '$dueDate' }, month: { $month: '$dueDate' } },
            amount: { $sum: '$totalPayable' },
          },
        },
      ]),
    ]);

    const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

    const collectedByMonth = new Map<string, number>(
      collectedAgg.map(r => [monthKey(r._id.year, r._id.month), r.amount])
    );

    const dueByMonth = new Map<string, number>();
    for (const r of [...dueInstallmentAgg, ...dueBillAgg]) {
      const key = monthKey(r._id.year, r._id.month);
      dueByMonth.set(key, (dueByMonth.get(key) || 0) + r.amount);
    }

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d.getFullYear(), d.getMonth() + 1);
      result.push({
        monthKey: key,
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        collected: collectedByMonth.get(key) || 0,
        due: dueByMonth.get(key) || 0,
      });
    }

    return result;
  },
};
