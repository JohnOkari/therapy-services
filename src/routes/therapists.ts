import { Router } from 'express'
import { TherapistController } from '../controllers/therapistController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/', TherapistController.searchTherapists)
router.get('/:id', TherapistController.getTherapistById)
router.get('/:id/availability', TherapistController.getTherapistAvailability)

// Protected routes - therapists can update their own profiles
router.put('/:id/profile', authenticateToken, requireRole(['THERAPIST']), TherapistController.updateTherapistProfile)

export { router as therapistRoutes }
