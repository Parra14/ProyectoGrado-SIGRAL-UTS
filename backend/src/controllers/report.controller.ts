import { Request, Response } from 'express';
import Case from '../models/Case';
import { generateCasesPDF } from '../utils/pdfGenerator';

export const exportCasesPDF = async (req: Request, res: Response) => {
  const { from, to, status, tipo } = req.query;

  const filter: any = { isDeleted: false };

  if (status) filter.status = status;
  if (tipo) filter.tipoEventoPrincipal = tipo;

  if (from || to) {
    filter.eventDate = {};
    if (from) filter.eventDate.$gte = new Date(from as string);
    if (to) {
      const end = new Date(to as string);
      end.setHours(23, 59, 59, 999);
      filter.eventDate.$lte = end;
    }
  }

  const cases = await Case.find(filter)
    .populate('reportedBy', 'name')
    .populate({
      path: 'comments.userId',
      select: 'name'
    })
    .lean();

  generateCasesPDF(
    {
      cases,
      filters: req.query,
      generatedBy: (req as any).user?.name || 'Sistema',
    },
    res
  );
};