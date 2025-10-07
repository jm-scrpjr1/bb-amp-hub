#!/bin/bash

# Kill any process running on port 3000
echo "🔄 Checking for processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "✅ Port 3000 is free"

# Start the React development server on port 3000
echo "🚀 Starting React development server on port 3000..."
PORT=3000 npm start
