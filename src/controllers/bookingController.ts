import { Response } from 'express'
import { z } from 'zod'
import { BookingService } from '../services/bookingService'
import { AuthRequest } from '../middleware/auth'

const createSchema = z.object({
  therapistId: z.string().min(1),
  availabilityId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
  paymentReference: z.string().optional()
})

const rescheduleSchema = z.object({
  newAvailabilityId: z.string().min(1)
})

export class BookingController {
  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const body = createSchema.parse(req.body)

      const booking = await BookingService.createBooking({
        clientId: req.user.id,
        therapistId: body.therapistId,
        availabilityId: body.availabilityId,
        amount: body.amount,
        currency: body.currency,
        paymentReference: body.paymentReference
      })

      res.status(201).json({
        message: 'Booking created successfully',
        booking
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors })
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async cancel(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: 'Booking ID is required' })
      }

      const booking = await BookingService.cancelBooking(id, req.user.id, req.user.role)
      res.json({ message: 'Booking cancelled successfully', booking })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async reschedule(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: 'Booking ID is required' })
      }

      const body = rescheduleSchema.parse(req.body)

      const booking = await BookingService.rescheduleBooking(id, body.newAvailabilityId, req.user.id, req.user.role)
      res.json({ message: 'Booking rescheduled successfully', booking })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors })
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}


