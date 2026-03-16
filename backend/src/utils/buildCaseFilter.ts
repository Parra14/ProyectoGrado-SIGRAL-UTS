import { Request } from 'express';

export const buildCaseFilter = (query: any) => {

  const {
    tipo,
    estado,
    grado,
    from,
    to,
    code,
    employee,
    keyword
  } = query;

  const filter: any = { isDeleted: false };

  if (tipo) filter.tipoEventoPrincipal = tipo;

  if (estado) filter.status = estado;

  if (grado) filter.gradoGravedad = grado;

  if (code) filter.code = { $regex: code, $options: 'i' };

  if (employee) filter.employeeName = { $regex: employee, $options: 'i' };

  if (keyword) {
    filter['seguimientos.message'] = {
      $regex: keyword,
      $options: 'i'
    };
  }

  if (from || to) {

    filter.eventDate = {};

    if (from) {
      filter.eventDate.$gte = new Date(from);
    }

    if (to) {

      const end = new Date(to);
      end.setHours(23,59,59,999);

      filter.eventDate.$lte = end;

    }

  }

  return filter;

};