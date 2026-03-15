import { Response } from 'express';
import Case from '../models/Case';
import generateCaseCode from '../utils/generateCaseCode';
import logAudit from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';
import PDFDocument from 'pdfkit';


export const createCase = async (req: AuthRequest, res: Response) => {
  try {

    const caseCode = await generateCaseCode();

    const initialStatus =
      req.body.tipoEventoPrincipal === 'ACCIDENTE'
        ? 'REPORTAR_ARL'
        : 'INVESTIGACION';

    const newCase = await Case.create({
      ...req.body,
      code: caseCode,
      status: initialStatus,
      reportedBy: req.user!.id,
      seguimientos: [
        {
          userId: req.user!.id,
          message: 'Caso creado en el sistema',
          type: 'SYSTEM',
          toStatus: initialStatus
        }
      ]
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

export const addSeguimiento = async (req: AuthRequest, res: Response) => {
  try {

    const { id } = req.params;
    const { message } = req.body;

    const caseDoc = await Case.findById(id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: "Caso no encontrado" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        message: "Debe ingresar un comentario"
      });
    }

    console.log("FILE:", req.file);
    console.log("FILES:", req.files);
    const evidences: string[] = [];

    if (req.files && Array.isArray(req.files)) {

      const files = req.files as Express.Multer.File[];

      files.forEach(file => {
        evidences.push(`/uploads/${caseDoc.code}/${file.filename}`);
      });

    }

    /*if (req.files) {

      const file = req.file as Express.Multer.File;

      evidences.push(`/uploads/${caseDoc.code}/${file.filename}`);

    }*/

    caseDoc.seguimientos.push({
      userId: req.user!.id,
      message,
      type: "COMMENT",
      evidences,
      createdAt: new Date()
    });

    await caseDoc.save();

    await logAudit({
      userId: req.user!.id,
      action: "ADD_SEGUIMIENTO",
      entity: "Case",
      entityId: caseDoc._id.toString(),
      metadata: { message }
    });

    res.json({
      message: "Seguimiento agregado correctamente"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error agregando seguimiento",
      error
    });

  }
};

export const changeStatus = async (req: AuthRequest, res: Response) => {

  try {

    const { id } = req.params;
    const { newStatus, message } = req.body;

    const caseDoc = await Case.findById(id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    const oldStatus = caseDoc.status;

    caseDoc.status = newStatus;

    caseDoc.seguimientos.push({
      userId: req.user!.id,
      message,
      type: 'STATUS_CHANGE',
      fromStatus: oldStatus,
      toStatus: newStatus,
      createdAt: new Date()
    });

    await caseDoc.save();

    await logAudit({
      userId: req.user!.id,
      action: 'CHANGE_STATUS',
      entity: 'Case',
      entityId: caseDoc._id.toString(),
      metadata: {
        from: oldStatus,
        to: newStatus
      }
    });

    res.json({ message: 'Estado actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error cambiando estado', error });
  }

};

export const advanceStatus = async (req: AuthRequest, res: Response) => {

  try {

    const { id } = req.params;
    const { message } = req.body;

    const caseDoc = await Case.findById(id);

    if (!caseDoc || caseDoc.isDeleted) {
      return res.status(404).json({ message: "Caso no encontrado" });
    }

    if (caseDoc.status === "CERRADO") {
      return res.status(400).json({
        message: "El caso ya está cerrado"
      });
    }

    const STATUS_FLOW: any = {
      REPORTAR_ARL: "INVESTIGACION",
      INVESTIGACION: "PLAN_ACCION",
      PLAN_ACCION: "CERRADO"
    };

    const oldStatus = caseDoc.status;
    const nextStatus = STATUS_FLOW[oldStatus];

    if (!nextStatus) {
      return res.status(400).json({
        message: "No existe transición válida"
      });
    }

    /* ===============================
       EVIDENCIAS
    =============================== */
    console.log("FILE:", req.file);
    console.log("FILES:", req.files);
    const evidences: string[] = [];

    // Caso upload.array()
    if (req.files && Array.isArray(req.files)) {

      const files = req.files as Express.Multer.File[];

      files.forEach(file => {
        evidences.push(`/uploads/${caseDoc.code}/${file.filename}`);
      });

    }

    // Caso upload.single()
    if (req.file) {

      const file = req.file as Express.Multer.File;

      evidences.push(`/uploads/${caseDoc.code}/${file.filename}`);

    }

    /* ===============================
       CAMBIO DE ESTADO
    =============================== */

    caseDoc.status = nextStatus;

    caseDoc.seguimientos.push({
      userId: req.user!.id,
      message,
      type: "STATUS_CHANGE",
      fromStatus: oldStatus,
      toStatus: nextStatus,
      evidences,
      createdAt: new Date()
    });

    await caseDoc.save();

    await logAudit({
      userId: req.user!.id,
      action: "CHANGE_STATUS",
      entity: "Case",
      entityId: caseDoc._id.toString(),
      metadata: {
        from: oldStatus,
        to: nextStatus
      }
    });

    res.json({
      message: `Estado cambiado de ${oldStatus} a ${nextStatus}`
    });

  } catch (error) {
    res.status(500).json({
      message: "Error cambiando estado",
      error
    });
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

  caseDoc.seguimientos.push({
    userId: req.user!.id,
    message: `Se cargó la evidencia: ${req.file.originalname}`,
    type: 'COMMENT',
    evidences: [`/uploads/${caseDoc.code}/${req.file.filename}`],
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

    // ✅ APLICAR FILTRO ANTES DE TODO
    if (from || to) {
      filter.eventDate = {};

      if (from) {
        filter.eventDate.$gte = new Date(from as string);
      }

      if (to) {
        const endDate = new Date(to as string);
        endDate.setHours(23, 59, 59, 999); // 🔥 incluir todo el día
        filter.eventDate.$lte = endDate;
      }
    }

    // ✅ MÉTRICAS BÁSICAS
    const totalCases = await Case.countDocuments(filter);
    const openCases = await Case.countDocuments({  ...filter,  status: { $ne: 'CERRADO' }});
    const closedCases = await Case.countDocuments({ ...filter, status: 'CERRADO' });

    // ✅ POR TIPO
    const byType = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$tipoEventoPrincipal', count: { $sum: 1 } } }
    ]);

    // ✅ POR GRAVEDAD
    const byGravedad = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$gradoGravedad', count: { $sum: 1 } } }
    ]);

    // ✅ POR JORNADA
    const byJornada = await Case.aggregate([
      { $match: filter },
      { $group: { _id: '$jornada', count: { $sum: 1 } } }
    ]);

    // ✅ POR FECHA (ESTA ERA LA QUE ESTABA MAL)
    const byDate = await Case.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$eventDate"
              }
            },
            type: "$tipoEventoPrincipal"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    res.json({
      totalCases,
      openCases,
      closedCases,
      byType,
      byGravedad,
      byJornada,
      byDate
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

    const oldTipo = caseDoc.tipoEventoPrincipal;

    Object.assign(caseDoc, req.body);

    if (oldTipo === 'INCIDENTE' && req.body.tipoEventoPrincipal === 'ACCIDENTE') {

      caseDoc.status = 'REPORTAR_ARL';

      caseDoc.seguimientos.push({
        userId: req.user!.id,
        message: 'Tipo de evento cambiado de INCIDENTE a ACCIDENTE. Flujo reiniciado para reporte ARL.',
        type: 'SYSTEM',
        toStatus: 'REPORTAR_ARL',
        createdAt: new Date()
      });

    }

    await caseDoc.save();

    res.json({ message: 'Caso actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error actualizando caso', error });
  }

};