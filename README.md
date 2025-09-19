# DeskMate AI - Complete Stack

[![CI Status](https://github.com/yosiwizman/deskmate/actions/workflows/ci.yml/badge.svg)](https://github.com/yosiwizman/deskmate/actions/workflows/ci.yml)
[![Deploy Status](https://github.com/yosiwizman/deskmate/actions/workflows/deploy.yml/badge.svg)](https://github.com/yosiwizman/deskmate/actions/workflows/deploy.yml)
[![Smoke Tests](https://github.com/yosiwizman/deskmate/actions/workflows/smoke.yml/badge.svg)](https://github.com/yosiwizman/deskmate/actions/workflows/smoke.yml)

A complete AI office assistant system with three services: **UI** (Next.js frontend), **Agent** (Express.js API), and **Desktop** (Linux desktop environment). Deploy the full stack on Railway with authentication, file management, task execution, web search, and an embedded desktop environment.

## 🎯 What This Project Is

DeskMate is a complete AI office assistant system with three integrated services:

### 🌐 **UI Service** (Next.js Frontend)
- **Secure Authentication** - Email/password + Google/GitHub via Supabase Auth
- **File Management** - Upload, view, delete files with user-scoped storage & RLS policies
- **Quick Actions** - One-click tasks: Summarize, Draft email, Create checklist, Extract contacts
- **Web Search** - Integrated search with Tavily, Brave, SerpAPI providers
- **Desktop Integration** - Embedded noVNC desktop environment
- **Mobile Responsive** - Touch-friendly interface optimized for all devices
- **Admin Dashboard** - Status monitoring and Railway logs access

### 🤖 **Agent Service** (Express.js + pg-boss)
- **Queue-backed Tasks** - POST /api/tasks enqueues, GET /api/tasks/:id polls status
- **LLM Integration** - Anthropic Claude (fallback offline if no key)
- **CORS & Security** - Helmet, JSON limits, UI-origin CORS, correlationId in logs
- **Scalable** - pg-boss workers, Postgres persistence, containerized

### 🖥️ **Desktop Service** (Linux Webtop)
- **Ubuntu XFCE Desktop** - Browser-accessible via noVNC
- **Pre-installed Tools** - Firefox, LibreOffice, VS Code, qpdf, tesseract
- **Persistent Storage** - User profile and files persist across deployments
- **Password Protected** - Secure desktop access

## 🚀 Quick Start (One-Click Railway Deployment)

### Step 1: Deploy All Three Services

Deploy each service using the one-click Railway buttons below. **Deploy in this order:**

#### 1. 🌐 Deploy UI Service (Core Frontend)
[![Deploy UI on Railway](https://railway.app/button.svg)](https://railway.app/template/new?templateUrl=https://raw.githubusercontent.com/yosiwizman/deskmate/main/railway.ui.json)

#### 2. 🤖 Deploy Agent Service (API Backend)
[![Deploy Agent on Railway](https://railway.app/button.svg)](https://railway.app/template/new?templateUrl=https://raw.githubusercontent.com/yosiwizman/deskmate/main/services/agent/railway.json)

#### 3. 🖥️ Deploy Desktop Service (Linux Environment)
[![Deploy Desktop on Railway](https://railway.app/button.svg)](https://railway.app/template/new?templateUrl=https://raw.githubusercontent.com/yosiwizman/deskmate/main/services/desktop/railway.json)

### Step 2: Connect Services

After all services are deployed:

1. **Copy Agent URL**: Go to your Agent service → Settings → copy the public URL
2. **Update UI**: In your UI service → Variables → set `TASK_API_BASE` to `https://your-agent-url.railway.app` (no trailing slash)
3. **Copy Desktop URL**: Go to your Desktop service → Settings → Enable Public Networking → copy URL  
4. **Update UI**: In your UI service → Variables → set `NEXT_PUBLIC_DESKTOP_URL` to your desktop URL
5. **Redeploy UI**: Trigger a new deployment of the UI service

**Expected URLs:**
- 🌐 UI: `https://deskmate-production.up.railway.app`
- 🤖 Agent: `https://deskmate-agent-production.up.railway.app` 
- 🖥️ Desktop: `https://desk-desktop-production.up.railway.app`

### Step 3: Set Up Supabase Database

1. **Create Supabase project**: Go to https://supabase.com/dashboard → "New project"
2. **Run database migration**:
   - Open **SQL Editor** (left sidebar)
   - Copy entire contents of `/supabase/migrations/20250917192921_deskmate_core.sql`
   - **Click "Run"** to create tables, RLS policies, and storage bucket
3. **Get API credentials**: Go to **Settings → API** and copy:
   - **Project URL** (starts with `https://`)
   - **anon** key (public)
   - **service_role** key (private)

### Step 4: Configure Environment Variables

#### UI Service Variables
Go to your **UI service** → **Variables** tab and set:

```env
# Supabase Configuration (from Step 3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key

# LLM Provider (get from Anthropic, OpenAI, etc.)
PRIMARY_LLM_API_KEY=sk-ant-...your_anthropic_key

# Search Provider (get from Tavily, Brave, etc.)
SEARCH_API_KEY=tvly-...your_tavily_key

# Service URLs (set after deploying Agent and Desktop)
TASK_API_BASE=https://your-agent-service.up.railway.app/api
NEXT_PUBLIC_DESKTOP_URL=https://your-desktop-service.up.railway.app

# Default settings (already configured)
PRIMARY_LLM=anthropic
PRIMARY_LLM_MODEL=claude-3-5-sonnet-20240620
SEARCH_API=tavily
NEXT_PUBLIC_ADMINS=yosiwizman5638@gmail.com
APP_NAME=DeskMate AI
```

#### Agent Service Variables
Go to your **Agent service** → **Variables** tab:

```env
# Postgres (Railway Postgres)
DATABASE_URL=postgresql://user:pass@host:port/db

# LLM Provider
PRIMARY_LLM=anthropic
PRIMARY_LLM_MODEL=claude-3-5-sonnet-20240620
PRIMARY_LLM_API_KEY=sk-ant-... (optional; fallback used if missing)

# CORS
UI_ORIGIN=https://deskmate-production.up.railway.app
```

#### Desktop Service Variables
Go to your **Desktop service** → **Variables** tab:

```env
# Desktop Access (set a strong password)
PASSWORD=your-secure-desktop-password
PUID=1000
PGID=1000
TZ=UTC
```

### Step 5: Test Your Full Stack

1. **Open UI service URL**: `https://deskmate-production.up.railway.app`
2. **Create account**: Go to `/auth` → Sign up with email/password
3. **Test all features**:
   - **Quick Actions**: Click buttons (should show "Started: [action]")
   - **Files**: Go to `/files` → upload a test file
   - **Search**: Try the search functionality
   - **Desktop**: Click "Launch Desktop" → should load Ubuntu XFCE
   - **Admin Badge**: Look for status badge (bottom-right if you're admin)

### Step 6: Optional CI/CD Setup

PowerShell quick deploy for Agent and UI wiring:

```powershell
# 1) Link Railway project
npm i -g @railway/cli
railway login --browserless --token "$env:RAILWAY_TOKEN"
railway link --project 22dac265-ded4-4ece-9d74-66e847077195

# 2) Deploy Agent from services/agent
cd services/agent
railway up --service deskmate-agent --detach

# 3) Configure Agent variables (set in dashboard or via env)
# DATABASE_URL, PRIMARY_LLM, PRIMARY_LLM_MODEL, PRIMARY_LLM_API_KEY, UI_ORIGIN

# 4) Get Agent public URL
$agentUrl = (railway domain --service deskmate-agent | Select-String https:// | Select-Object -First 1).ToString().Trim()

# 5) Wire UI → Agent
cd ../..
railway variables --service deskmate-ui --set "TASK_API_BASE=$agentUrl"
railway up --service deskmate-ui --detach

# 6) Smoke
Invoke-WebRequest "$agentUrl/healthz"
```

For automated deployments, add these **GitHub repository secrets**:

- `RAILWAY_TOKEN` - Your Railway API token
- `RAILWAY_PROJECT_ID` - Your Railway project ID

Then use:
- **Manual deploy**: GitHub → Actions → "Deploy to Railway" → "Run workflow"
- **Tag deploy**: `git tag deskmate-v1.0.0 && git push origin deskmate-v1.0.0`
- **Smoke tests**: GitHub → Actions → "Smoke Tests" → "Run workflow"

## 🛠️ Development (Windows PowerShell)

```powershell
# Install dependencies
npm ci

# Build and validate
npm --prefix packages/ui run build
npm --prefix packages/ui run typecheck
npm --prefix packages/ui run lint

# Start development server
npm --prefix packages/ui run dev

# Run smoke tests
npm --prefix packages/ui run test:smoke
```

## 🧪 CI/CD

This repo includes GitHub Actions for CI:

- Build (Next.js)
- Typecheck (tsc --noEmit)
- Lint (eslint .)
- Smoke (optional) — verifies deployed services if Railway secrets are configured

Add these repository secrets before running deploy/smoke:

- RAILWAY_TOKEN
- RAILWAY_PROJECT_ID

You can trigger Deployment workflow from Actions → Deploy to Railway.

## 🔧 Troubleshooting

### ❌ "Invalid credentials" or auth errors
- **Check**: Supabase URL and keys are correct in Railway variables
- **Fix**: Copy fresh keys from Supabase Settings → API
- **Verify**: No extra spaces or quotes in environment variables

### ❌ Files page shows 401 Unauthorized  
- **Good**: This means auth gate is working correctly
- **Fix**: Sign up/login first, then revisit `/files`

### ❌ Search returns empty results
- **Check**: `SEARCH_API_KEY` is set in Railway variables  
- **Note**: App gracefully handles missing search keys (shows empty results)

### ❌ Quick Actions show "Service not configured"
- **Check**: `TASK_API_BASE` points to your running agent service
- **Format**: Should be `https://your-service.railway.app/api` (no trailing slash)

### ❌ Admin status badge not visible
- **Check**: Your email matches `NEXT_PUBLIC_ADMINS` exactly
- **Note**: Badge only shows for logged-in admin users

## 📊 CI/CD Status

The project includes automated workflows:

- **CI Pipeline**: Build → TypeCheck → Lint → Smoke Test
- **Deploy Pipeline**: Manual trigger or version tag push
- **Status**: Check badges at top of README

## 🏗️ Architecture

```
🏠 DeskMate Full Stack
├── 🌐 UI Service (Next.js)         # Frontend at project root
│   ├── packages/ui/
│   │   ├── app/
│   │   │   ├── (components)/      # React components
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   ├── DesktopFrame.tsx
│   │   │   │   └── AdminStatus.tsx
│   │   │   ├── api/               # API Routes
│   │   │   │   ├── health/        # Health endpoint
│   │   │   │   ├── search/        # Web search proxy
│   │   │   │   ├── files/         # File management
│   │   │   │   └── tasks/         # Agent proxy
│   │   │   ├── auth/              # Auth pages
│   │   │   ├── files/             # File UI
│   │   │   └── desktop/           # Desktop embed
│   │   └── lib/
│   │       ├── supabase.ts    # Auth & DB client
│   │       └── contracts/     # TypeScript schemas
│   └── Dockerfile             # UI container
│
├── 🤖 Agent Service (Express.js)  # API backend
│   └── services/agent/
│       ├── server.js          # Express API server
│       ├── package.json       # Node.js deps
│       └── Dockerfile         # Agent container
│
├── 🖥️ Desktop Service (Ubuntu)    # Linux environment
│   └── services/desktop/
│       └── Dockerfile         # Webtop + tools
│
├── 📊 Database (Supabase)         # Postgres + Auth + Storage
│   └── supabase/migrations/   # Schema + RLS policies
│
└── ⚙️ CI/CD (GitHub Actions)      # Automated workflows
    └── .github/workflows/
        ├── ci.yml             # Build + test + lint
        ├── deploy.yml         # Railway deployment
        └── smoke.yml          # End-to-end tests
```

## 🌐 API Endpoints

### UI Service (deskmate-production.up.railway.app)
- `GET /api/health` - Service health check
- `POST /api/search` - Web search with multiple providers (Tavily, Brave, SerpAPI)
- `GET|POST|DELETE /api/files` - File management with Supabase storage (auth required)
- `POST /api/tasks` - Task execution proxy to Agent service (auth required)
- `GET /auth` - Authentication pages (Supabase Auth)
- `GET /files` - File management interface
- `GET /desktop` - Embedded desktop environment

### Agent Service (deskmate-agent-production.up.railway.app)
- `GET /healthz` - Health check ({ ok: true })
- `POST /api/tasks` - Enqueue a task `{ kind: string, payload?: any }`
- `GET /api/tasks/:id` - Poll status `{ id, status, result?, error? }`

### Desktop Service (desk-desktop-production.up.railway.app)
- `GET /` - noVNC web interface to Ubuntu XFCE desktop
- Pre-installed: Firefox, LibreOffice, VS Code, qpdf, tesseract

## 🔐 Security Features

- **Row Level Security**: Users can only access their own data
- **API Authentication**: All endpoints require valid Supabase session
- **Environment Isolation**: Server secrets never exposed to client
- **CORS Protection**: API routes validate request origins

## 📱 Mobile Support

Fully responsive design with:
- Touch-friendly buttons and navigation
- Viewport-optimized layouts
- Screenshot lightbox for full-screen viewing
- Responsive desktop canvas scaling
- No horizontal scroll on mobile devices

---

**🎉 Your DeskMate AI frontend is ready! For support, check the troubleshooting section above.**
