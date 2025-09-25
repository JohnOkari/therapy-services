import { prisma } from '../prisma'

export interface CreateBookingInput {
  clientId: string
  therapistId: string
  availabilityId: string
  amount: number
  currency: string
  paymentReference?: string
}

export class BookingService {
  static async createBooking(input: CreateBookingInput) {
    const { clientId, therapistId, availabilityId, amount, currency, paymentReference } = input

    return await prisma.$transaction(async (tx) => {
      const availability = await tx.availability.findUnique({ where: { id: availabilityId } })
      if (!availability) {
        throw new Error('Availability slot not found')
      }
      if (availability.isBooked) {
        throw new Error('Availability slot already booked')
      }
      if (availability.therapistId !== therapistId) {
        throw new Error('Availability does not belong to therapist')
      }

      const booking = await tx.booking.create({
        data: {
          clientId,
          therapistId,
          startTs: availability.startTs,
          endTs: availability.endTs,
          status: 'CONFIRMED'
        }
      })

      // Optional payment record if schema exists
      try {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount,
            currency,
            status: 'PAID',
            reference: paymentReference || null
          }
        })
      } catch (e) {
        // If payment model does not exist, ignore
      }

      await tx.availability.update({
        where: { id: availabilityId },
        data: { isBooked: true }
      })

      return booking
    })
  }

  static async cancelBooking(bookingId: string, actorId: string, actorRole: string) {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } })
      if (!booking) {
        throw new Error('Booking not found')
      }

      const isOwner = actorId === booking.clientId || actorId === booking.therapistId
      if (!isOwner && actorRole !== 'ADMIN') {
        throw new Error('Not authorized to cancel this booking')
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      })

      // Free up the availability slot if it still exists and is in future
      try {
        const availability = await tx.availability.findFirst({
          where: {
            therapistId: booking.therapistId,
            startTs: booking.startTs,
            endTs: booking.endTs
          }
        })
        if (availability) {
          await tx.availability.update({ where: { id: availability.id }, data: { isBooked: false } })
        }
      } catch (e) {
        // ignore if availability model missing
      }

      return updated
    })
  }

  static async rescheduleBooking(bookingId: string, newAvailabilityId: string, actorId: string, actorRole: string) {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } })
      if (!booking) {
        throw new Error('Booking not found')
      }

      const isOwner = actorId === booking.clientId || actorId === booking.therapistId
      if (!isOwner && actorRole !== 'ADMIN') {
        throw new Error('Not authorized to reschedule this booking')
      }

      const newSlot = await tx.availability.findUnique({ where: { id: newAvailabilityId } })
      if (!newSlot) {
        throw new Error('New availability slot not found')
      }
      if (newSlot.isBooked) {
        throw new Error('New availability slot already booked')
      }
      if (newSlot.therapistId !== booking.therapistId) {
        throw new Error('New slot must belong to the same therapist')
      }

      // Free old slot if present
      try {
        const oldSlot = await tx.availability.findFirst({
          where: {
            therapistId: booking.therapistId,
            startTs: booking.startTs,
            endTs: booking.endTs
          }
        })
        if (oldSlot) {
          await tx.availability.update({ where: { id: oldSlot.id }, data: { isBooked: false } })
        }
      } catch (e) {
        // ignore
      }

      // Reserve new slot
      await tx.availability.update({ where: { id: newAvailabilityId }, data: { isBooked: true } })

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          startTs: newSlot.startTs,
          endTs: newSlot.endTs,
          status: 'RESCHEDULED'
        }
      })

      return updated
    })
  }
}


