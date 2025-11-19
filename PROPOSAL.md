# 🚀 Local Development Stack Proposal

## Overview

This proposal outlines a **fully local development stack** for the Next.js Supabase File AI Platform using **OrbStack** (Docker alternative for macOS) and local Supabase instance.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Local Development Stack              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Next.js    │    │   Supabase   │                  │
│  │   App (3000) │◄───│  Local (54321)│                  │
│  └──────────────┘    └──────────────┘                  │
│         │                   │                           │
│         │                   │                           │
│         ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │    Redis     │    │  PostgreSQL  │                  │
│  │  (6379)      │    │  (54322)     │                  │
│  └──────────────┘    └──────────────┘                  │
│                                                         │
│  All services running locally via OrbStack             │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Services
- **Next.js 15** - Frontend/Backend framework
- **Supabase Local** - Auth, Database, Storage (via Docker)
- **PostgreSQL 17** - Database with pgvector extension
- **Redis 7** - Job queue (BullMQ)
- **Google Gemini AI** - AI analysis and embeddings

### Infrastructure
- **OrbStack** - Docker alternative for macOS (faster, lighter)
- **pnpm** - Package manager
- **Supabase CLI** - Local Supabase management

## Service Configuration

### 1. Next.js Application
- **Port**: 3000
- **URL**: http://localhost:3000
- **Environment**: Development
- **Hot Reload**: Enabled

### 2. Supabase Local
- **API URL**: http://127.0.0.1:54321
- **Studio URL**: http://127.0.0.1:54323
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Storage**: S3-compatible local storage
- **Auth**: Local authentication

### 3. Redis
- **Port**: 6379
- **URL**: redis://localhost:6379
- **Purpose**: BullMQ job queue for async file processing

### 4. Google Gemini AI
- **API Key**: Configured in `.env.local`
- **Models**: 
  - gemini-2.0-flash-exp (fast analysis)
  - gemini-1.5-pro-latest (detailed analysis)
  - text-embedding-004 (embeddings)

## Local Development Setup

### Prerequisites
- macOS (for OrbStack)
- Node.js 18+
- OrbStack installed: https://orbstack.dev
- Supabase CLI: `npm install -g supabase`

### Quick Start

```bash
# 1. Start Supabase locally
supabase start

# 2. Start Redis via OrbStack
docker run -d -p 6379:6379 --name redis redis:7-alpine

# 3. Install dependencies
pnpm install

# 4. Configure environment
cp .env.local.example .env.local
# Edit .env.local with local credentials

# 5. Apply migrations
supabase db reset

# 6. Create storage bucket (via Studio UI)
# http://127.0.0.1:54323 → Storage → Create bucket: user-files

# 7. Start development server
pnpm dev
```

## Environment Variables

### Required (.env.local)
```bash
# Supabase Local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDoEIiDueJYRFcZ_3bPj7HgyDTMSdQXoIQ

# Redis (Local)
REDIS_URL=redis://localhost:6379
```

### Optional (for MCP integrations)
```bash
# OAuth credentials for external platforms
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
NOTION_OAUTH_CLIENT_ID=
NOTION_OAUTH_CLIENT_SECRET=
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
```

## OrbStack Configuration

### Why OrbStack?
- **Faster** than Docker Desktop on macOS
- **Lighter** resource usage
- **Better integration** with macOS
- **Compatible** with Docker commands
- **Free** and open-source

### Services Running in OrbStack

1. **Supabase Stack** (via `supabase start`)
   - PostgreSQL 17
   - PostgREST API
   - GoTrue Auth
   - Storage API
   - Realtime
   - Studio UI

2. **Redis** (standalone container)
   - Redis 7 Alpine
   - Port 6379
   - Persistent volume

### OrbStack Commands

```bash
# List running containers
docker ps

# View Supabase containers
docker ps | grep supabase

# View Redis container
docker ps | grep redis

# View logs
docker logs redis
supabase logs

# Stop services
docker stop redis
supabase stop

# Start services
docker start redis
supabase start
```

## Database Schema

