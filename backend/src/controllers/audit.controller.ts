import { Response } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Parser } from 'json2csv';
import User from '../models/User';
import Case from '../models/Case';

/* =====================================================
   🔥 BUILDER DE FILTROS (REUTILIZABLE)
===================================================== */
const buildAuditFilter = async (query: any) => {

  const filter: any = {};

  /* ===============================
     🔎 USUARIO
  =============================== */
  if (query.user) {

    const userSearch = query.user as string;

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
      return null;
    }
  }

  /* ===============================
     🔎 ACCIÓN Y ENTIDAD
  =============================== */
  if (query.action) {
    const actionSearch = (query.action as string).replace(/ /g, '_');
    filter.action = { $regex: actionSearch, $options: 'i' };
  }  
  if (query.entity) filter.entity = query.entity;

  /* ===============================
   🔎 FILTRO POR TIPO DE ENTIDAD
=============================== */
if (query.entity) {
  filter.entity = query.entity;
}

/* ===============================
   🔎 FILTRO POR REGISTRO (ID o CODIGO)
=============================== */
if (query.registro) {

  const search = query.registro;
  const orConditions: any[] = [];

  // 🔎 buscar casos por código
  const cases = await Case.find({
    code: { $regex: search, $options: 'i' }
  }).select('_id');

  if (cases.length) {
    orConditions.push({
      entityId: { $in: cases.map(c => c._id) }
    });
  }

  // 🔎 si es ObjectId
  if (search.length === 24) {
    orConditions.push({ entityId: search });
  }

  if (orConditions.length === 0) {
    return null;
  }

  // 🔥 clave: combinar con otros filtros
  filter.$and = filter.$and || [];
  filter.$and.push({ $or: orConditions });
}
  /* ===============================
     📅 FECHAS
  =============================== */
  if (query.from || query.to) {

    filter.createdAt = {};

    if (query.from) {
      filter.createdAt.$gte = new Date(query.from);
    }

    if (query.to) {
      const end = new Date(query.to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  return filter;
};

/* =====================================================
   🔍 GET AUDIT LOGS
===================================================== */
export const getAuditLogs = async (req: AuthRequest, res: Response) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = await buildAuditFilter(req.query);

    if (filter === null) {
      return res.json({
        total: 0,
        page,
        pages: 0,
        logs: []
      });
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments(filter);

    /* ===============================
       🔥 ENRIQUECIMIENTO
    =============================== */

    const userIds = logs.map(l => l.userId);
    const caseIds = logs
      .filter(l => l.entity === 'Case')
      .map(l => l.entityId);

    const [users, cases] = await Promise.all([
      User.find({ _id: { $in: userIds } }).lean(),
      Case.find({ _id: { $in: caseIds } }).lean()
    ]);

    const userMap: any = {};
    users.forEach(u => userMap[u._id.toString()] = u.name);

    const caseMap: any = {};
    cases.forEach(c => caseMap[c._id.toString()] = c.code);

    const enrichedLogs = logs.map(log => ({

      ...log,

      userName: userMap[log.userId] || 'Sistema',

      entityName:
        log.entity === 'Case'
          ? caseMap[log.entityId] || log.entityId
          : log.entityId,

      actionLabel: log.action.replace(/_/g, ' ')

    }));

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      logs: enrichedLogs
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error obteniendo auditoría',
      error
    });

  }
};

/* =====================================================
   📄 EXPORT CSV
===================================================== */
export const exportAuditLogsCSV = async (req: AuthRequest, res: Response) => {

  try {

    const filter = await buildAuditFilter(req.query);

    if (filter === null) {
      return res.status(200).send('');
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    /* ===============================
       🔥 ENRIQUECIMIENTO
    =============================== */

    const userIds = logs.map(l => l.userId);
    const caseIds = logs
      .filter(l => l.entity === 'Case')
      .map(l => l.entityId);

    const [users, cases] = await Promise.all([
      User.find({ _id: { $in: userIds } }).lean(),
      Case.find({ _id: { $in: caseIds } }).lean()
    ]);

    const userMap: any = {};
    users.forEach(u => userMap[u._id.toString()] = u.name);

    const caseMap: any = {};
    cases.forEach(c => caseMap[c._id.toString()] = c.code);

    /* ===============================
       📊 FORMATO CSV
    =============================== */

    const formattedLogs = logs.map(log => ({

      Fecha: log.createdAt,

      Usuario: userMap[log.userId] || 'Sistema',

      Accion: log.action.replace(/_/g, ' '),

      Entidad: log.entity,

      Registro:
        log.entity === 'Case'
          ? caseMap[log.entityId] || log.entityId
          : log.entityId,

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