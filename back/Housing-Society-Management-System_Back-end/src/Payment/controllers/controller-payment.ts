import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error.middleware';
import { paymentService } from '../services/service-payment';
import { buildReceiptPdf } from '../services/service-payment-pdf';
import { PaymentQueryParams } from '../types/types-payment';

const handleError = (error: any, next: NextFunction) => {
  next(error);
};

export const paymentController = {
  getPayments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams: PaymentQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        fileId: req.query.fileId as string,
        targetType: req.query.targetType as any,
        targetId: req.query.targetId as string,
      };

      const result = await paymentService.getPayments(queryParams);

      res.json({
        success: true,
        data: { payments: result.payments, pagination: result.pagination },
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  getPaymentsByFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileId = req.params.fileId as string;
      const payments = await paymentService.getPaymentsByFile(fileId);
      res.json({ success: true, data: payments });
    } catch (error) {
      handleError(error, next);
    }
  },

  getPaymentsByTarget: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetType = req.params.targetType as string;
      const targetId = req.params.targetId as string;
      const payments = await paymentService.getPaymentsByTarget(targetType, targetId);
      res.json({ success: true, data: payments });
    } catch (error) {
      handleError(error, next);
    }
  },

  getReceipt: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const detail = await paymentService.getReceiptDetail(id);
      res.json({ success: true, data: detail });
    } catch (error) {
      handleError(error, next);
    }
  },

  getMonthlyTrend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 12;
      const trend = await paymentService.getMonthlyTrend(months);
      res.json({ success: true, data: trend });
    } catch (error) {
      handleError(error, next);
    }
  },

  getReceiptPdf: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const detail = await paymentService.getReceiptDetail(id);

      if (!detail) {
        throw new AppError(404, 'Receipt not found');
      }

      const pdfBuffer = await buildReceiptPdf(detail);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${detail.receiptNo}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      handleError(error, next);
    }
  },
};
