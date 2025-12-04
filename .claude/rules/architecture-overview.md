# Architecture Overview - Complete Guide

## 🏛️ SYSTEM ARCHITECTURE

Review Leads is a **B2B lead generation platform** built with modern cloud architecture:

### Core Components

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    API Layer     │────▶│   Databases     │
│  (React/Vite)   │     │   (Express.js)   │     │ CloudSQL + FB   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         │
         │              ┌──────────────────┐              │
         └─────────────▶│  Cloud Services  │◀─────────────┘
                        │  Tasks/Functions │
                        └──────────────────┘
```

## 📁 PROJECT STRUCTURE

```
review-leads/
├── main/                       # Core application
│   ├── api/                    # Backend API server
│   │   ├── app.js             # Express app & endpoints
│   │   ├── cloudsql.js        # Database connection pool
│   │   ├── firestore.js       # Firebase operations
│   │   ├── enrichment/        # Data enrichment system
│   │   ├── emailVerification/ # Email verification
│   │   ├── functions/         # Cloud Functions
│   │   └── test/              # Test suites
│   │
│   └── frontend/              # React frontend
│       ├── src/
│       │   ├── components/    # UI components
│       │   ├── pages/         # Page components
│       │   ├── hooks/         # React hooks
│       │   └── services/      # API clients
│       └── dist/              # Built assets
│
├── .claude/                   # AI documentation
│   └── rules/                 # Pattern guides
│
└── package.json              # Monorepo scripts
```

## 🚀 DEPLOYMENT ARCHITECTURE

### Development Environment
- **Local API**: Port 8080
- **Local Frontend**: Port 5173

### Production Environment
- **Frontend**: Firebase Hosting (CDN)
- **API**: Cloud Run (containerized)
- **Functions**: Cloud Functions (serverless)
- **Background Jobs**: Cloud Tasks queues

## 💾 DATA ARCHITECTURE

### Dual Database Strategy

1. **Cloud SQL (PostgreSQL + PostGIS)**
   - Business listings (~15M records)
   - Competitor relationships
   - Email/phone/website data
   - Review counts & ratings
   - Geospatial queries

2. **Firestore (NoSQL)**
   - User authentication
   - Group management
   - Search history
   - Real-time updates
   - API keys & settings

### Data Flow

```
User Search → API → Cloud SQL Query → Results
     ↓                    ↓
  Firestore           Cloud Tasks
  (History)          (Enrichment)
```

## 🔄 CORE WORKFLOWS

### 1. Search & Count
```
Frontend → POST /count-businesses-by-search → Cloud SQL → Count with filters
```

### 2. Competitor Analysis
```
Frontend → POST /competitor-search → processCompetitorsWithCache → Results
                                            ↓
                                    Batch processing with
                                    geospatial queries
```

### 3. Data Enrichment
```
User triggers → Create job → Queue tasks → Process websites → Store results
                                ↓
                          Cloud Tasks
                          (Distributed)
```

### 4. Email Verification
```
Bulk upload → Parse emails → Queue verification → Million Verifier API → Update DB
```

## 🛡️ SECURITY LAYERS

1. **Authentication**: Firebase Auth (JWT tokens)
2. **Authorization**: Group-based permissions
3. **API Security**: 
   - Bearer token required
   - User ID validation
   - Group membership checks
4. **Data Validation**: express-validator on all inputs

## 📊 SCALABILITY DESIGN

### Horizontal Scaling
- **Cloud Run**: Auto-scales API instances
- **Cloud Tasks**: Distributes work across workers
- **Connection Pooling**: Efficient DB usage

### Performance Optimizations
- **Database Indexes**: Optimized for common queries
- **Caching**: Search results & competitor data
- **Batch Processing**: Bulk operations
- **Lazy Loading**: On-demand data fetching

## 🔧 KEY TECHNOLOGIES

### Backend
- Node.js 22.15+
- Express.js
- PostgreSQL + PostGIS
- Firebase Admin SDK
- Google Cloud SDK

### Frontend
- Node.js 22.15+
- React 18
- Vite
- Material-UI
- Firebase Client SDK
- React Router

### Infrastructure
- Google Cloud Platform
- Cloud SQL
- Cloud Run
- Cloud Tasks
- Cloud Functions
- Firebase (Auth, Firestore, Hosting)

## 📋 ENVIRONMENT VARIABLES

### Automatic Loading with direnv

**CRITICAL**: This project uses **`direnv`** for automatic environment variable loading!

- **All environment variables are loaded automatically** - NO manual loading required
- **direnv handles all .env files** - You don't need to worry about loading them
- **Just run your commands normally** - Environment variables are already available

### File Locations

Environment files are automatically loaded by direnv:

**Backend API:**
- `/main/api/.env.dev` - Development environment variables (auto-loaded by direnv)
- `/main/api/.env.live` - Production environment variables (auto-loaded by direnv)

**Frontend:**
- `/main/frontend/.env.dev` - Development environment variables (symlink, auto-loaded by direnv)
- `/main/frontend/.env.live` - Production environment variables (symlink, auto-loaded by direnv)

### Critical Variables

Backend deployment requires:
```
CLOUD_SQL_INSTANCE_NAME    # Cloud SQL instance
CLOUD_SQL_DB_NAME          # Database name
CLOUD_SQL_PASSWORD         # DB password
CLOUD_TASKS_PROJECT        # GCP project
CLOUD_TASKS_LOCATION       # Queue location
CLOUD_TASKS_QUEUE          # Queue name
FIREBASE_PROJECT_ID        # Firebase project
```

Frontend requires:
```
VITE_API_URL                        # Backend API endpoint
VITE_FIREBASE_API_KEY               # Firebase API key
VITE_FIREBASE_AUTH_DOMAIN           # Firebase auth domain
VITE_FIREBASE_PROJECT_ID            # Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET        # Firebase storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID   # Firebase messaging sender ID
VITE_FIREBASE_DATABASE_URL          # Firebase database URL
VITE_FIREBASE_APP_ID                # Firebase app ID
VITE_FIREBASE_MEASUREMENT_ID        # Firebase measurement ID
```

## 🎯 ARCHITECTURAL PRINCIPLES

1. **Separation of Concerns**
   - API handles business logic
   - Frontend handles presentation
   - Queues handle async work

2. **Scalability First**
   - Stateless API design
   - Queue-based processing
   - Connection pooling

3. **Data Integrity**
   - PostgreSQL for consistency
   - Firestore for real-time
   - Proper transactions

4. **Security by Design**
   - Auth at every layer
   - Validated inputs
   - Least privilege access