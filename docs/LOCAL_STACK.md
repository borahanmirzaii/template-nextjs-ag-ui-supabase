# 🏠 Fully Local Development Stack Guide

## Overview

This guide explains how to run the entire application stack **locally** using **OrbStack** (Docker alternative) and **Supabase Local**.

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Local Development Environment           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Next.js App (localhost:3000)                 │
│         │                                       │
│         ├──► Supabase Local (127.0.0.1:54321) │
│         │         ├──► PostgreSQL (54322)       │
│         │         ├──► Storage API              │
│         │         └──► Auth (GoTrue)           │
│         │                                       │
│         └──► Redis (localhost:6379)            │
│                                                 │
│  All services via OrbStack                      │
└─────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
pnpm local:setup

# This will:
# - Install dependencies
# - Start Supabase
# - Apply migrations
# - Start Redis
# - Create .env.local
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start Supabase
supabase start

# 3. Start Redis
pnpm local:start

# 4. Apply migrations (already done if using supabase start)
# Migrations are auto-applied on first start

# 5. Create storage bucket
# Open http://127.0.0.1:54323 → Storage → Create bucket: user-files

# 6. Start dev server
pnpm dev
```

## Service Management

### Start All Services

```bash
pnpm local:start
```

This starts:
- Supabase (if not running)
- Redis container

### Stop All Services

```bash
pnpm local:stop
```

### Check Service Status

```bash
# Supabase status
supabase status

# Redis status
docker ps | grep redis

# All containers
docker ps
```

## Environment Configuration

Your `.env.local` is already configured with:

- ✅ Local Supabase credentials
- ✅ Google Gemini API key
- ✅ Redis URL
- ✅ Application URL

## Storage Bucket Setup

### Via Supabase Studio (Recommended)

1. Open http://127.0.0.1:54323
2. Go to **Storage** → **Buckets**
3. Click **New bucket**
4. Name: `user-files`
5. Public: **No** (unchecked)
6. File size limit: `52428800` (50MB)
7. Click **Create**

### Via SQL (Alternative)

Run in Supabase Studio SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('user-files', 'user-files', false, 52428800)
ON CONFLICT (id) DO NOTHING;
```

## Testing the Stack

### 1. Verify Services

```bash
# Check Supabase
curl http://127.0.0.1:54321/rest/v1/

# Check Redis
redis-cli ping
# Should return: PONG

# Check Next.js (after starting)
curl http://localhost:3000
```

### 2. Test Features

1. **Authentication**
   - Visit http://localhost:3000/login
   - Sign up with email
   - Verify redirect to dashboard

2. **File Upload**
   - Go to http://localhost:3000/files
   - Upload a test file
   - Verify it appears in the list

3. **AI Analysis**
   - Click "View Analysis" on uploaded file
   - Verify analysis runs (requires Gemini API key)

4. **Knowledge Base**
   - Go to http://localhost:3000/knowledge-base
   - Chat with your files
   - Test semantic search

## OrbStack Benefits

### Why OrbStack?

- ⚡ **Faster** than Docker Desktop
- 💾 **Lighter** resource usage
- 🍎 **Better macOS integration**
- 🔄 **Docker-compatible** commands
- 🆓 **Free** and open-source

### OrbStack Commands

```bash
# View containers
docker ps

# View logs
docker logs redis-local
supabase logs

# Restart services
docker restart redis-local
supabase restart
```

## Troubleshooting

### Port Conflicts

```bash
# Check what's using port 3000
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9

# Check Supabase ports
lsof -ti:54321
```

### Supabase Issues

```bash
# Reset Supabase
supabase stop
supabase start

# View logs
supabase logs

# Check status
supabase status
```

### Redis Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Restart Redis
docker restart redis-local

# View logs
docker logs redis-local

# Remove and recreate
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d redis
```

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
supabase db reset

# Check tables exist
# Open http://127.0.0.1:54323 → Table Editor
```

## Development Workflow

### Daily Development

```bash
# Morning: Start services
pnpm local:start

# Start dev server
pnpm dev

# Evening: Stop services (optional)
pnpm local:stop
```

### Database Changes

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db reset

# Or push to remote (if linked)
supabase db push
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# All tests
pnpm test:all
```

## Production Deployment

When ready to deploy:

1. **Push migrations to cloud**
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

2. **Update environment variables**
   - Use cloud Supabase credentials
   - Update OAuth redirect URIs

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

## Resources

- **Supabase Studio**: http://127.0.0.1:54323
- **API Docs**: http://127.0.0.1:54321/rest/v1/
- **OrbStack Docs**: https://docs.orbstack.dev
- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli

## Summary

✅ **Fully Local Stack**
- All services run locally
- No cloud dependencies
- Fast development cycles

✅ **OrbStack Integration**
- Faster than Docker Desktop
- Better macOS experience
- Docker-compatible

✅ **Ready to Develop**
- Environment configured
- Services scripted
- Documentation complete

Start developing: `pnpm dev` 🚀

