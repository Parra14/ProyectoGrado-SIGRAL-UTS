import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Case from '../models/Case';

const baseUploadPath = path.join(__dirname, '../../uploads');

// Crear carpeta raíz si no existe
if (!fs.existsSync(baseUploadPath)) {
  fs.mkdirSync(baseUploadPath, { recursive: true });
}

// Función para sanitizar nombre
const sanitizeFileName = (name: string): string => {
  return name
    .replace(/\s+/g, '_')         // Reemplaza espacios por _
    .replace(/[^\w.-]/g, '')      // Elimina caracteres especiales
    .toLowerCase();
};

const storage = multer.diskStorage({

  destination: async (req, _file, cb) => {
    try {

      const caseId = req.params.id;

      const caseDoc = await Case.findById(caseId);

      if (!caseDoc) {
        return cb(new Error('Caso no encontrado'), '');
      }

      const caseFolder = path.join(baseUploadPath, caseDoc.code);

      // Crear carpeta del caso si no existe
      if (!fs.existsSync(caseFolder)) {
        fs.mkdirSync(caseFolder, { recursive: true });
      }

      cb(null, caseFolder);

    } catch (error) {
      cb(error as Error, '');
    }
  },

  filename: (req, file, cb) => {

    const caseId = req.params.id;

    Case.findById(caseId).then(caseDoc => {

      if (!caseDoc) {
        return cb(new Error('Caso no encontrado'), '');
      }

      const caseFolder = path.join(baseUploadPath, caseDoc.code);

      const sanitized = sanitizeFileName(file.originalname);

      const ext = path.extname(sanitized);
      const baseName = path.basename(sanitized, ext);

      let finalName = sanitized;
      let counter = 1;

      while (fs.existsSync(path.join(caseFolder, finalName))) {
        finalName = `${baseName}_${counter}${ext}`;
        counter++;
      }

      cb(null, finalName);

    }).catch(err => cb(err, ''));

  }

});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/zip'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});