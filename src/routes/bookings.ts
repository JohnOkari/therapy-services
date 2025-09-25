import { Router } from 'express'
import { BookingController } from '../controllers/bookingController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', authenticateToken, BookingController.create)
router.post('/:id/cancel', authenticateToken, BookingController.cancel)
router.post('/:id/reschedule', authenticateToken, BookingController.reschedule)

export { router as bookingRoutes }


