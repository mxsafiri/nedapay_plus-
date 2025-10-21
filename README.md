# 🚀 NedaPay Plus

### Enterprise-Grade Cross-Border Payment Infrastructure Platform

> An independent, enhanced fork of NEDA Labs Dashboard - A sophisticated payment orchestration platform enabling seamless onramp/offramp transactions for cross-border payments using stablecoins.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.3-brightgreen)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [User Roles](#-user-roles--permissions)
- [User Flows](#-user-flows)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Security](#-security)

---

## 🎯 Overview

### What is NedaPay Plus?

NedaPay Plus is a full-stack payment infrastructure platform that bridges traditional finance (TradFi) with decentralized finance (DeFi). It connects:

- **Senders** (Merchants): Businesses enabling users to convert fiat↔crypto
- **Providers** (Liquidity Providers): Entities fulfilling payment orders and earning fees

### Business Model

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Sender    │────────▶│  NedaPay+    │────────▶│  Provider   │
│  (Merchant) │         │  (Platform)  │         │ (Liquidity) │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
   Requests              Orchestrates              Fulfills
   Payment               & Matches                 Orders
```

### Use Cases

1. **Cross-Border Payments**: International money transfers via stablecoins
2. **Remittances**: Low-cost global remittances using crypto rails  
3. **E-commerce**: Enable crypto payments for merchants
4. **P2P Transfers**: Peer-to-peer payment facilitation
5. **DeFi Integration**: Bridge TradFi payments with DeFi protocols

---

## ✨ Key Features

### 🔐 Multi-Role Authentication
- Email/Password auth with bcrypt hashing
- Email verification system (24-hour tokens)
- Password reset flow
- Role-based access control (RBAC)
- Session management with auto-refresh
- Separate admin backstage portal

### 👤 User Roles
- **Sender**: Create payment orders, API integration, webhook management
- **Provider**: Fulfill orders, manage liquidity, set rates
- **Both**: Dual role with profile switcher
- **Admin**: Full system access, user management, KYB verification

### 📊 Dashboard System
- **Sender Dashboard**: Transaction overview, API management, order history
- **Provider Dashboard**: Liquidity management, order fulfillment, earnings
- **Admin Dashboard**: User management, KYB verification, system config

### 💳 Payment Order System
```
Lifecycle: Initiated → Pending → Processing → Completed/Failed
```
- Real-time exchange rates
- Automatic provider matching
- Fee calculation (network, platform, sender)
- Transaction tracking & webhooks
- Payment validation

### 🔑 API Key Management
- Secure UUID + hashed secret generation
- Per-profile key assignment
- Usage tracking & rate limits
- Key rotation capability

### 📄 KYB Verification
Required documents:
- Certificate of Incorporation
- Articles of Incorporation  
- Business License
- Proof of Address
- AML/KYC Policies
- Beneficial Owner Info

### ⚙️ Configuration Management
- **Provider**: Conversion rates, order limits, liquidity pools
- **Sender**: Fee settings, webhook URLs, domain whitelisting
- **Admin**: Networks, tokens, currencies, platform fees

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Next.js App Router (Frontend)          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │Auth Pages  │  │ Dashboards │  │Admin Panel │   │
│  └────────────┘  └────────────┘  └────────────┘   │
├─────────────────────────────────────────────────────┤
│           React Components + Radix UI               │
├─────────────────────────────────────────────────────┤
│               API Layer (Next.js API Routes)        │
│  /auth • /admin • /networks • /configurations       │
├─────────────────────────────────────────────────────┤
│        Business Logic (Enhanced Auth + Data Store)  │
├─────────────────────────────────────────────────────┤
│              Data Layer (Prisma ORM)                │
├─────────────────────────────────────────────────────┤
│         Database (PostgreSQL via Supabase)          │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → API Route → Business Logic → Prisma → Database
     ↓                                                              ↓
  UI Update ←─ Response ←─ JSON ←─ Processing ←─ Query ←─ Results
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
                    ┌─────────┐
                    │  Admin  │
                    └────┬────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       ┌────▼────┐              ┌────▼────┐
       │ Sender  │              │Provider │
       └─────────┘              └─────────┘
```

| Role | Scope | Key Permissions |
|------|-------|----------------|
| **Admin** | N/A | Full access, user mgmt, KYB verification, system config |
| **Sender** | `"sender"` | Create orders, API keys, webhooks, transaction history |
| **Provider** | `"provider"` | Fulfill orders, manage liquidity, set rates, earnings |
| **Both** | `"sender provider"` | All sender + provider features, role switcher |

---

## 🔄 User Flows

### 1. Sender Onboarding (8 Steps)

```
1. Sign Up → 2. Email Verification → 3. Login → 4. Dashboard
    ↓
5. Generate API Key → 6. Trading Config → 7. Server Config → 8. API Integration
```

**Detailed Flow:**
1. **Sign Up**: Fill form (name, email, password), select "Sender"
2. **Email Verification**: Click link in email (24hr token)
3. **Login**: Credentials → localStorage stores user
4. **Dashboard**: View stats, transactions (all $0 initially)
5. **API Key**: Generate → Copy secret (shown once)
6. **Trading Config**: Set fee %, refund address, select tokens
7. **Server Config**: Add webhook URL, whitelist domains
8. **API Integration**: Use key in headers, create orders, receive webhooks

### 2. Provider Onboarding (10 Steps)

```
1. Sign Up as Provider → 2. KYB Docs → 3. Verification Pending
    ↓
4. Approved → 5. API Key → 6. Provider Settings → 7. Currencies
    ↓
8. Token Rates → 9. Liquidity Management → 10. Fulfill Orders
```

**Detailed Flow:**
1. **Sign Up**: Select "Provider", complete registration
2. **KYB Upload**: Submit incorporation docs, licenses, beneficial owner info
3. **Pending**: Admin reviews, status = "pending"
4. **Approved**: Status = "verified", full access granted
5. **API Key**: Generate provider API key
6. **Settings**: Trading name, provision mode, visibility
7. **Currencies**: Add supported fiats, set balances
8. **Rates**: Configure conversion rates per token-currency pair
9. **Liquidity**: Monitor balances, add to pools
10. **Orders**: View incoming orders, fulfill, earn fees

### 3. Admin Workflow

```
Backstage Login → User Management → KYB Review → Approve/Reject
      ↓
Provider Mgmt → Sender Mgmt → System Config (networks, tokens, fees)
```

### 4. Dual Role User

```
Login (scope="both") → Role Selection Modal → Choose Sender/Provider
      ↓
Access Dashboard → Profile Switcher → Switch Roles Anytime
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|----------|
| **Framework** | Next.js | 15.5.4 |
| **UI Library** | React | 19.0.0 |
| **Language** | TypeScript | 5.0 |
| **Database** | PostgreSQL (Supabase) | Latest |
| **ORM** | Prisma | 6.16.3 |
| **Auth** | Supabase Auth + Custom | Latest |
| **Styling** | Tailwind CSS | 3.4.1 |
| **Components** | Radix UI | Various |
| **Icons** | Lucide React | 0.511.0 |
| **Forms** | React Hook Form | - |
| **Notifications** | Sonner | 1.7.0 |
| **Email** | Resend | 6.1.2 |
| **Password** | bcryptjs | 3.0.2 |

### Dependencies

```json
{
  "@prisma/client": "^6.16.3",
  "@radix-ui/*": "Latest",
  "@supabase/supabase-js": "latest",
  "next": "latest",
  "react": "^19.0.0",
  "prisma": "^6.16.3",
  "tailwindcss": "^3.4.1"
}
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js ≥22.0.0
- npm ≥10.0.0  
- Supabase account
- PostgreSQL database

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/mxsafiri/nedapay_plus-.git
cd nedapay_plus
```

#### 2. Verify Node.js Version

```bash
node --version  # Should be 22.x or later
npm --version   # Should be 10.x or later
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Environment Setup

Create `.env` file in root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database URLs
DATABASE_URL=your_database_connection_string
DIRECT_URL=your_direct_database_url

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Admin Configuration
ADMIN_PASSWORD=your_secure_admin_password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 5. Database Setup

Generate Prisma client and push schema:

```bash
npm run prisma:generate
npm run prisma:push
```

Or run SQL migrations manually in Supabase SQL editor:
- `sql/migrations/001_initial_schema.sql`
- `sql/migrations/002_onramp_offramp_schema.sql`

#### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 🗄️ Database Schema

### Core Tables

#### Users & Profiles

```typescript
users {
  id: UUID (PK)
  email: string (unique)
  password: string (bcrypt hashed)
  first_name, last_name: string
  scope: "sender" | "provider" | "sender provider"
  is_email_verified: boolean
  kyb_verification_status: enum
  created_at, updated_at: timestamp
}

sender_profiles {
  id: UUID (PK)
  user_sender_profile: UUID (FK → users)
  webhook_url: string
  domain_whitelist: JSON
  is_active: boolean
  is_partner: boolean
}

provider_profiles {
  id: string (PK)
  user_provider_profile: UUID (FK → users)
  trading_name: string
  provision_mode: "auto" | "manual"
  visibility_mode: "public" | "private" | "whitelist"
  is_active, is_available: boolean
  is_kyb_verified: boolean
}
```

#### Payment System

```typescript
payment_orders {
  id: UUID (PK)
  amount, amount_paid, rate: float
  status: "initiated" | "pending" | "processing" | "completed" | "failed"
  sender_profile: UUID (FK)
  token: bigint (FK → tokens)
  tx_hash, gateway_id: string
  created_at, updated_at: timestamp
}

lock_payment_orders {
  id: UUID (PK)
  amount, rate, order_percent: float
  status: enum
  provider_profile: string (FK)
  token: bigint (FK)
  institution, account_identifier: string
}
```

#### Configuration

```typescript
api_keys {
  id: UUID (PK)
  secret: string (hashed, unique)
  provider_profile_api_key: string (FK)
  sender_profile_api_key: UUID (FK)
}

networks {
  id: bigint (PK)
  chain_id: bigint
  identifier: string (unique)
  rpc_endpoint, gateway_contract_address: string
  is_testnet: boolean
}

tokens {
  id: bigint (PK)
  symbol, contract_address: string
  decimals: int
  network_tokens: bigint (FK → networks)
  is_enabled: boolean
}

fiat_currencies {
  id: UUID (PK)
  code: string (unique) // e.g., "USD", "KES"
  name, symbol: string
  market_rate: float
  is_enabled: boolean
}
```

### Key Relationships

```
users (1) ──→ (0..1) sender_profiles
users (1) ──→ (0..1) provider_profiles
users (1) ──→ (0..1) kyb_profiles

sender_profiles (1) ──→ (*) payment_orders
provider_profiles (1) ──→ (*) lock_payment_orders

sender_profiles (1) ──→ (0..1) api_keys
provider_profiles (1) ──→ (0..1) api_keys

payment_orders (*) ──→ (1) tokens
lock_payment_orders (*) ──→ (1) tokens

tokens (*) ──→ (1) networks
```

**Total Tables**: 28 tables covering users, payments, KYB, transactions, webhooks, and configurations

---

## 🔌 API Endpoints

### Authentication APIs (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | ❌ |
| POST | `/signup` | User registration | ❌ |
| POST | `/logout` | User logout | ✅ |
| POST | `/verify-email` | Verify email token | ❌ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/reset-password` | Reset password with token | ❌ |
| POST | `/resend-verification` | Resend verification email | ❌ |

### Admin APIs (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Admin login | ❌ |
| POST | `/auth/logout` | Admin logout | ✅ Admin |
| GET | `/users` | List all users | ✅ Admin |
| POST | `/users/resend-verification` | Resend user verification | ✅ Admin |
| POST | `/verify-password` | Verify admin password | ✅ Admin |

### Configuration APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/networks` | Get blockchain networks | ✅ |
| GET/POST/PUT | `/provider-configurations` | Provider settings | ✅ Provider |
| GET/POST/PUT | `/sender-profile` | Sender profile | ✅ Sender |
| GET/POST/PUT | `/server-configurations` | Server settings | ✅ Sender |
| GET/POST/PUT | `/trading-configurations` | Trading settings | ✅ Sender |

### Request/Response Examples

**Sign Up:**
```typescript
POST /api/auth/signup
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "securePassword123",
  businessTypes: ["sender"] // or ["provider"] or ["sender", "provider"]
}

Response: {
  success: true,
  userId: "uuid",
  email: "john@example.com",
  message: "Account created successfully. Please verify your email."
}
```

**Login:**
```typescript
POST /api/auth/login
Body: {
  email: "john@example.com",
  password: "securePassword123"
}

Response: {
  success: true,
  user: {
    id: "uuid",
    email: "john@example.com",
    first_name: "John",
    last_name: "Doe",
    scope: "sender",
    kyb_verification_status: "not_started"
  }
}
```

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Email Verification**: Token-based (24hr expiry)
- ✅ **Session Management**: localStorage + server-side validation
- ✅ **Role-Based Access Control**: Granular permissions per role
- ✅ **Admin Isolation**: Separate backstage authentication

### Data Protection
- ✅ **API Key Security**: Hashed secrets, shown once
- ✅ **SQL Injection Prevention**: Prisma ORM parameterized queries
- ✅ **XSS Protection**: React auto-escaping, Content Security Policy
- ✅ **CSRF Protection**: SameSite cookies, token validation

### Database Security
- ✅ **Row Level Security (RLS)**: Supabase policies
- ✅ **Audit Logging**: transaction_logs table
- ✅ **Encrypted Connections**: SSL/TLS for database

### Best Practices
```typescript
// Environment variables never exposed to client
// Except NEXT_PUBLIC_* variables

// API keys stored hashed
const hashedSecret = await bcrypt.hash(secret, 10);

// Passwords never logged or returned
select: { password: false }

// Input validation on all endpoints
if (!email || !password) {
  return NextResponse.json({ error: "Required" }, { status: 400 });
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Option 1: GitHub Integration

1. Push code to GitHub (already done ✅)
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import `mxsafiri/nedapay_plus-`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `RESEND_API_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL`
6. Deploy!

#### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
# Follow prompts
vercel --prod
```

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Deploy dist folder
```

**Self-Hosted:**
```bash
npm run build
npm start
# Runs on port 3000
```

**Docker:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📚 Additional Documentation

For more detailed information, see:

- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin panel configuration
- **[PRISMA_SETUP.md](./PRISMA_SETUP.md)** - Database setup guide
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - Email service configuration
- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - GitHub repository setup
- **[docs/database-schema.md](./docs/database-schema.md)** - Full schema documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Development Team

Maintained by [mxsafiri](https://github.com/mxsafiri)

Forked from [NEDA-LABS/DASHBOARD](https://github.com/NEDA-LABS/DASHBOARD)

---

## 📞 Support

For support and questions:
- 📧 Email: [support contact]
- 🐛 Issues: [GitHub Issues](https://github.com/mxsafiri/nedapay_plus-/issues)
- 📖 Documentation: Check `/protected/docs` after login

---

## 🎯 Roadmap

- [ ] Payment order API endpoints
- [ ] Webhook notification system
- [ ] Provider auto-matching algorithm
- [ ] Real-time transaction dashboard
- [ ] Mobile app integration
- [ ] Multi-language support
- [ ] Advanced analytics

---

**Built with ❤️ for seamless cross-border payments**

**🌟 Star this repo if you find it helpful!**

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── protected/         # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── settings/          # Settings components
│   ├── docs/             # Documentation components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client configuration
│   ├── types/            # TypeScript type definitions
│   └── database/         # Database operations
├── sql/                   # Database migrations
└── docs/                 # Documentation files
```

## Authentication Flow

1. **Sign Up**: Users select business type (Sender/Provider)
2. **Profile Creation**: Automatic profile creation with metadata
3. **Dashboard Access**: Role-based dashboard based on business type
4. **API Keys**: Generate secure API keys for integration

## Business Types

### Senders
- Enable cross-border payments for merchants
- Provide onramp/offramp services to customers
- Access transaction APIs and webhooks
- Monitor transaction volumes and success rates

### Providers
- Provide liquidity for transactions
- Earn fees on facilitated transactions
- Manage liquidity pools and nodes
- Monitor earnings and performance metrics

## API Management

### API Key Generation
- Secure key generation with hashed secrets
- Granular permissions system
- Usage tracking and monitoring
- Easy key rotation and management

### Available Endpoints
- `POST /api/v1/transactions/onramp` - Create onramp transaction
- `POST /api/v1/transactions/offramp` - Create offramp transaction
- `GET /api/v1/transactions/{id}` - Get transaction details
- `GET /api/v1/rates` - Get current exchange rates

## Database Schema

The application uses the following main tables:

- **user_profiles**: Extended user information and business type
- **api_keys**: API key management with permissions
- **transactions**: Transaction records and status tracking
- **audit_logs**: Security and compliance audit trail

See `docs/database-schema.md` for detailed schema documentation.

## Security Features

- **Row Level Security (RLS)** on all tables
- **API key hashing** with SHA-256
- **Audit logging** for all important actions
- **Input validation** and sanitization
- **CSRF protection** with Supabase Auth

## Documentation

The dashboard includes comprehensive documentation:

- **Getting Started Guides** for both Senders and Providers
- **API Reference** with example requests
- **Integration Guides** for common use cases
- **SDK Documentation** for multiple languages

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation at `/protected/docs`
- Review the database schema in `docs/database-schema.md`
- Contact the development team

## Updates

To update dependencies:

```bash
npm update
```

To update the database schema, create a new migration file in `sql/migrations/`.

---

Built with ❤️ for seamless cross-border payments
