import { Request, Response } from 'express'
import { z } from 'zod'
import { TherapistService, TherapistSearchFilters, TherapistProfileUpdate } from '../services/therapistService'
import { AuthRequest } from '../middleware/auth'

// Validation schemas
const searchFiltersSchema = z.object({
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  location: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  availableAfter: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
})

const profileUpdateSchema = z.object({
  bio: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  licenses: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional()
})

export class TherapistController {
  static async searchTherapists(req: Request, res: Response) {
    try {
      const validatedFilters = searchFiltersSchema.parse(req.query)
      
      // Convert availableAfter string to Date if provided
      const filters: TherapistSearchFilters = {
        ...validatedFilters,
        availableAfter: validatedFilters.availableAfter 
          ? new Date(validatedFilters.availableAfter) 
          : undefined
      }
      
      const result = await TherapistService.searchTherapists(filters)
      
      res.json({
        message: 'Therapists retrieved successfully',
        ...result
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        })
      }
      
      if (error instanceof Error) {
        return res.status(500).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  static async getTherapistById(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      if (!id) {
        return res.status(400).json({
          error: 'Therapist ID is required'
        })
      }
      
      const therapist = await TherapistService.getTherapistById(id)
      
      res.json({
        message: 'Therapist retrieved successfully',
        therapist
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Therapist not found') {
          return res.status(404).json({
            error: error.message
          })
        }
        
        return res.status(500).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  static async updateTherapistProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const { id } = req.params
      
      if (!id) {
        return res.status(400).json({
          error: 'Therapist ID is required'
        })
      }

      // Ensure user can only update their own profile
      if (req.user.id !== id) {
        return res.status(403).json({
          error: 'You can only update your own profile'
        })
      }

      const validatedData = profileUpdateSchema.parse(req.body)
      
      const updatedProfile = await TherapistService.updateTherapistProfile(
        id, 
        validatedData as TherapistProfileUpdate
      )
      
      res.json({
        message: 'Therapist profile updated successfully',
        therapist: updatedProfile
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        })
      }
      
      if (error instanceof Error) {
        if (error.message === 'Therapist profile not found') {
          return res.status(404).json({
            error: error.message
          })
        }
        
        return res.status(500).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  static async getTherapistAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { startDate, endDate } = req.query
      
      if (!id) {
        return res.status(400).json({
          error: 'Therapist ID is required'
        })
      }
      
      const availability = await TherapistService.getTherapistAvailability(
        id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      )
      
      res.json({
        message: 'Availability retrieved successfully',
        availability
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
}
