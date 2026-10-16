import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate, requireRole } from '../../auth/middleware/auth';
import { validateRequest } from '../../Complaint/middleware/validation.middleware';
import { UserRole } from '../../database/models/User';
import { paymentController } from '../controllers/controller-payment';

const router: Router = Router();

router.get(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  paymentController.getPayments
);

router.get(
  '/file/:fileId',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  param('fileId').isMongoId().withMessage('Invalid File ID'),
  validateRequest,
  paymentController.getPaymentsByFile
);

router.get(
  '/by-target/:targetType/:targetId',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  param('targetType').isIn(['installment', 'bill']).withMessage('Invalid target type'),
  param('targetId').isMongoId().withMessage('Invalid target ID'),
  validateRequest,
  paymentController.getPaymentsByTarget
);

router.get(
  '/:id/pdf',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  param('id').isMongoId().withMessage('Invalid Payment ID'),
  validateRequest,
  paymentController.getReceiptPdf
);

router.get(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  param('id').isMongoId().withMessage('Invalid Payment ID'),
  validateRequest,
  paymentController.getReceipt
);

export default router;
