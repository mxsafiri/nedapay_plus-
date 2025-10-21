# NedaPay Plus

A comprehensive cross-border payment infrastructure dashboard for onramp and offramp transactions. Built with Next.js, Supabase, and TypeScript.

> **Note**: This is an independent fork of the NEDA Labs Dashboard project, customized and enhanced for specific use cases.

## Features

### Dashboard System
- **Role-based dashboards** for Senders and Providers
- **Real-time transaction monitoring**
- **Business type detection** and appropriate UI
- **Comprehensive analytics** and reporting

### User Management
- **Enhanced sign-up flow** with business type selection
- **Profile management** with verification status
- **API key generation** and management
- **Secure authentication** with Supabase Auth

### API Integration
- **RESTful API endpoints** for transactions
- **Webhook support** for real-time updates
- **Comprehensive documentation** with interactive guides
- **SDK support** for multiple programming languages

### Business Types
- **Senders**: Merchants providing onramp/offramp services
- **Providers**: Liquidity providers earning transaction fees

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **State Management**: React Hooks
- **Notifications**: Sonner

## Prerequisites

- **Node.js 22.x or later** - [Download Node.js](https://nodejs.org/)
- **npm 10.x or later** (comes with Node.js 22)
- **Supabase account** - [Create account](https://supabase.com/)

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd nedapay_plus
```

### 2. Verify Node.js version

```bash
node --version  # Should be 22.x or later
npm --version   # Should be 10.x or later
```

### 3. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [database.new](https://database.new)
2. Copy your project URL and anon key
3. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy the contents of sql/migrations/001_initial_schema.sql
# and run it in your Supabase SQL editor
```

### 5. Configure authentication

In your Supabase dashboard:
1. Go to Authentication → URL Configuration
2. Add your site URL: `http://localhost:3000`
3. Add redirect URLs: `http://localhost:3000/**`

### 6. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

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
