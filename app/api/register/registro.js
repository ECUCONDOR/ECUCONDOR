import multer from 'multer'
import nextConnect from 'next-connect'

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
})

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ message: `Error en el servidor: ${error.message}` })
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: `Método ${req.method} no permitido` })
  },
})

apiRoute.use(upload.single('receipt'))

apiRoute.post((req, res) => {
  const { nombreCompleto, correoElectronico } = req.body

  console.log('Datos recibidos:', {
    nombreCompleto,
    correoElectronico,
    archivo: req.file,
  })

  res.status(200).json({ message: 'Formulario procesado con éxito.' })
})

export default apiRoute

export const config = {
  api: {
    bodyParser: false,
  },
}

