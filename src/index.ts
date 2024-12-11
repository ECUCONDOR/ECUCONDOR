import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all routes
app.use(apiLimiter);

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('¡Backend Express.js funcionando correctamente!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
