#!/bin/bash

# NEDA Integration Dashboard Setup Script
echo "🚀 Setting up NEDA Integration Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local template..."
    cat > .env.local << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For production
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOL
    echo "📝 Please update .env.local with your Supabase credentials"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run the SQL migration in your Supabase dashboard:"
echo "   - Copy contents of sql/migrations/001_initial_schema.sql"
echo "   - Run it in Supabase SQL Editor"
echo "3. Configure authentication URLs in Supabase:"
echo "   - Site URL: http://localhost:3000"
echo "   - Redirect URLs: http://localhost:3000/**"
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "📚 Documentation: http://localhost:3000/protected/docs"
echo "⚙️  Settings: http://localhost:3000/protected/settings"
echo ""
echo "Happy coding! 🚀"
