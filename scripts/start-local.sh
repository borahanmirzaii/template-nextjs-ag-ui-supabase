#!/bin/bash

# Start Local Development Stack
# This script starts all required services for local development

set -e

echo "🚀 Starting Local Development Stack..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if OrbStack/Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker/OrbStack is not running. Please start it first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Checking Supabase status...${NC}"
if ! supabase status > /dev/null 2>&1; then
    echo -e "${BLUE}Starting Supabase locally...${NC}"
    supabase start
else
    echo -e "${GREEN}✅ Supabase is already running${NC}"
fi

echo ""
echo -e "${BLUE}🔴 Starting Redis...${NC}"
if docker ps | grep -q redis-local; then
    echo -e "${GREEN}✅ Redis is already running${NC}"
else
    docker-compose -f docker-compose.local.yml up -d redis
    echo -e "${GREEN}✅ Redis started${NC}"
fi

echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo ""
supabase status | grep -E "(API URL|Studio URL|Database URL)" || true
echo ""
echo -e "${GREEN}Redis:${NC} redis://localhost:6379"
echo ""

echo -e "${GREEN}✅ All services are running!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "  1. Verify storage bucket exists: http://127.0.0.1:54323 → Storage"
echo "  2. Start Next.js dev server: pnpm dev"
echo "  3. Visit: http://localhost:3000"
echo ""

