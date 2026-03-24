#!/bin/bash
# Setup script for Vietnam Music Sources Integration

echo "=================================="
echo "Vietnam Music Sources Setup"
echo "=================================="
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
pip install spotipy beautifulsoup4 lxml

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "✗ Failed to install dependencies"
    exit 1
fi

echo ""
echo "=================================="
echo "Spotify API Setup"
echo "=================================="
echo ""
echo "To use Spotify integration, you need API credentials:"
echo ""
echo "1. Go to: https://developer.spotify.com/dashboard"
echo "2. Log in with your Spotify account"
echo "3. Click 'Create App'"
echo "4. Fill in:"
echo "   - App name: MoodVibe Creator"
echo "   - App description: Music playlist generator"
echo "   - Redirect URI: http://localhost:8899/callback"
echo "5. After creating, copy Client ID and Client Secret"
echo ""
echo "Add these to your backend/.env file:"
echo ""
echo "SPOTIFY_CLIENT_ID=your-client-id-here"
echo "SPOTIFY_CLIENT_SECRET=your-client-secret-here"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✓ .env file exists"
    echo ""
    read -p "Do you want to add Spotify credentials now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter Spotify Client ID: " client_id
        read -p "Enter Spotify Client Secret: " client_secret

        # Check if variables already exist
        if grep -q "SPOTIFY_CLIENT_ID=" .env; then
            # Update existing variables
            sed -i "s/SPOTIFY_CLIENT_ID=.*/SPOTIFY_CLIENT_ID=$client_id/" .env
            sed -i "s/SPOTIFY_CLIENT_SECRET=.*/SPOTIFY_CLIENT_SECRET=$client_secret/" .env
        else
            # Add new variables
            echo "" >> .env
            echo "# Spotify API" >> .env
            echo "SPOTIFY_CLIENT_ID=$client_id" >> .env
            echo "SPOTIFY_CLIENT_SECRET=$client_secret" >> .env
        fi
        echo "✓ Spotify credentials added to .env"
    fi
else
    echo "⚠ .env file not found"
    echo "Copy .env.example to .env and add your credentials:"
    echo "  cp .env.example .env"
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "To test the integration:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend"
echo "   python -m uvicorn app.main:app --reload --port 8899"
echo ""
echo "2. Test endpoints:"
echo "   curl 'http://localhost:8899/api/music/spotify/health'"
echo "   curl 'http://localhost:8899/api/music/zing/health'"
echo ""
echo "3. Search music:"
echo "   curl -X POST 'http://localhost:8899/api/music/spotify/search?query=nhạc việt pop&limit=5'"
echo ""
echo "For more information, see: backend/VNM_MUSIC_INTEGRATION.md"
echo ""
