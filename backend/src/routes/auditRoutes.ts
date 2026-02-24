import { Router } from 'express';
import { getAuditLogs, exportAuditLogsCSV } from '../controllers/auditController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', protect, authorizeRoles('admin'), getAuditLogs);

router.get('/export', protect, authorizeRoles('admin'), exportAuditLogsCSV);

export default router;