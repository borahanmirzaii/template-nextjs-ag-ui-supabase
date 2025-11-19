# 🔗 End-to-End Testing URLs

## 🎯 Main Application URLs

### Application
- **Homepage**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Files Page**: http://localhost:3000/files
- **Knowledge Base**: http://localhost:3000/knowledge-base
- **Integrations**: http://localhost:3000/integrations

## 🗄️ Supabase Local Services

### Supabase Studio (Database Management)
- **Studio UI**: http://127.0.0.1:54323
- **API Endpoint**: http://127.0.0.1:54321
- **GraphQL**: http://127.0.0.1:54321/graphql/v1
- **Storage API**: http://127.0.0.1:54321/storage/v1
- **Mailpit (Email)**: http://127.0.0.1:54324

### Database Tables (via Studio)
- **Table Editor**: http://127.0.0.1:54323/project/default/editor
- **SQL Editor**: http://127.0.0.1:54323/project/default/sql
- **Storage Buckets**: http://127.0.0.1:54323/project/default/storage/buckets
- **Authentication**: http://127.0.0.1:54323/project/default/auth/users

## 🧪 Testing Checklist

### 1. Verify Services Are Running

```bash
# Check Supabase
curl http://127.0.0.1:54321/rest/v1/

# Check Next.js
curl http://localhost:3000

# Check Redis
redis-cli ping
```

### 2. Test Authentication Flow

1. **Sign Up**: http://localhost:3000/login
   - Enter email and password
   - Check email in Mailpit: http://127.0.0.1:54324
   - Verify redirect to dashboard

2. **Verify User Created**: http://127.0.0.1:54323/project/default/auth/users
   - Should see your new user

### 3. Test File Upload

1. **Upload Page**: http://localhost:3000/files
2. Drag & drop a file (PDF, DOCX, TXT, etc.)
3. **Verify in Storage**: http://127.0.0.1:54323/project/default/storage/buckets/user-files
4. **Verify in Database**: http://127.0.0.1:54323/project/default/editor
   - Check `files` table

### 4. Test AI Analysis

1. **File Analysis**: http://localhost:3000/files/[file-id]
   - Replace `[file-id]` with actual file ID from files table
2. Verify analysis runs (requires Gemini API key)
3. **Check Analysis Table**: http://127.0.0.1:54323/project/default/editor
   - Check `analysis` table for results

### 5. Test Knowledge Base

1. **Knowledge Base Chat**: http://localhost:3000/knowledge-base
2. Switch to "AI Chat" tab
3. Ask questions about uploaded files
4. **Verify Embeddings**: http://127.0.0.1:54323/project/default/editor
   - Check `knowledge_base` table

### 6. Test Semantic Search

1. **Semantic Search**: http://localhost:3000/knowledge-base
2. Switch to "Search" tab
3. Enter search query
4. Verify results with similarity scores

### 7. Test Integrations (Optional)

1. **Integrations Page**: http://localhost:3000/integrations
2. View available platforms
3. Connect platforms (requires OAuth setup)

## 🔍 Database Verification URLs

### Check Tables Exist
- **Table Editor**: http://127.0.0.1:54323/project/default/editor
- Should see: `files`, `analysis`, `knowledge_base`, `integrations`, `mcp_tools`

### Check Extensions
- **SQL Editor**: http://127.0.0.1:54323/project/default/sql
- Run: `SELECT * FROM pg_extension WHERE extname = 'vector';`

### Check Storage Bucket
- **Storage**: http://127.0.0.1:54323/project/default/storage/buckets
- Should see: `user-files` bucket

## 📊 API Endpoints

### Supabase REST API
- **Base URL**: http://127.0.0.1:54321/rest/v1/
- **Files**: http://127.0.0.1:54321/rest/v1/files
- **Analysis**: http://127.0.0.1:54321/rest/v1/analysis
- **Knowledge Base**: http://127.0.0.1:54321/rest/v1/knowledge_base

### Next.js API Routes
- **Upload**: http://localhost:3000/api/upload
- **Chat**: http://localhost:3000/api/chat
- **Knowledge Search**: http://localhost:3000/api/knowledge/search
- **MCP**: http://localhost:3000/api/mcp/[platform]

## 🐛 Debugging URLs

### Service Logs
- **Supabase Logs**: Run `supabase logs` in terminal
- **Redis Logs**: Run `docker logs redis-local` in terminal
- **Next.js Logs**: Check terminal running `pnpm dev`

### Health Checks
- **Supabase Health**: http://127.0.0.1:54321/rest/v1/
- **Next.js Health**: http://localhost:3000/api/health (if implemented)

## ✅ Success Indicators

### All Services Running
- ✅ Supabase Studio accessible
- ✅ Next.js app loads
- ✅ Can sign up/login
- ✅ Can upload files
- ✅ Files appear in storage
- ✅ AI analysis works
- ✅ Knowledge base chat works

### Database Healthy
- ✅ All 5 tables exist
- ✅ pgvector extension enabled
- ✅ Storage bucket created
- ✅ RLS policies active

## 🚀 Quick Test Flow

1. **Sign Up**: http://localhost:3000/login
2. **Upload File**: http://localhost:3000/files
3. **View Analysis**: http://localhost:3000/files/[id]
4. **Chat with Files**: http://localhost:3000/knowledge-base
5. **Check Database**: http://127.0.0.1:54323/project/default/editor

---

**All URLs are ready for end-to-end testing!** 🎉

