import { Router } from 'express';
import { createCase } from '../controllers/case.controller';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { getCases } from '../controllers/case.controller';
import { addSeguimiento,  advanceStatus} from '../controllers/case.controller';
import { upload } from '../config/multer';
import { getDashboardMetrics } from '../controllers/case.controller';
import { exportCasesCSV } from '../controllers/case.controller';
import { exportCasesPDF } from '../controllers/case.controller';
import { getCaseById } from '../controllers/case.controller';
import { updateCase } from '../controllers/case.controller';





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
  "/:id/seguimiento",
  protect,
  upload.array("file"),
  addSeguimiento
);

router.patch(
  '/:id/status',
  protect,
  upload.array('file'), 
  advanceStatus
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