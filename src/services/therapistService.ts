import { prisma } from '../prisma'

export interface TherapistSearchFilters {
  specialties?: string[]
  languages?: string[]
  location?: string
  minRating?: number
  availableAfter?: Date
  limit?: number
  offset?: number
}

export interface TherapistProfileUpdate {
  bio?: string
  qualifications?: string[]
  licenses?: string[]
  specialties?: string[]
  languages?: string[]
  location?: string
  images?: string[]
}

export class TherapistService {
  static async searchTherapists(filters: TherapistSearchFilters) {
    const {
      specialties,
      languages,
      location,
      minRating,
      availableAfter,
      limit = 20,
      offset = 0
    } = filters

    const whereClause: any = {
      user: {
        role: 'THERAPIST',
        verified: true
      }
    }

    if (specialties && specialties.length > 0) {
      whereClause.specialties = {
        hasSome: specialties
      }
    }

    if (languages && languages.length > 0) {
      whereClause.languages = {
        hasSome: languages
      }
    }

    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    if (minRating) {
      whereClause.ratingAvg = {
        gte: minRating
      }
    }

    const therapists = await prisma.therapistProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            timezone: true
          }
        },
        availabilities: availableAfter ? {
          where: {
            startTs: {
              gte: availableAfter
            },
            isBooked: false
          },
          orderBy: {
            startTs: 'asc'
          },
          take: 5
        } : false
      },
      orderBy: {
        ratingAvg: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await prisma.therapistProfile.count({
      where: whereClause
    })

    return {
      therapists,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
  }

  static async getTherapistById(therapistId: string) {
    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: therapistId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            timezone: true,
            verified: true
          }
        },
        availabilities: {
          where: {
            startTs: {
              gte: new Date()
            },
            isBooked: false
          },
          orderBy: {
            startTs: 'asc'
          }
        },
        bookings: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            review: true
          },
          orderBy: {
            startTs: 'desc'
          },
          take: 10
        }
      }
    })

    if (!therapist) {
      throw new Error('Therapist not found')
    }

    // Calculate average rating from reviews
    const reviews = therapist.bookings
      .map(booking => booking.review)
      .filter(review => review !== null)
      .map(review => review!.rating)

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, rating) => sum + rating, 0) / reviews.length 
      : 0

    return {
      ...therapist,
      ratingAvg: avgRating,
      reviewCount: reviews.length
    }
  }

  static async updateTherapistProfile(therapistId: string, updateData: TherapistProfileUpdate) {
    // Verify therapist exists
    const existingProfile = await prisma.therapistProfile.findUnique({
      where: { userId: therapistId }
    })

    if (!existingProfile) {
      throw new Error('Therapist profile not found')
    }

    const updatedProfile = await prisma.therapistProfile.update({
      where: { userId: therapistId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            timezone: true
          }
        }
      }
    })

    return updatedProfile
  }

  static async getTherapistAvailability(therapistId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      therapistId,
      isBooked: false
    }

    if (startDate) {
      whereClause.startTs = { gte: startDate }
    }

    if (endDate) {
      whereClause.endTs = { lte: endDate }
    }

    const availabilities = await prisma.availability.findMany({
      where: whereClause,
      orderBy: {
        startTs: 'asc'
      }
    })

    return availabilities
  }
}
