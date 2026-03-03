import { Router } from 'express';
import { exportCasesPDF } from '../controllers/report.controller';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/cases/pdf', protect, exportCasesPDF);

export default router;