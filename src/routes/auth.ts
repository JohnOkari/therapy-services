import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = Router()

// Public routes
router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/refresh', AuthController.refreshToken)

// Protected routes
router.post('/verify', authenticateToken, requireRole(['THERAPIST']), AuthController.verify)

export { router as authRoutes }
