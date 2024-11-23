import { Pool } from 'pg';
import nextConnect from 'next-connect';

const pool = new Pool({
  user: 'eduardo',
  host: 'localhost',
  database: 'ecucondor_db',
  password: 'ecucondor0812',
  port: 5432,
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ message: `Error en el servidor: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `Método ${req.method} no permitido` });
  },
});

// Middleware para manejar la subida de archivos manualmente
apiRoute.use(async (req, res, next) => {
  const contentType = req.headers['content-type'];
  if (contentType && contentType.includes('multipart/form-data')) {
    const formData = await new Promise((resolve, reject) => {
      const multer = require('multer');
      const storage = multer.memoryStorage(); // Guardar en memoria en lugar del sistema de archivos
      const upload = multer({ storage }).single('receipt');
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve(req);
      });
    });

    req.file = formData.file;
    next();
  } else {
    next();
  }
});

apiRoute.post(async (req, res) => {
  try {
    const { nombreCompleto, correoElectronico } = req.body;
    const file = req.file;

    if (file) {
      // Convertir el archivo a Buffer
      const buffer = file.buffer;

      // Insertar datos en PostgreSQL
      const client = await pool.connect();
      try {
        const query = `
          INSERT INTO receipts (user_id, file_data, file_name)
          VALUES ($1, $2, $3)
          RETURNING id
        `;
        // En lugar de `user_id`, podrías usar una constante (por ejemplo `1`) o recibir `userId` de la solicitud.
        const values = [1, buffer, file.originalname];
        const result = await client.query(query, values);

        // Obtener el ID de la fila insertada para devolverlo como referencia
        const receiptId = result.rows[0].id;

        console.log('Datos recibidos:', {
          nombreCompleto,
          correoElectronico,
          archivo: file.originalname,
        });

        res.status(200).json({ message: 'Formulario procesado con éxito.', receiptId });
      } finally {
        client.release();
      }
    } else {
      res.status(400).json({ message: 'No se proporcionó un archivo' });
    }
  } catch (error) {
    console.error('Error al procesar el registro:', error);
    res.status(500).json({ error: 'Error al procesar el registro' });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};
