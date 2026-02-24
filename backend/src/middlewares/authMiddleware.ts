import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token requerido' });
  }

  try {
    const secret: Secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // 🔍 Buscar usuario real en DB
    const user = await User.findById(decoded.id);

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    // 🔒 Verificar si está activo
    if (!user.isActive) {
      return res.status(403).json({ message: 'Usuario desactivado' });
    }

    // 🟡 Verificar expiración solo si es supervisor
    if (
      user.role === 'supervisor' &&
      user.expiresAt &&
      new Date() > user.expiresAt
    ) {
      return res.status(403).json({
        message: 'El usuario supervisor ha expirado'
      });
    }

    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};