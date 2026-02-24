import { Response } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Parser } from 'json2csv';
import User from '../models/User';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // 🔎 FILTRO POR USUARIO (nombre o email)
    if (req.query.user) {
      const userSearch = req.query.user as string;

      const foundUser = await User.findOne({
        $or: [
          { name: { $regex: userSearch, $options: 'i' } },
          { email: { $regex: userSearch, $options: 'i' } }
        ],
        isDeleted: false
      });

      if (foundUser) {
        filter.userId = foundUser._id;
      } else {
        return res.json({
          total: 0,
          page,
          pages: 0,
          logs: []
        });
      }
    }

    if (req.query.action) {
      filter.action = req.query.action;
    }

    if (req.query.entity) {
      filter.entity = req.query.entity;
    }

    // 🔥 FILTRO POR FECHA
    if (req.query.from || req.query.to) {
      filter.createdAt = {};

      if (req.query.from) {
        filter.createdAt.$gte = new Date(req.query.from as string);
      }

      if (req.query.to) {
        const endDate = new Date(req.query.to as string);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo auditoría',
      error
    });
  }
};

export const exportAuditLogsCSV = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};

    if (req.query.user) {
      const userSearch = req.query.user as string;

      const foundUser = await User.findOne({
        $or: [
          { name: { $regex: userSearch, $options: 'i' } },
          { email: { $regex: userSearch, $options: 'i' } }
        ],
        isDeleted: false
      });

      if (foundUser) {
        filter.userId = foundUser._id;
      } else {
        return res.status(200).send(''); // CSV vacío
      }
    }

    if (req.query.action) {
      filter.action = req.query.action;
    }

    if (req.query.entity) {
      filter.entity = req.query.entity;
    }

    if (req.query.from || req.query.to) {
      filter.createdAt = {};

      if (req.query.from) {
        filter.createdAt.$gte = new Date(req.query.from as string);
      }

      if (req.query.to) {
        const endDate = new Date(req.query.to as string);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 });

    const formattedLogs = logs.map(log => ({
      Fecha: log.createdAt,
      Usuario: log.userId,
      Accion: log.action,
      Entidad: log.entity,
      EntidadID: log.entityId,
      Metadata: JSON.stringify(log.metadata || {})
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedLogs);

    res.header('Content-Type', 'text/csv');
    res.attachment('auditoria.csv');
    return res.send(csv);

  } catch (error) {
    res.status(500).json({
      message: 'Error exportando auditoría',
      error
    });
  }
};