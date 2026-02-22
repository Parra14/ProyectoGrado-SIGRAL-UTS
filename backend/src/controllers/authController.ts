import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';

// 🔐 Registro
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, expiresAt } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      expiresAt: role === 'supervisor' ? expiresAt : null
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario creado correctamente',
      token
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en registro', error });
  }
};


// 🔐 Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    // ⏳ Validación de expiración
    if (user.role === 'supervisor' && user.expiresAt) {
      if (new Date() > user.expiresAt) {
        user.isActive = false;
        await user.save();
        return res.status(403).json({ message: 'Usuario expirado' });
      }
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login exitoso',
      token
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en login', error });
  }
};