import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import bcrypt from 'bcryptjs';
import logAudit from '../utils/auditLogger';


// 🔹 GET USERS (Paginado)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const users = await User.find({ isDeleted: false })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ isDeleted: false });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios', error });
  }
};


// 🔹 CREATE USER
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, expiresAt } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      expiresAt: role === 'supervisor' ? expiresAt || null : null
    });

    await logAudit({
        userId: req.user!.id,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user._id.toString(),
        metadata: {
            email: user.email,
            role: user.role
        }
    });

    res.status(201).json({
      message: 'Usuario creado correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creando usuario', error });
  }
};


// 🔹 UPDATE USER
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, expiresAt } = req.body;

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;

    if (user.role === 'supervisor') {
      user.expiresAt = expiresAt ?? user.expiresAt;
    } else {
      user.expiresAt = null;
    }

    await user.save();

    await logAudit({
        userId: req.user!.id,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: user._id.toString(),
        metadata: {
            email: user.email,
            role: user.role
        }
    });

    res.json({ message: 'Usuario actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error actualizando usuario', error });
  }
};


// 🔹 ACTIVATE / DEACTIVATE USER
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.isActive = !user.isActive;

    await user.save();

    await logAudit({
        userId: req.user!.id,
        action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        entity: 'User',
        entityId: user._id.toString()
    });

    res.json({
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} correctamente`
    });

  } catch (error) {
    res.status(500).json({ message: 'Error cambiando estado del usuario', error });
  }
};


// 🔹 RESET PASSWORD
export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.password = password; // 🔥 El pre('save') hará el hash automáticamente

    await user.save();

    await logAudit({
        userId: req.user!.id,
        action: 'RESET_USER_PASSWORD',
        entity: 'User',
        entityId: user._id.toString()
    });

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error reseteando contraseña',
      error
    });
  }
};


// 🔹 SOFT DELETE
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.isDeleted = true;
    user.isActive = false;

    await user.save();

    await logAudit({
        userId: req.user!.id,
        action: 'DELETE_USER',
        entity: 'User',
        entityId: user._id.toString(),
        metadata: {
            email: user.email
        }
    });

    res.json({ message: 'Usuario eliminado (soft delete)' });

  } catch (error) {
    res.status(500).json({ message: 'Error eliminando usuario', error });
  }
};