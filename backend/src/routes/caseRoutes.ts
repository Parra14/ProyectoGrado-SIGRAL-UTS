import { Router } from 'express';
import { createCase } from '../controllers/caseController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { getCases } from '../controllers/caseController';
import { addComment, closeCase } from '../controllers/caseController';
import { upload } from '../config/multer';
import { uploadEvidence } from '../controllers/caseController';
import { getDashboardMetrics } from '../controllers/caseController';
import { exportCasesCSV } from '../controllers/caseController';
import { exportCasesPDF } from '../controllers/caseController';
import { getCaseById } from '../controllers/caseController';
import { updateCase } from '../controllers/caseController';





const router = Router();

router.post(
  '/',
  protect,
  authorizeRoles('admin', 'usuario'),
  createCase
);

router.get(
  '/',
  protect,
  authorizeRoles('admin', 'usuario', 'supervisor'),
  getCases
);

router.get(
  '/export/csv',
  protect,
  authorizeRoles('admin', 'usuario', 'supervisor'),
  exportCasesCSV
);

router.get(
  '/export/pdf',
  protect,
  authorizeRoles('admin', 'usuario', 'supervisor'),
  exportCasesPDF
);

router.post(
  '/:id/comment',
  protect,
  authorizeRoles('admin', 'usuario'),
  addComment
);

router.patch(
  '/:id/close',
  protect,
  authorizeRoles('admin', 'usuario'),
  closeCase
);

router.post(
  '/:id/evidence',
  protect,
  authorizeRoles('admin', 'usuario'),
  upload.single('file'),
  uploadEvidence
);

router.get(
  '/dashboard',
  protect,
  authorizeRoles('admin', 'usuario', 'supervisor'),
  getDashboardMetrics
);

router.get(
  '/:id', 
  protect, 
  authorizeRoles('admin', 'usuario'),
  getCaseById);

router.put(
  '/:id', 
  protect, 
  authorizeRoles('admin', 'usuario'),
  updateCase);


export default router;