#!/bin/bash

echo "🌟 Setting up your 2026 Bucket List application..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL."
    exit 1
fi

echo "✅ Python and PostgreSQL found!"

echo "📦 Creating virtual environment..."
python3 -m venv venv

echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing dependencies..."
pip install -r requirements.txt

if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials!"
fi

echo "🗄️  Creating database..."
createdb bucketlist_db 2>/dev/null || echo "Database might already exist, continuing..."

echo "🔧 Initializing database tables..."
python init_db.py

echo ""
echo "✨ Setup complete! ✨"
echo ""
echo "To start the application:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run the app: python app.py"
echo "3. Open http://localhost:5000 in your browser"
echo ""
echo "Made with 💕 for an amazing 2026!"
