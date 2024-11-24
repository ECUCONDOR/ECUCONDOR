import multer from 'multer';
import nextConnect from 'next-connect';

// Configuración de multer para almacenamiento de archivos
const upload = multer({
  storage: multer.memoryStorage(), // Almacenamiento en memoria para trabajar mejor con plataformas como Vercel
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB para archivos
});

// Creamos el manejador API usando next-connect
const apiRoute = nextConnect();

// Agregamos middleware para manejar la subida del archivo
apiRoute.use(upload.single('receipt'));

// Controlador para el POST de registro
apiRoute.post((req, res) => {
  try {
    const { amountUSD, amountARS, beneficiaryName, cbuOrAlias, bank } = req.body;
    const fileInfo = req.file;

    console.log('Datos recibidos:', {
      amountUSD,
      amountARS,
      beneficiaryName,
      cbuOrAlias,
      bank,
      archivo: fileInfo,
    });

    res.json({ message: 'Archivo subido exitosamente!' });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ message: 'Error al subir el archivo' });
  }
});

export default apiRoute;

// Configuración para desactivar el bodyParser (Multer ya maneja los datos)
export const config = {
  api: {
    bodyParser: false,
  },
};
