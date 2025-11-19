#!/bin/bash

# Stop Local Development Stack

set -e

echo "🛑 Stopping Local Development Stack..."
echo ""

# Stop Redis
if docker ps | grep -q redis-local; then
    echo "Stopping Redis..."
    docker-compose -f docker-compose.local.yml stop redis
    echo "✅ Redis stopped"
else
    echo "Redis is not running"
fi

echo ""
echo "Stopping Supabase..."
supabase stop

echo ""
echo "✅ All services stopped"

