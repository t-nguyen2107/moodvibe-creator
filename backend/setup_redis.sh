#!/bin/bash

# Redis Setup Script for MoodVibe Creator AI Music Search
# This script helps install and start Redis for different platforms

set -e

echo "=========================================="
echo "Redis Setup for AI Music Search Caching"
echo "=========================================="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
echo ""

case $OS in
    macos)
        echo "Installing Redis on macOS using Homebrew..."
        echo ""

        # Check if Homebrew is installed
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi

        # Check if Redis is already installed
        if brew list redis &> /dev/null; then
            echo "✅ Redis is already installed"
            echo "   Starting Redis service..."
            brew services start redis
        else
            echo "📦 Installing Redis..."
            brew install redis
            echo "✅ Redis installed successfully"
            echo "   Starting Redis service..."
            brew services start redis
        fi

        echo ""
        echo "✅ Redis is running on localhost:6379"
        ;;

    linux)
        echo "Installing Redis on Linux..."
        echo ""

        # Detect Linux distribution
        if [ -f /etc/debian_version ]; then
            # Debian/Ubuntu
            echo "Detected Debian/Ubuntu system"
            echo "📦 Installing Redis..."
            sudo apt-get update
            sudo apt-get install -y redis-server
            echo "✅ Redis installed"
            echo "   Starting Redis service..."
            sudo systemctl start redis-server
            sudo systemctl enable redis-server
        elif [ -f /etc/redhat-release ]; then
            # RHEL/CentOS/Fedora
            echo "Detected RedHat/CentOS/Fedora system"
            echo "📦 Installing Redis..."
            sudo yum install -y redis
            echo "✅ Redis installed"
            echo "   Starting Redis service..."
            sudo systemctl start redis
            sudo systemctl enable redis
        else
            echo "❌ Unsupported Linux distribution"
            echo "   Please install Redis manually:"
            echo "   https://redis.io/download"
            exit 1
        fi

        echo ""
        echo "✅ Redis is running on localhost:6379"
        ;;

    windows)
        echo "Setting up Redis on Windows..."
        echo ""
        echo "Option 1: Using Docker (Recommended)"
        echo "-----------------------------------"
        echo "Install Docker Desktop, then run:"
        echo "  docker run -d -p 6379:6379 --name redis redis:alpine"
        echo ""

        echo "Option 2: Using WSL (Windows Subsystem for Linux)"
        echo "--------------------------------------------------"
        echo "1. Enable WSL: wsl --install"
        echo "2. Open WSL terminal"
        echo "3. Run: sudo apt-get install redis-server"
        echo "4. Start: sudo service redis-server start"
        echo ""

        echo "Option 3: Download Redis for Windows"
        echo "-------------------------------------"
        echo "Download from: https://github.com/microsoftarchive/redis/releases"
        echo "Note: This is an unofficial Windows port"
        echo ""

        echo "⚠️  Redis is optional. The AI service will work without caching if Redis is not available."
        ;;

    *)
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "   Please install Redis manually: https://redis.io/download"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Testing Redis Connection"
echo "=========================================="
echo ""

# Test Redis connection
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is responding correctly"
        redis-cli ping
    else
        echo "❌ Redis is not responding"
        echo "   Try starting it manually:"
        if [ "$OS" == "macos" ]; then
            echo "   brew services start redis"
        elif [ "$OS" == "linux" ]; then
            echo "   sudo systemctl start redis"
        fi
    fi
else
    echo "⚠️  redis-cli not found, but Redis may still be running"
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "1. Update backend/.env with Redis configuration:"
echo "   REDIS_HOST=localhost"
echo "   REDIS_PORT=6379"
echo ""
echo "2. Add your OpenAI API key:"
echo "   OPENAI_API_KEY=sk-your-key-here"
echo ""
echo "3. Install Python dependencies:"
echo "   pip install -r requirements.txt"
echo ""
echo "4. Test the AI service:"
echo "   python test_ai_music_search.py"
echo ""
echo "✅ Setup complete!"
