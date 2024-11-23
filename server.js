import multer from 'multer';
import nextConnect from 'next-connect';
import { NextResponse } from 'next/server';

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: './uploads/', // La carpeta donde se guardarán los archivos
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño del archivo: 5MB
});

// Usar next-connect para crear el handler
const handler = nextConnect();

// Middleware de multer para manejar la subida del archivo
handler.use(upload.single('receipt'));

// POST request handler
handler.post((req, res) => {
  const { nombreCompleto, correoElectronico } = req.body;
  const fileInfo = req.file;

  console.log('Datos recibidos:', {
    nombreCompleto,
    correoElectronico,
    archivo: fileInfo,
  });

  res.json({ message: 'Archivo subido exitosamente!' });
});

// Exportar como una API Route de Next.js
export async function POST(request) {
  return new Promise((resolve, reject) => {
    handler(request, NextResponse.json({}), (result) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve();
    });
  });
}

// Configuración para deshabilitar el body parser de Next.js, ya que usaremos multer
export const config = {
  api: {
    bodyParser: false,
  },
};
