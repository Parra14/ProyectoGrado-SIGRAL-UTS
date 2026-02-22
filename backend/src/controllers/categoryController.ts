import { Request, Response } from 'express';
import Category from '../models/Category';
import logAudit from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';

// Crear categoría (Admin)
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }

    const category = await Category.create({ name, description });

    await logAudit({
      userId: req.user!.id,
      action: 'CREATE_CATEGORY',
      entity: 'Category',
      entityId: category._id.toString(),
      metadata: { name }
    });

    res.status(201).json({
      message: 'Categoría creada correctamente',
      category
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creando categoría', error });
  }
};


// Listar categorías (todos autenticados)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
      isActive: true
    });

    res.json(categories);

  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo categorías', error });
  }
};


// Actualizar categoría (Admin)
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;


    await category.save();

     await logAudit({
      userId: req.user!.id,
      action: 'UPDATE_CATEGORY',
      entity: 'Category',
      entityId: category._id.toString(),
      metadata: {
            name: category.name,
            description: category.description
        }
    });

    res.json({ message: 'Categoría actualizada', category });

  } catch (error) {
    res.status(500).json({ message: 'Error actualizando categoría', error });
  }
};


// Soft Delete (Admin)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    category.isDeleted = true;
    await category.save();

    res.json({ message: 'Categoría eliminada (soft delete)' });

  } catch (error) {
    res.status(500).json({ message: 'Error eliminando categoría', error });
  }
};