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

  const usableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  /*
  ==========================================
  🔧 AJUSTE IMPORTANTE

  Este valor controla que el texto no invada
  el diseño verde del template.

  Si cambian el diseño del fondo,
  solo modifiquen este número.

  ==========================================
  */
  const CONTENT_WIDTH = usableWidth - 60;

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

  drawBackground();

  /* ======================================
     ENCABEZADO
  ====================================== */

  doc.moveDown(3);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('Reporte Institucional de Casos SST', {
      align: 'center'
    });

  doc.moveDown(1.5);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Fecha generación: ${new Date().toLocaleString()}`)
    .text(`Generado por: ${generatedBy}`);

  doc.moveDown(2);

  /* ======================================
     TABLA RESUMEN
  ====================================== */

  doc.fontSize(13)
    .font('Helvetica-Bold')
    .text('Resumen General de Casos', { underline: true });

  doc.moveDown();

  const startX = doc.page.margins.left;

  const columns = [
    { header: 'Código', width: usableWidth * 0.22 },
    { header: 'Fecha', width: usableWidth * 0.15 },
    { header: 'Tipo', width: usableWidth * 0.16 },
    { header: 'Estado', width: usableWidth * 0.17 },
    { header: 'Gravedad', width: usableWidth * 0.15 },
    { header: 'Jornada', width: usableWidth * 0.15 }
  ];

  let currentY = doc.y;

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

    currentY += 20;

    doc.moveTo(startX, currentY - 5)
       .lineTo(startX + usableWidth, currentY - 5)
       .stroke();

    doc.font('Helvetica');

  };

  drawHeader();

  cases.forEach(c => {

    if (currentY > doc.page.height - 120) {

      addPage();
      currentY = doc.page.margins.top;

      drawHeader();

    }

    let x = startX;

    const estadoBonito = c.status.replace('_', ' ');

    const row = [
      c.code,
      new Date(c.eventDate).toLocaleDateString(),
      c.tipoEventoPrincipal,
      estadoBonito,
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

    currentY += 20;

  });

  /* ======================================
     DETALLE DE CASOS
  ====================================== */

  cases.forEach(c => {

    addPage();

    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text(`CASO: ${c.code}`, { underline: true });

    doc.moveDown();

    doc.fontSize(11).font('Helvetica');

    doc.text(`Fecha Evento: ${new Date(c.eventDate).toLocaleDateString()}`);
    doc.text(`Tipo: ${c.tipoEventoPrincipal}`);
    doc.text(`Estado: ${c.status.replace('_', ' ')}`);
    doc.text(`Gravedad: ${c.gradoGravedad}`);
    doc.text(`Jornada: ${c.jornada}`);

    doc.moveDown();

    doc.font('Helvetica-Bold').text('Información del Trabajador:');

    doc.font('Helvetica')
      .text(`Nombre: ${c.employeeName}`)
      .text(`Documento: ${c.employeeId}`)
      .text(`Jefe inmediato: ${c.jefeInmediato}`);

    doc.moveDown();

    doc.font('Helvetica-Bold').text('Descripción del evento:');

    doc.font('Helvetica')
      .text(c.descripcionEvento, {
        width: CONTENT_WIDTH
      });

    doc.moveDown();

    /* ======================================
       SEGUIMIENTOS
    ====================================== */

    if (c.seguimientos?.length) {

      doc.font('Helvetica-Bold')
        .text('Seguimientos:', { underline: true });

      doc.moveDown();

      c.seguimientos.forEach((seg: any) => {

        if (doc.y > doc.page.height - 180) {
          addPage();
        }

        const author =
          typeof seg.userId === 'object' && seg.userId?.name
            ? seg.userId.name
            : 'Usuario';

        const fecha = new Date(seg.createdAt).toLocaleString();

        doc.moveDown(0.6);

        doc.font('Helvetica-Bold')
           .text(`[${fecha}] ${author}`);

        doc.font('Helvetica')
           .text(seg.message || '', {
             width: CONTENT_WIDTH
           });

        doc.moveDown(0.5);

        /* ======================================
           EVIDENCIAS
        ====================================== */

        if (seg.evidences?.length) {

          doc.font('Helvetica-Bold')
             .text('Evidencias:');

          doc.moveDown(0.4);

          seg.evidences.forEach((ev: string) => {

            const cleanPath = ev.startsWith('/')
              ? ev.slice(1)
              : ev;

            const absolutePath = path.join(process.cwd(), cleanPath);

            const ext = path.extname(ev).toLowerCase();

            if (
              ['.png', '.jpg', '.jpeg'].includes(ext) &&
              fs.existsSync(absolutePath)
            ) {

              if (doc.y > doc.page.height - 260) {
                addPage();
              }

              doc.image(absolutePath, {
                fit: [420, 230],
                align: 'center'
              });

              doc.moveDown(0.5);

              doc.fontSize(9)
                .fillColor('gray')
                .text(path.basename(ev), { align: 'center' });

              doc.fillColor('black');
              doc.fontSize(11);

            } else {

              doc.text(`Archivo adjunto: ${path.basename(ev)}`);

            }

            doc.moveDown(0.6);

          });

        }

      });

    }

  });

  doc.end();

};