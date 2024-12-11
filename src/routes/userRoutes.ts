import express from 'express';
import { registerUser, loginUser, getAllUsers, deleteUser } from '../controllers/userController';
import { validateRegister, validateLogin } from '../middleware/validate';
import { authenticateJWT } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', loginLimiter, validateLogin, loginUser);

// Protected routes
router.get('/', authenticateJWT, getAllUsers);
router.delete('/:id', authenticateJWT, deleteUser);

export default router;