### Tables
1. **files** - File metadata and storage paths
2. **analysis** - AI analysis results
3. **knowledge_base** - Vector embeddings for RAG
4. **integrations** - MCP platform connections
5. **mcp_tools** - Available MCP tools

### Extensions
- **pgvector** - Vector similarity search
- **uuid-ossp** - UUID generation

### Storage Buckets
- **user-files** - User uploaded files (private)

## Development Workflow

### 1. Start Services
```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start Redis
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Terminal 3: Start Next.js
pnpm dev
```

### 2. Development Tasks
- **File Upload**: Test drag-and-drop at `/files`
- **AI Analysis**: Upload files and view analysis at `/files/[id]`
- **Knowledge Base**: Chat with files at `/knowledge-base`
- **Integrations**: Connect platforms at `/integrations`

### 3. Database Management
- **Studio UI**: http://127.0.0.1:54323
- **SQL Editor**: Run queries and migrations
- **Table Editor**: View/edit data
- **Storage**: Manage file buckets

### 4. Debugging
- **Next.js Logs**: Terminal running `pnpm dev`
- **Supabase Logs**: `supabase logs`
- **Redis Logs**: `docker logs redis`
- **Browser Console**: DevTools for frontend debugging

## Benefits of Local Stack

### 1. **No External Dependencies**
- Everything runs locally
- No internet required (except for Gemini API)
- Faster development cycles

### 2. **Cost Effective**
- No cloud costs during development
- Free local resources
- Unlimited testing

### 3. **Privacy & Security**
- Data stays local
- No external API calls (except Gemini)
- Full control over environment

### 4. **Performance**
- Low latency (localhost)
- Fast iteration
- No network delays

### 5. **OrbStack Advantages**
- Faster than Docker Desktop
- Better macOS integration
- Lower resource usage
- Seamless Docker compatibility

## Migration Path

### From Cloud to Local
1. Export data from cloud Supabase (if needed)
2. Start local Supabase
3. Run migrations locally
4. Update `.env.local` with local credentials
5. Test all functionality

### From Local to Production
1. Push migrations to cloud: `supabase db push`
2. Update environment variables
3. Deploy to Vercel/Production
4. Verify all features work

## Monitoring & Maintenance

### Health Checks
```bash
# Check Supabase
supabase status

# Check Redis
redis-cli ping

# Check Next.js
curl http://localhost:3000/api/health
```

### Backup Strategy
- **Database**: `supabase db dump` → SQL file
- **Storage**: Copy files from local storage
- **Migrations**: Version controlled in `supabase/migrations/`

### Reset Development Environment
```bash
# Reset database (WARNING: deletes all data)
supabase db reset

# Restart services
supabase stop && supabase start
docker restart redis
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Check: `lsof -ti:3000` or `lsof -ti:54321`
   - Kill: `lsof -ti:3000 | xargs kill -9`

2. **Supabase Not Starting**
   - Check Docker/OrbStack is running
   - Verify ports are available
   - Check logs: `supabase logs`

3. **Redis Connection Failed**
   - Verify Redis container is running: `docker ps`
   - Check port 6379 is available
   - Restart: `docker restart redis`

4. **Database Migrations Failed**
   - Check Supabase Studio for errors
   - Verify pgvector extension is enabled
   - Run migrations manually in SQL Editor

## Next Steps

1. ✅ Configure `.env.local` with Gemini API key
2. ✅ Start Supabase locally
3. ✅ Start Redis via OrbStack
4. ✅ Apply database migrations
5. ✅ Create storage bucket
6. ✅ Start development server
7. ✅ Test all features

## Success Criteria

- [x] All services running locally
- [x] Database migrations applied
- [x] Storage bucket created
- [x] Environment variables configured
- [x] Development server running
- [x] File upload working
- [x] AI analysis working
- [x] Knowledge base chat working

## Conclusion

This fully local development stack provides:
- **Complete isolation** from cloud services
- **Fast development** cycles
- **Cost-effective** development
- **Full control** over environment
- **Easy debugging** and testing

Ready for local development! 🚀

