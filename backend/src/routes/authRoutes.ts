import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get(
  '/profile',
  protect,
  (req, res) => {
    res.json({ message: 'Perfil protegido', user: (req as any).user });
  }
);

router.get(
  '/admin-test',
  protect,
  authorizeRoles('admin'),
  (req, res) => {
    res.json({ message: 'Solo admin puede ver esto' });
  }
);

export default router;