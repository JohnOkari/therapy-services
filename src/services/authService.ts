import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import { Role } from '@prisma/client'

export interface RegisterData {
  email: string
  password: string
  fullName: string
  role: Role
  phone?: string
  timezone?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'

  static async register(data: RegisterData): Promise<{ user: any; tokens: AuthTokens }> {
    const { email, password, fullName, role, phone, timezone } = data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        phone,
        timezone: timezone || 'UTC'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        timezone: true,
        verified: true,
        createdAt: true
      }
    })

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role)

    return { user, tokens }
  }

  static async login(data: LoginData): Promise<{ user: any; tokens: AuthTokens }> {
    const { email, password } = data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role)

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user

    return { user: userWithoutPassword, tokens }
  }

  static async verifyTherapist(userId: string, verificationData: any): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { therapistProfile: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.role !== 'THERAPIST') {
      throw new Error('Only therapists can be verified')
    }

    // Update verification status and profile
    await prisma.user.update({
      where: { id: userId },
      data: { verified: true }
    })

    // Create or update therapist profile if it doesn't exist
    if (!user.therapistProfile) {
      await prisma.therapistProfile.create({
        data: {
          userId,
          bio: verificationData.bio || '',
          qualifications: verificationData.qualifications || [],
          licenses: verificationData.licenses || [],
          specialties: verificationData.specialties || [],
          languages: verificationData.languages || [],
          location: verificationData.location || '',
          images: verificationData.images || []
        }
      })
    } else {
      await prisma.therapistProfile.update({
        where: { userId },
        data: {
          bio: verificationData.bio || user.therapistProfile.bio,
          qualifications: verificationData.qualifications || user.therapistProfile.qualifications,
          licenses: verificationData.licenses || user.therapistProfile.licenses,
          specialties: verificationData.specialties || user.therapistProfile.specialties,
          languages: verificationData.languages || user.therapistProfile.languages,
          location: verificationData.location || user.therapistProfile.location,
          images: verificationData.images || user.therapistProfile.images
        }
      })
    }
  }

  private static async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }

    const payload = { userId, email, role }

    const accessToken = jwt.sign(payload, secret, { expiresIn: this.ACCESS_TOKEN_EXPIRY })
    const refreshToken = jwt.sign(payload, secret, { expiresIn: this.REFRESH_TOKEN_EXPIRY })

    return { accessToken, refreshToken }
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }

    try {
      const decoded = jwt.verify(refreshToken, secret) as any
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return this.generateTokens(user.id, user.email, user.role)
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }
}
