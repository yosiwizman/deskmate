# DeskMate AI - Frontend UI

[![CI Status](https://github.com/yosiwizman/deskmate/actions/workflows/ci.yml/badge.svg)](https://github.com/yosiwizman/deskmate/actions/workflows/ci.yml)
[![Deploy Status](https://github.com/yosiwizman/deskmate/actions/workflows/deploy.yml/badge.svg)](https://github.com/yosiwizman/deskmate/actions/workflows/deploy.yml)

A Next.js-based frontend for the DeskMate AI office assistant system. This UI provides authentication, file management, task execution, and web search capabilities with a mobile-responsive design.

## 🎯 What This Project Is

DeskMate UI is the web frontend that connects to your AI agent and desktop backend services. It provides:

- **Secure Authentication** - Email/password signup and login via Supabase Auth
- **File Management** - Upload, view, and delete files with user-scoped access
- **Quick Actions** - One-click task execution (Summarize, Draft email, Create checklist, Extract contacts)
- **Web Search** - Integrated search with multiple providers (Tavily, Brave, SerpAPI)
- **Mobile Responsive** - Touch-friendly interface optimized for all devices
- **Admin Dashboard** - Status monitoring and Railway logs access for administrators

## 🚀 Quick Start (Non-Technical Setup)

### Step 1: Set Up Supabase Database

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Open SQL Editor** (left sidebar)
3. **Copy and paste** the entire contents of `/supabase/migrations/[timestamp]_deskmate_core.sql`
4. **Click "Run"** to create all tables and security policies
5. **Go to Settings → API** and copy:
   - Project URL (starts with `https://`)
   - `anon` key (public)
   - `service_role` key (private)

### Step 2: Configure Railway Service

1. **Open Railway Dashboard**: https://railway.app/dashboard
2. **Find your `deskmate-ui` service**
3. **Go to Variables tab** and set these values:

```env
# Paste your Supabase values here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key

# Paste your API provider keys
PRIMARY_LLM_API_KEY=sk-ant-...your_anthropic_key
SEARCH_API_KEY=tvly-...your_tavily_key

# Connect to your task backend
TASK_API_BASE=https://your-agent-service.up.railway.app/api

# These should already be set correctly
PRIMARY_LLM=anthropic
PRIMARY_LLM_MODEL=claude-3-5-sonnet-20240620
SEARCH_API=tavily
NEXT_PUBLIC_ADMINS=yosiwizman5638@gmail.com
APP_NAME=DeskMate AI
```

### Step 3: Deploy

1. **Trigger deployment**: Go to GitHub → Actions → "Deploy to Railway" → "Run workflow"
2. **Or push a tag**: `git tag deskmate-ui-v1.0.0 && git push origin deskmate-ui-v1.0.0`
3. **Wait 2-3 minutes** for deployment to complete

### Step 4: Test Your Application

1. **Open your Railway URL** (provided after deployment)
2. **Go to `/auth`** to create your account
3. **Use your admin email**: `yosiwizman5638@gmail.com`
4. **Test features**:
   - Click Quick Action buttons (should show "Started: [action]")
   - Go to `/files` page (should load empty list)
   - Try search functionality
   - Look for admin status badge in bottom-right corner

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
packages/ui/                    # Next.js Application
├── app/
│   ├── (components)/          # React Components
│   ├── api/                   # API Routes
│   │   ├── health/           # Health check endpoint
│   │   ├── search/           # Web search proxy
│   │   ├── files/            # File management
│   │   └── tasks/            # Task proxy with retry
│   ├── auth/                 # Authentication pages
│   ├── files/                # File management UI
│   └── globals.css           # Responsive styles
├── lib/
│   ├── contracts/           # TypeScript schemas
│   ├── supabase.ts         # Browser client
│   ├── supabase-server.ts  # Server client  
│   └── retry.ts            # Retry logic
└── scripts/
    └── smoke.cjs           # Health check tests

supabase/migrations/        # Database schema
.github/workflows/         # CI/CD pipelines
```

## 🌐 API Endpoints

- `GET /api/health` - Service health check
- `POST /api/search` - Web search with multiple providers  
- `GET|POST|DELETE /api/files` - File management (auth required)
- `POST /api/tasks` - Task execution proxy (auth required)

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
