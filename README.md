# Therapy Platform

A comprehensive therapy platform built with Node.js, Express, TypeScript, and Prisma.

## 🏗️ Database Schema

### Core Models

#### Users
- **Primary table** for all platform users (clients, therapists, admins)
- Supports role-based access control
- Includes verification status and timezone support

#### Therapist Profiles
- Extended information for therapist users
- Stores qualifications, licenses, specialties, and ratings
- Supports multiple languages and location data

#### Availability
- Therapist availability slots with recurring rules
- Supports booking status tracking
- Indexed for efficient querying

#### Bookings
- Session appointments between clients and therapists
- Tracks status, pricing, and cancellation policies
- Links to availability slots and payments

#### Payments
- Payment processing records
- Supports multiple payment providers
- Tracks refund status and amounts

#### Session Records
- Actual session execution data
- Supports video, in-person, and phone sessions
- Stores join URLs and recordings

#### Messages
- Encrypted messaging system
- Organized by conversation threads
- Indexed for performance

#### Notes
- Therapist session notes with access levels
- Encrypted content for privacy
- Links to specific bookings

#### Reviews
- Client feedback system
- Rating and comment support
- One review per booking

#### Audit Logs
- System activity tracking
- User action logging with metadata
- Indexed for efficient querying

#### Cancellation Policies
- Flexible refund policies
- Configurable cutoff times
- Used across multiple bookings

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Reset database and reseed
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## 📊 Sample Data

The seed script creates:
- **3 cancellation policies** (Standard, Flexible, Strict)
- **1 admin user** (admin@therapy-platform.com)
- **2 therapist users** with complete profiles
- **2 client users** with verified accounts
- **3 availability slots** for booking
- **2 sample bookings** in different states
- **1 completed payment** record
- **1 session record** with video session data
- **Sample messages** between clients and therapists
- **Therapist notes** with private access level
- **Client reviews** with ratings
- **Audit logs** for system tracking

### Default Credentials

- **Admin:** admin@therapy-platform.com / admin123
- **Therapist:** dr.smith@therapy-platform.com / therapist123
- **Client:** john.doe@example.com / client123

## 🔧 Development

### Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── services/        # Business logic
├── prisma.ts        # Prisma client configuration
└── server.ts        # Express server setup
```

### Key Features

- **Role-based authentication** (Client, Therapist, Admin)
- **Encrypted messaging** system
- **Session scheduling** with availability management
- **Payment processing** with multiple providers
- **Review and rating** system
- **Audit logging** for compliance
- **Flexible cancellation** policies
- **Multi-timezone** support

### Database Indexes

Optimized indexes for:
- User lookups by email and role
- Booking queries by client/therapist and time
- Message conversations
- Payment provider lookups
- Audit log searches

## 🔒 Security Features

- **Password hashing** with bcrypt
- **Encrypted content** for sensitive data
- **Role-based access** control
- **Audit logging** for all actions
- **Input validation** with Zod schemas
- **CORS protection** configured

## 📈 Performance Optimizations

- **Database indexes** on frequently queried fields
- **Efficient relationships** with proper foreign keys
- **Connection pooling** with Prisma
- **Query optimization** with selective field loading

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Documentation

The API includes endpoints for:
- User authentication and management
- Therapist profile management
- Availability scheduling
- Booking management
- Payment processing
- Session management
- Messaging system
- Review system
- Admin functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details