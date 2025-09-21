import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Define enums locally until Prisma client is generated
const Role = {
  CLIENT: 'CLIENT',
  THERAPIST: 'THERAPIST',
  ADMIN: 'ADMIN'
} as const

const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const

const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
} as const

const SessionType = {
  VIDEO: 'VIDEO',
  IN_PERSON: 'IN_PERSON',
  PHONE: 'PHONE'
} as const

const AccessLevel = {
  PRIVATE: 'PRIVATE',
  SHARED: 'SHARED',
  CLIENT_ACCESSIBLE: 'CLIENT_ACCESSIBLE'
} as const

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create cancellation policies
  const cancellationPolicies = await Promise.all([
    prisma.cancellationPolicy.create({
      data: {
        name: 'Standard Policy',
        refundPercent: 100,
        cutoffHours: 24,
      },
    }),
    prisma.cancellationPolicy.create({
      data: {
        name: 'Flexible Policy',
        refundPercent: 80,
        cutoffHours: 12,
      },
    }),
    prisma.cancellationPolicy.create({
      data: {
        name: 'Strict Policy',
        refundPercent: 50,
        cutoffHours: 48,
      },
    }),
  ])

  console.log('✅ Created cancellation policies')

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@therapy-platform.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      fullName: 'Platform Administrator',
      phone: '+1234567890',
      timezone: 'America/New_York',
      verified: true,
    },
  })

  console.log('✅ Created admin user')

  // Create therapist users
  const therapistPasswordHash = await bcrypt.hash('therapist123', 10)
  const therapists = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dr.smith@therapy-platform.com',
        passwordHash: therapistPasswordHash,
        role: Role.THERAPIST,
        fullName: 'Dr. Sarah Smith',
        phone: '+1234567891',
        timezone: 'America/New_York',
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.jones@therapy-platform.com',
        passwordHash: therapistPasswordHash,
        role: Role.THERAPIST,
        fullName: 'Dr. Michael Jones',
        phone: '+1234567892',
        timezone: 'America/Los_Angeles',
        verified: true,
      },
    }),
  ])

  console.log('✅ Created therapist users')

  // Create therapist profiles
  const therapistProfiles = await Promise.all([
    prisma.therapistProfile.create({
      data: {
        userId: therapists[0].id,
        bio: 'Licensed clinical psychologist with 10+ years of experience in cognitive behavioral therapy and anxiety disorders.',
        qualifications: ['PhD in Clinical Psychology', 'Licensed Clinical Psychologist'],
        licenses: ['LCP-12345', 'NPI-987654321'],
        specialties: ['Anxiety Disorders', 'Depression', 'Cognitive Behavioral Therapy'],
        languages: ['English', 'Spanish'],
        location: 'New York, NY',
        ratingAvg: 4.8,
        images: ['profile1.jpg', 'office1.jpg'],
      },
    }),
    prisma.therapistProfile.create({
      data: {
        userId: therapists[1].id,
        bio: 'Marriage and family therapist specializing in relationship counseling and trauma recovery.',
        qualifications: ['LMFT', 'Masters in Marriage and Family Therapy'],
        licenses: ['LMFT-67890', 'NPI-123456789'],
        specialties: ['Marriage Counseling', 'Trauma Therapy', 'Family Therapy'],
        languages: ['English'],
        location: 'Los Angeles, CA',
        ratingAvg: 4.9,
        images: ['profile2.jpg', 'office2.jpg'],
      },
    }),
  ])

  console.log('✅ Created therapist profiles')

  // Create client users
  const clientPasswordHash = await bcrypt.hash('client123', 10)
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        passwordHash: clientPasswordHash,
        role: Role.CLIENT,
        fullName: 'John Doe',
        phone: '+1234567893',
        timezone: 'America/New_York',
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        passwordHash: clientPasswordHash,
        role: Role.CLIENT,
        fullName: 'Jane Smith',
        phone: '+1234567894',
        timezone: 'America/Los_Angeles',
        verified: true,
      },
    }),
  ])

  console.log('✅ Created client users')

  // Create availability slots
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const availabilities = await Promise.all([
    // Dr. Smith availability
    prisma.availability.create({
      data: {
        therapistId: therapists[0].id,
        startTs: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Tuesday 9 AM
        endTs: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Tuesday 10 AM
        recurringRule: 'weekly',
        isBooked: false,
      },
    }),
    prisma.availability.create({
      data: {
        therapistId: therapists[0].id,
        startTs: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Tuesday 10 AM
        endTs: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // Tuesday 11 AM
        recurringRule: 'weekly',
        isBooked: false,
      },
    }),
    // Dr. Jones availability
    prisma.availability.create({
      data: {
        therapistId: therapists[1].id,
        startTs: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Wednesday 2 PM
        endTs: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // Wednesday 3 PM
        recurringRule: 'weekly',
        isBooked: false,
      },
    }),
  ])

  console.log('✅ Created availability slots')

  // Create sample bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        clientId: clients[0].id,
        therapistId: therapists[0].id,
        availabilityId: availabilities[0].id,
        startTs: availabilities[0].startTs,
        endTs: availabilities[0].endTs,
        status: BookingStatus.CONFIRMED,
        priceCents: 15000, // $150.00
        currency: 'USD',
        cancellationPolicyId: cancellationPolicies[0].id,
      },
    }),
    prisma.booking.create({
      data: {
        clientId: clients[1].id,
        therapistId: therapists[1].id,
        availabilityId: availabilities[2].id,
        startTs: availabilities[2].startTs,
        endTs: availabilities[2].endTs,
        status: BookingStatus.PENDING,
        priceCents: 12000, // $120.00
        currency: 'USD',
        cancellationPolicyId: cancellationPolicies[1].id,
      },
    }),
  ])

  console.log('✅ Created sample bookings')

  // Create payments
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        bookingId: bookings[0].id,
        userId: clients[0].id,
        provider: 'stripe',
        providerChargeId: 'ch_1234567890',
        amountCents: 15000,
        status: PaymentStatus.COMPLETED,
      },
    }),
  ])

  console.log('✅ Created payments')

  // Create session records
  const sessionRecords = await Promise.all([
    prisma.sessionRecord.create({
      data: {
        bookingId: bookings[0].id,
        sessionType: SessionType.VIDEO,
        joinUrl: 'https://zoom.us/j/123456789',
        startedAt: new Date(),
        endedAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      },
    }),
  ])

  console.log('✅ Created session records')

  // Create sample messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        conversationId: `conv_${clients[0].id}_${therapists[0].id}`,
        senderId: clients[0].id,
        contentEncrypted: 'encrypted_message_content_1',
      },
    }),
    prisma.message.create({
      data: {
        conversationId: `conv_${clients[0].id}_${therapists[0].id}`,
        senderId: therapists[0].id,
        contentEncrypted: 'encrypted_message_content_2',
      },
    }),
  ])

  console.log('✅ Created sample messages')

  // Create therapist notes
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        therapistId: therapists[0].id,
        bookingId: bookings[0].id,
        contentEncrypted: 'encrypted_note_content_1',
        accessLevel: AccessLevel.PRIVATE,
      },
    }),
  ])

  console.log('✅ Created therapist notes')

  // Create sample reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        bookingId: bookings[0].id,
        clientId: clients[0].id,
        rating: 5,
        comment: 'Excellent session! Dr. Smith was very helpful and understanding.',
      },
    }),
  ])

  console.log('✅ Created sample reviews')

  // Create audit logs
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'user_created',
        metadata: { targetUserId: clients[0].id },
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: therapists[0].id,
        action: 'booking_confirmed',
        metadata: { bookingId: bookings[0].id },
      },
    }),
  ])

  console.log('✅ Created audit logs')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- ${cancellationPolicies.length} cancellation policies`)
  console.log(`- 1 admin user`)
  console.log(`- ${therapists.length} therapist users`)
  console.log(`- ${clients.length} client users`)
  console.log(`- ${therapistProfiles.length} therapist profiles`)
  console.log(`- ${availabilities.length} availability slots`)
  console.log(`- ${bookings.length} bookings`)
  console.log(`- ${payments.length} payments`)
  console.log(`- ${sessionRecords.length} session records`)
  console.log(`- ${messages.length} messages`)
  console.log(`- ${notes.length} notes`)
  console.log(`- ${reviews.length} reviews`)
  console.log(`- ${auditLogs.length} audit logs`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
