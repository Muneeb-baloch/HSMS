import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../auth/types';
import { AppError } from '../../middleware/error.middleware';
import { defaulterService } from '../services/service-defaulter';
import { DefaulterQueryParams, SendNoticeDto, SetRemarksDto, SetStatusOverrideDto } from '../types/types-defaulter';

const handleError = (error: any, next: NextFunction) => {
  next(error);
};

export const defaulterController = {
  /**
   * Get live, ledger-derived defaulter list
   */
  getDefaulters: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams: DefaulterQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        search: req.query.search as string,
        status: req.query.status as any,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        minDays: req.query.minDays ? parseInt(req.query.minDays as string) : undefined,
        maxDays: req.query.maxDays ? parseInt(req.query.maxDays as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await defaulterService.getDefaulters(queryParams);

      res.json({
        success: true,
        data: {
          defaulters: result.defaulters,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get a single file's defaulter row
   */
  getDefaulter: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileId = req.params.fileId as string;
      const defaulter = await defaulterService.getDefaulterByFileId(fileId);

      res.json({
        success: true,
        data: defaulter,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Set or clear the staff status override
   */
  setStatusOverride: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const fileId = req.params.fileId as string;
      const { status }: SetStatusOverrideDto = req.body;

      const defaulter = await defaulterService.setStatusOverride(
        fileId,
        status ?? null,
        req.user.userId
      );

      res.json({
        success: true,
        data: defaulter,
        message: status ? 'Status override set' : 'Status override cleared',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Set remarks
   */
  setRemarks: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const fileId = req.params.fileId as string;
      const { remarks }: SetRemarksDto = req.body;

      if (remarks === undefined) {
        throw new AppError(400, 'Remarks are required');
      }

      const defaulter = await defaulterService.setRemarks(fileId, remarks, req.user.userId);

      res.json({
        success: true,
        data: defaulter,
        message: 'Remarks updated',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Record a notice sent to a defaulter
   */
  sendNotice: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const fileId = req.params.fileId as string;
      const noticeData: SendNoticeDto = req.body;

      if (!noticeData.noticeType || !noticeData.noticeContent || !noticeData.sendMethod) {
        throw new AppError(400, 'Notice type, content, and send method are required');
      }

      const defaulter = await defaulterService.sendNotice(fileId, noticeData, req.user.userId);

      res.json({
        success: true,
        data: defaulter,
        message: 'Notice sent successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get defaulter statistics
   */
  getDefaulterStatistics: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const statistics = await defaulterService.getDefaulterStatistics();

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      handleError(error, next);
    }
  },
};
