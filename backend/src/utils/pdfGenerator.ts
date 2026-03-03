import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface GeneratePDFOptions {
  cases: any[];
  filters: any;
  generatedBy: string;
}

export const generateCasesPDF = (
  { cases, filters, generatedBy }: GeneratePDFOptions,
  res: any
) => {

  const doc = new PDFDocument({
    size: 'A4',
    margin: 90
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=reporte-casos.pdf'
  );

  doc.pipe(res);

  const templatePath = path.join(process.cwd(), 'uploads', 'template-uts.png');

  const drawBackground = () => {
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height
      });
    }
  };

  const addPage = () => {
    doc.addPage();
    drawBackground();
  };

  // Primera página
  drawBackground();

  /* =====================================================
     ENCABEZADO
  ===================================================== */

  doc.moveDown(3);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('Reporte Institucional de Casos SST', { align: 'center' });

  doc.moveDown(1.5);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Fecha generación: ${new Date().toLocaleString()}`)
    .text(`Generado por: ${generatedBy}`);

  if (filters && Object.keys(filters).length) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Filtros aplicados:');
    doc.font('Helvetica');

    Object.entries(filters).forEach(([key, value]) => {
      doc.text(`- ${key}: ${value}`);
    });
  }

  doc.moveDown(2);

  /* =====================================================
     TABLA RESUMEN
  ===================================================== */

  doc.fontSize(13)
    .font('Helvetica-Bold')
    .text('Resumen General de Casos', { underline: true });

  doc.moveDown(1);

  const startX = doc.page.margins.left;
  const usableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const rowHeight = 22;
  let currentY = doc.y;

  const columns = [
    { header: 'Código', width: usableWidth * 0.18 },
    { header: 'Fecha', width: usableWidth * 0.14 },
    { header: 'Tipo', width: usableWidth * 0.18 },
    { header: 'Estado', width: usableWidth * 0.16 },
    { header: 'Gravedad', width: usableWidth * 0.17 },
    { header: 'Jornada', width: usableWidth * 0.17 }
  ];

  const drawHeader = () => {
    let x = startX;
    doc.font('Helvetica-Bold').fontSize(10);

    columns.forEach(col => {
      doc.text(col.header, x, currentY, {
        width: col.width,
        align: 'center'
      });
      x += col.width;
    });

    currentY += rowHeight;

    doc.moveTo(startX, currentY - 8)
       .lineTo(startX + usableWidth, currentY - 8)
       .stroke();

    doc.font('Helvetica');
  };

  drawHeader();

  cases.forEach(c => {

    if (currentY > doc.page.height - 100) {
      addPage();
      currentY = doc.page.margins.top;
      drawHeader();
    }

    let x = startX;

    const row = [
      c.code,
      new Date(c.eventDate).toLocaleDateString(),
      c.tipoEventoPrincipal,
      c.status,
      c.gradoGravedad,
      c.jornada
    ];

    row.forEach((cell, i) => {
      doc.text(cell, x, currentY, {
        width: columns[i].width,
        align: 'center'
      });
      x += columns[i].width;
    });

    currentY += rowHeight;
  });

  /* =====================================================
     DETALLE POR CASO
  ===================================================== */

  cases.forEach(c => {

    addPage();

    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text(`CASO: ${c.code}`, { underline: true });

    doc.moveDown();
    doc.fontSize(11).font('Helvetica');

    doc.text(`Fecha Evento: ${new Date(c.eventDate).toLocaleDateString()}`);
    doc.text(`Tipo: ${c.tipoEventoPrincipal}`);
    doc.text(`Estado: ${c.status}`);
    doc.text(`Gravedad: ${c.gradoGravedad}`);
    doc.text(`Jornada: ${c.jornada}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Información del Trabajador:');
    doc.font('Helvetica');
    doc.text(`Nombre: ${c.employeeName}`);
    doc.text(`Documento: ${c.employeeId}`);
    doc.text(`Jefe inmediato: ${c.jefeInmediato}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Descripción del evento:');
    doc.font('Helvetica');
    doc.text(c.descripcionEvento);
    doc.moveDown();

    if (c.comments?.length) {
      doc.font('Helvetica-Bold')
        .text('Comentarios:', { underline: true });

      doc.moveDown(0.5);
      doc.font('Helvetica');

      c.comments.forEach((comment: any) => {
        const author =
          typeof comment.userId === 'object' && comment.userId?.name
            ? comment.userId.name
            : 'Usuario';

        doc.text(
          `[${new Date(comment.createdAt).toLocaleString()}] ${author}: ${comment.message}`
        );
      });

      doc.moveDown();
    }

    if (c.evidences?.length) {
      doc.font('Helvetica-Bold')
        .text('Evidencias:', { underline: true });

      doc.moveDown();
      doc.font('Helvetica');

      c.evidences.forEach((ev: string) => {

        const absolutePath = path.join(process.cwd(), ev);
        const ext = path.extname(ev).toLowerCase();

        if (['.png', '.jpg', '.jpeg'].includes(ext) &&
            fs.existsSync(absolutePath)) {

          if (doc.y + 250 > doc.page.height - 100) {
            addPage();
          }

          doc.image(absolutePath, {
            fit: [450, 250],
            align: 'center'
          });

          doc.moveDown(0.5);

          doc.fontSize(9)
            .fillColor('gray')
            .text(path.basename(ev), { align: 'center' });

          doc.fillColor('black');
          doc.moveDown();

        } else {
          doc.text(`Archivo adjunto: ${ev}`);
        }
      });
    }
  });

  doc.end();
};