import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
  deleteUser
} from '../controllers/userController';

import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', protect, authorizeRoles('admin'), getUsers);
router.post('/', protect, authorizeRoles('admin'), createUser);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.patch('/:id/status', protect, authorizeRoles('admin'), toggleUserStatus);
router.patch('/:id/reset-password', protect, authorizeRoles('admin'), resetPassword);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

export default router;