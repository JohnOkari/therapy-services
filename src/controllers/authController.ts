import { Request, Response } from 'express'
import { z } from 'zod'
import { AuthService, RegisterData, LoginData } from '../services/authService'
import { AuthRequest } from '../middleware/auth'

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['CLIENT', 'THERAPIST', 'ADMIN']),
  phone: z.string().optional(),
  timezone: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

const verifySchema = z.object({
  bio: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  licenses: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional()
})

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body)
      
      const result = await AuthService.register(validatedData as RegisterData)
      
      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        tokens: result.tokens
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        })
      }
      
      if (error instanceof Error) {
        return res.status(400).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body)
      
      const result = await AuthService.login(validatedData as LoginData)
      
      res.json({
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        })
      }
      
      if (error instanceof Error) {
        return res.status(401).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  static async verify(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const validatedData = verifySchema.parse(req.body)
      
      await AuthService.verifyTherapist(req.user.id, validatedData)
      
      res.json({
        message: 'Therapist verification completed successfully'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        })
      }
      
      if (error instanceof Error) {
        return res.status(400).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body
      
      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required'
        })
      }
      
      const tokens = await AuthService.refreshToken(refreshToken)
      
      res.json({
        message: 'Token refreshed successfully',
        tokens
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({
          error: error.message
        })
      }
      
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
}
