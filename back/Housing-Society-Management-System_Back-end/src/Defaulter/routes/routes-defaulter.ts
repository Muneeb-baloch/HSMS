import { Router } from 'express';
import { authenticate, requireRole } from '../../auth/middleware/auth';
import { validateRequest } from '../../Complaint/middleware/validation.middleware';
import { UserRole } from '../../database/models/User';
import { defaulterController } from '../controllers/controller-defaulter';
import {
  validateFileIdParam,
  validateGetDefaulters,
  validateSendNotice,
  validateSetRemarks,
  validateSetStatusOverride,
} from '../validators/validator-defaulter';

const router: Router = Router();

router.get('/statistics', defaulterController.getDefaulterStatistics);

router.get(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateGetDefaulters(),
  validateRequest,
  defaulterController.getDefaulters
);

router.get(
  '/:fileId',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateFileIdParam(),
  validateRequest,
  defaulterController.getDefaulter
);

router.patch(
  '/:fileId/status',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateFileIdParam(),
  validateSetStatusOverride(),
  validateRequest,
  defaulterController.setStatusOverride
);

router.patch(
  '/:fileId/remarks',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateFileIdParam(),
  validateSetRemarks(),
  validateRequest,
  defaulterController.setRemarks
);

router.post(
  '/:fileId/notice',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateFileIdParam(),
  validateSendNotice(),
  validateRequest,
  defaulterController.sendNotice
);

export default router;
