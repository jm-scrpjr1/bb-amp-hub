#!/bin/bash

# Deployment script for Prompt Library Backend to EC2
# Run this on the EC2 instance (54.226.14.229)

echo "🚀 Starting Prompt Library Backend Deployment..."

# Navigate to backend directory
cd /home/ubuntu/bb-amp-hub/src/backend || exit 1

# Pull latest changes from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install new dependencies
echo "📦 Installing new dependencies (csv-parser, multer, puppeteer)..."
npm install

# Run Prisma migration to update database schema
echo "🗄️  Applying database schema changes..."
npx prisma db push

# Seed the prompt library
echo "🌱 Seeding prompt library (78 prompts)..."
node scripts/seedPromptLibrary.js

# Restart the backend service with PM2
echo "🔄 Restarting backend service..."
pm2 restart bb-amp-hub-backend

# Show PM2 status
echo "✅ Deployment complete! Backend status:"
pm2 status

echo ""
echo "🎉 Prompt Library Backend deployed successfully!"
echo "📊 API endpoints now available:"
echo "   - GET  /api/prompts/categories"
echo "   - GET  /api/prompts?category=General%20Use"
echo "   - POST /api/prompts/:id/execute"
echo "   - POST /api/prompts/:id/favorite"
echo ""
echo "🧪 Test the API:"
echo "   curl https://api.boldbusiness.com/api/prompts/categories"

