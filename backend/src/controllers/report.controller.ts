import { Request, Response } from 'express';
import Case from '../models/Case';
import { generateCasesPDF } from '../utils/pdfGenerator';
import { buildCaseFilter } from '../utils/buildCaseFilter';

export const exportCasesPDF = async (req: Request, res: Response) => {

  try {

    // 🔎 construir filtro reutilizable
    const filter = buildCaseFilter(req.query);

    // 📊 consultar casos con seguimientos y usuario
    const cases = await Case.find(filter)
      .populate('reportedBy', 'name')
      .populate({
        path: 'seguimientos.userId',
        select: 'name'
      })
      .sort({ createdAt: -1 })
      .lean();

    // 📄 generar PDF usando util
    generateCasesPDF(
      {
        cases,
        filters: req.query,
        generatedBy: (req as any).user?.name || 'Sistema'
      },
      res
    );

  } catch (error) {

    console.error("Error generando reporte PDF:", error);

    res.status(500).json({
      message: 'Error generando reporte PDF',
      error
    });

  }

};