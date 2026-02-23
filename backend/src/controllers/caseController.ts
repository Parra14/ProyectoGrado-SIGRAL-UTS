import { Response } from 'express';
import Case from '../models/Case';
import generateCaseCode from '../utils/generateCaseCode';
import logAudit from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';
import PDFDocument from 'pdfkit';


export const createCase = async (req: AuthRequest, res: Response) => {
  try {
    const caseCode = await generateCaseCode();

    const newCase = await Case.create({
      ...req.body,
      code: caseCode,
      reportedBy: req.user!.id
    });

    await logAudit({
      userId: req.user!.id,
      action: 'CREATE_CASE',
      entity: 'Case',
      entityId: newCase._id.toString(),
      metadata: { code: caseCode }
    });

    res.status(201).json({
      message: 'Caso creado correctamente',
      case: newCase
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creando caso', error });
  }
};

export const getCases = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const {
      tipo,
      estado,
      grado,
      from,
      to,
      code
    } = req.query;

    const filter: any = { isDeleted: false };

    if (tipo) filter.tipoEventoPrincipal = tipo;
    if (estado) filter.status = estado;
    if (grado) filter.gradoGravedad = grado;
    if (code) filter.code = code;

    if (from || to) {
      filter.eventDate = {};
      if (from) filter.eventDate.$gte = new Date(from as string);
      if (to) filter.eventDate.$lte = new Date(to as string);
    }

    const total = await Case.countDocuments(filter);

    const cases = await Case.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: cases
    });

  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo casos', error });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const caseDoc = await Case.findById(id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    caseDoc.comments.push({
      userId: req.user!.id,
      message,
      createdAt: new Date()
    });

    await caseDoc.save();

    await logAudit({
      userId: req.user!.id,
      action: 'ADD_COMMENT',
      entity: 'Case',
      entityId: caseDoc._id.toString(),
      metadata: { message }
    });

    res.json({ message: 'Comentario agregado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error agregando comentario', error });
  }
};

export const closeCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const caseDoc = await Case.findById(id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    if (caseDoc.status === 'CERRADO') {
      return res.status(400).json({ message: 'El caso ya está cerrado' });
    }

    caseDoc.status = 'CERRADO';
    await caseDoc.save();

    await logAudit({
      userId: req.user!.id,
      action: 'CLOSE_CASE',
      entity: 'Case',
      entityId: caseDoc._id.toString(),
      metadata: { code: caseDoc.code }
    });

    res.json({ message: 'Caso cerrado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error cerrando caso', error });
  }
};

export const uploadEvidence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const caseDoc = await Case.findById(id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se envió archivo' });
    }

    caseDoc.evidences.push(`/uploads/${caseDoc.code}/${req.file.filename}`);
    await caseDoc.save();

    caseDoc.comments.push({
      userId: req.user!.id,
      message: `Se cargó la evidencia: ${req.file.originalname}`,
      createdAt: new Date()
    });
    
    await logAudit({
      userId: req.user!.id,
      action: 'UPLOAD_EVIDENCE',
      entity: 'Case',
      entityId: caseDoc._id.toString(),
      metadata: { file: req.file.filename }
    });

    res.json({ message: 'Evidencia subida correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error subiendo evidencia', error });
  }
};

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;

    const filter: any = { isDeleted: false };

    if (from || to) {
      filter.eventDate = {};
      if (from) filter.eventDate.$gte = new Date(from as string);
      if (to) filter.eventDate.$lte = new Date(to as string);
    }

    const totalCases = await Case.countDocuments(filter);
    const openCases = await Case.countDocuments({ ...filter, status: 'ABIERTO' });
    const closedCases = await Case.countDocuments({ ...filter, status: 'CERRADO' });

    const byType = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$tipoEventoPrincipal', count: { $sum: 1 } } }
    ]);

    const byGravedad = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$gradoGravedad', count: { $sum: 1 } } }
    ]);

    const byJornada = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$jornada', count: { $sum: 1 } } }
    ]);

    res.json({
      totalCases,
      openCases,
      closedCases,
      byType,
      byGravedad,
      byJornada
    });

  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo métricas', error });
  }
};

import { Parser } from 'json2csv';

export const exportCasesCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { tipo, estado, grado, from, to } = req.query;

    const filter: any = { isDeleted: false };

    if (tipo) filter.tipoEventoPrincipal = tipo;
    if (estado) filter.status = estado;
    if (grado) filter.gradoGravedad = grado;

    if (from || to) {
      filter.eventDate = {};
      if (from) filter.eventDate.$gte = new Date(from as string);
      if (to) filter.eventDate.$lte = new Date(to as string);
    }

    const cases = await Case.find(filter)
      .sort({ createdAt: -1 });

    const formatted = cases.map(c => ({
      Codigo: c.code,
      FechaEvento: c.eventDate,
      Tipo: c.tipoEventoPrincipal,
      Gravedad: c.gradoGravedad,
      Estado: c.status,
      Trabajador: c.employeeName,
      Identificacion: c.employeeId,
      Jornada: c.jornada,
      Categoria: c.categoriaEvento,
      Lugar: c.lugarExacto
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.header('Content-Type', 'text/csv');
    res.attachment('reporte_casos.csv');
    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: 'Error exportando CSV', error });
  }
};

export const exportCasesPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { tipo, estado, grado, from, to } = req.query;

    const filter: any = { isDeleted: false };

    if (tipo) filter.tipoEventoPrincipal = tipo;
    if (estado) filter.status = estado;
    if (grado) filter.gradoGravedad = grado;

    if (from || to) {
      filter.eventDate = {};
      if (from) filter.eventDate.$gte = new Date(from as string);
      if (to) filter.eventDate.$lte = new Date(to as string);
    }

    const cases = await Case.find(filter)
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_casos.pdf');

    doc.pipe(res);

    // 🔹 Encabezado
    doc.fontSize(18).text('SIGRAL-UTS', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Reporte de Accidentes e Incidentes', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Fecha de generación: ${new Date().toLocaleString()}`);
    doc.moveDown(2);

    // 🔹 Tabla básica
    doc.fontSize(10);
    doc.text('Código | Fecha | Tipo | Gravedad | Estado | Trabajador | Categoría');
    doc.moveDown();

    cases.forEach(c => {
      doc.text(
        `${c.code} | ${c.eventDate.toISOString().split('T')[0]} | ${c.tipoEventoPrincipal} | ${c.gradoGravedad} | ${c.status} | ${c.employeeName} | ${c.categoriaEvento}`
      );
      doc.moveDown(0.5);
    });

    doc.moveDown(2);

    // 🔹 Totales
    doc.text(`Total casos: ${cases.length}`);
    doc.end();

  } catch (error) {
    res.status(500).json({ message: 'Error exportando PDF', error });
  }
};

export const getCaseById = async (req: AuthRequest, res: Response) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    res.json(caseDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo caso', error });
  }
};

export const updateCase = async (req: AuthRequest, res: Response) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    Object.assign(caseDoc, req.body);
    await caseDoc.save();

    res.json({ message: 'Caso actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando caso', error });
  }
};