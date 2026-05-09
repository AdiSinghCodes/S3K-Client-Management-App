# S3K — Client Governance CRM + Project Tracking Platform
## Technical Architecture & Implementation Document

- **Version**: 1.0
- **Created**: April 2026
- **Last Updated**: April 2026
- **Classification**: Internal Engineering
- **Roles in Scope**: Senior Management (Super Admin), Team / Intern

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Application Structure](#4-application-structure)
5. [Data Flow Architecture](#5-data-flow-architecture)
6. [Database Design](#6-database-design)
7. [API Design](#7-api-design)
8. [Role-Based Access Control](#8-role-based-access-control)
9. [Deployment Strategy](#9-deployment-strategy)
10. [Environment Configuration](#10-environment-configuration)
11. [Development Phases](#11-development-phases)

---

## 1. Executive Summary

### 1.1 Project Goal

Build a production-grade, multi-role internal platform for S3K that:
- Replaces all scattered Excel workbooks with a single centralized web application
- Gives the Senior Management full real-time visibility into company health, client status, revenue, and team productivity
- Allows Team / Interns to manage client deliverables, update AI use cases, submit weekly reports, and track training
- Enforces strict role-based access so each user only sees what they are permitted to see
- Scales cleanly from one client (Tekman India) to many clients without architectural rework

### 1.2 Key Requirements

| Area | Requirement |
|------|-------------|
| **Frontend** | React.js + Vite + Tailwind CSS + ShadCN UI |
| **Backend** | Node.js + Express.js (REST API) |
| **Database** | PostgreSQL |
| **Authentication** | JWT + bcrypt + Role-Based Access Control |
| **Charts** | Recharts |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render / Railway |
| **Database Hosting** | Neon PostgreSQL / Supabase PostgreSQL |

### 1.3 What This Replaces (Excel → Platform)

| Excel Sheet | Platform Module / Page |
|-------------|------------------------|
| Summary (Client Info) | Company CRM Page |
| Sales | Company CRM → Sales tab |
| AI Usecases Tracker | AI Usecases Tracker Page |
| AI Training Tracker | AI Training Tracker Page |
| Weekly Email Report | Weekly Report Page |
| Monthly Exec Review | Monthly Executive Review Page |
| Cost Tracker | Cost Tracker Page |
| *(New)* | Dashboard, Team Productivity Page |

### 1.4 User Roles

| Role | Access Level |
|------|-------------|
| **Senior Management** | Full access — all companies, all modules, all financial data, all team data |
| **Team / Intern** | Restricted — only assigned clients, no financial data, no user management |

> Note: There is no client-facing login in this version. Only two internal roles.

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    React.js Frontend (Vite + Tailwind + ShadCN)          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │   │
│  │  │Dashboard │ │ Company  │ │Usecases  │ │ Training │ │ Weekly   │      │   │
│  │  │          │ │   CRM    │ │ Tracker  │ │ Tracker  │ │  Report  │      │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                                 │   │
│  │  │  Exec    │ │  Cost    │ │   Team   │                                 │   │
│  │  │  Review  │ │ Tracker  │ │Productiv.│                                 │   │
│  │  └──────────┘ └──────────┘ └──────────┘                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ REST API calls via Axios (HTTPS)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       Node.js + Express.js Backend                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │   │
│  │  │  Auth API  │  │Companies   │  │ Projects & │  │ Reports, Costs │    │   │
│  │  │ JWT + RBAC │  │& Users API │  │Usecases API│  │& Productivity  │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ SQL Queries (via pg / Prisma)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     PostgreSQL Database                                   │   │
│  │  users · companies · projects · use_cases · trainings                    │   │
│  │  weekly_reports · monthly_reviews · costs · productivity_logs            │   │
│  │  company_team_members                                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Deployment Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                 SENIOR MANAGEMENT / TEAM LOGIN                          │
│               (Browser — Chrome / Safari / Mobile)                               │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE NETWORK                                      │
│                  React.js App (Static + SPA via Vite)                            │
│                         app.s3ktech.com                                          │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │ REST API calls
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Render / Railway)                                 │
│                    Node.js + Express — api.s3ktech.com                           │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                  DATABASE (Neon PostgreSQL / Supabase)                           │
│                        Managed PostgreSQL — Port 5432                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React.js | 18+ | Component-based SPA |
| **Build Tool** | Vite | 5+ | Fast local dev + production build |
| **Language** | JavaScript (JSX) | ES2022+ | Application code |
| **Styling** | Tailwind CSS | 3+ | Utility-first styling |
| **Components** | ShadCN UI | latest | Accessible component library |
| **Charts** | Recharts | 2+ | All dashboard graphs and analytics |
| **Routing** | React Router | 6+ | Client-side navigation |
| **HTTP Client** | Axios | 1+ | All REST API calls |
| **State** | React Context / useState | built-in | Auth state, user role, page state |

### 3.2 Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 20 LTS | Server runtime |
| **Framework** | Express.js | 4+ | REST API framework |
| **Language** | JavaScript | ES2022+ | Server code |
| **Database Driver** | pg (node-postgres) | 8+ | PostgreSQL connection |
| **Authentication** | jsonwebtoken | 9+ | JWT creation and verification |
| **Password Hashing** | bcrypt | 5+ | Secure password storage |
| **Validation** | express-validator / Joi | - | Request validation |
| **CORS** | cors | 2+ | Cross-origin API access |
| **Environment** | dotenv | 16+ | Environment variable management |

### 3.3 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend Hosting** | Vercel | SPA hosting, instant deploys, preview URLs |
| **Backend Hosting** | Render / Railway | Node.js server, always-on free tier |
| **Database Hosting** | Neon / Supabase | Managed PostgreSQL, free tier available |
| **Version Control** | GitHub | Source control, CI/CD triggers |
| **Local Database** | Docker (postgres:15) | Local development parity |

---

## 4. Application Structure

### 4.1 Frontend Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND STRUCTURE                               │
└──────────────────────────────────────────────────────────────────────────────┘

client/
├── index.html                          # Vite entry point
├── vite.config.js                      # Vite configuration
├── tailwind.config.js
├── package.json
│
└── src/
    │
    ├── main.jsx                        # React app root
    ├── App.jsx                         # Router setup + protected routes
    │
    ├── pages/                          # One file per page/module
    │   ├── Login.jsx                   # Login form (email + password)
    │   ├── Dashboard.jsx               # Senior Management or Team dashboard
    │   ├── CompanyCRM.jsx              # Company master + sales tab
    │   ├── AIUsecasesTracker.jsx       # Use case phase + UAT + go-live
    │   ├── AITrainingTracker.jsx       # Training sessions + status
    │   ├── WeeklyReport.jsx            # Weekly email report log
    │   ├── MonthlyExecReview.jsx       # MOM + action items
    │   ├── CostTracker.jsx             # Revenue, costs, GM%
    │   └── TeamProductivity.jsx        # Monthly team scores
    │
    ├── components/                     # Reusable UI pieces
    │   ├── ui/                         # ShadCN base components
    │   ├── layout/
    │   │   ├── Sidebar.jsx             # Role-aware navigation sidebar
    │   │   ├── Topbar.jsx              # Header with user info + logout
    │   │   └── AppLayout.jsx           # Wraps all protected pages
    │   ├── charts/
    │   │   ├── RevenueChart.jsx        # Recharts line/bar chart
    │   │   ├── GrossMarginChart.jsx
    │   │   └── ProjectProgressChart.jsx
    │   └── common/
    │       ├── StatusBadge.jsx         # Colored status pill (In Progress, Done, etc.)
    │       ├── DataTable.jsx           # Reusable sortable table
    │       └── ConfirmModal.jsx        # Delete confirmation dialog
    │
    ├── services/                       # All Axios API call functions
    │   ├── auth.service.js             # login(), getMe()
    │   ├── company.service.js          # getCompanies(), createCompany(), etc.
    │   ├── project.service.js
    │   ├── usecase.service.js
    │   ├── training.service.js
    │   ├── report.service.js
    │   ├── review.service.js
    │   ├── cost.service.js
    │   └── productivity.service.js
    │
    ├── hooks/                          # Custom React hooks
    │   ├── useAuth.js                  # Read auth state from context
    │   └── useRole.js                  # Check role (senior_management / team)
    │
    ├── context/
    │   └── AuthContext.jsx             # JWT token + user role stored here
    │
    ├── layouts/
    │   └── ProtectedRoute.jsx          # Redirect to login if not authenticated
    │
    └── utils/
        ├── axiosInstance.js            # Axios with base URL + JWT header attached
        └── formatters.js              # Date, currency, % formatters
```

### 4.2 Backend Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS BACKEND STRUCTURE                              │
└──────────────────────────────────────────────────────────────────────────────┘

server/
├── package.json
├── .env                                # Environment variables (not committed)
├── .env.example                        # Template for new developers
│
└── src/
    │
    ├── index.js                        # Server entry point — starts Express on PORT
    ├── app.js                          # Express setup: middleware, routes, CORS
    │
    ├── config/
    │   └── db.js                       # PostgreSQL pool connection
    │
    ├── routes/                         # Route definitions (URL → controller)
    │   ├── auth.routes.js              # /auth/login, /auth/me
    │   ├── company.routes.js           # /companies (CRUD)
    │   ├── project.routes.js           # /projects
    │   ├── usecase.routes.js           # /usecases
    │   ├── training.routes.js          # /trainings
    │   ├── report.routes.js            # /weekly-reports
    │   ├── review.routes.js            # /monthly-reviews
    │   ├── cost.routes.js              # /costs
    │   └── productivity.routes.js      # /productivity
    │
    ├── controllers/                    # Request handlers — one per route file
    │   ├── auth.controller.js
    │   ├── company.controller.js
    │   ├── project.controller.js
    │   ├── usecase.controller.js
    │   ├── training.controller.js
    │   ├── report.controller.js
    │   ├── review.controller.js
    │   ├── cost.controller.js
    │   └── productivity.controller.js
    │
    ├── middleware/
    │   ├── auth.middleware.js          # Verifies JWT token on every protected route
    │   ├── role.middleware.js          # Checks if user role = 'senior_management' for restricted routes
    │   └── error.middleware.js         # Global error handler
    │
    ├── models/                         # Raw SQL query functions
    │   ├── user.model.js               # findByEmail(), createUser()
    │   ├── company.model.js
    │   ├── project.model.js
    │   ├── usecase.model.js
    │   ├── training.model.js
    │   ├── report.model.js
    │   ├── review.model.js
    │   ├── cost.model.js
    │   └── productivity.model.js
    │
    └── utils/
        ├── jwt.js                      # signToken(), verifyToken()
        └── response.js                 # Standard success/error response helpers
```

---

## 5. Data Flow Architecture

### 5.1 Login + Role Routing Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          LOGIN + ROLE ROUTING FLOW                            │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │    User     │
    │  opens app  │
    └──────┬──────┘
           │ visits /login
           ▼
    ┌─────────────┐     Enters email       ┌──────────────┐
    │  Login Page │──── + password ───────▶│  POST        │
    │  (React)    │                        │  /auth/login │
    └─────────────┘                        └──────┬───────┘
                                                  │
                                    ┌─────────────┴──────────────┐
                                    ▼                            ▼
                             ┌────────────┐              ┌────────────┐
                             │  bcrypt    │              │  JWT Token │
                             │  verify    │              │  created   │
                             │  password  │              │  with role │
                             └────────────┘              └─────┬──────┘
                                                               │ Token sent to frontend
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │  AuthContext stores   │
                                                    │  token + role        │
                                                    └──────────┬───────────┘
                                                               │
                                             ┌─────────────────┴──────────────┐
                                             ▼                                ▼
                                    ┌──────────────┐                ┌──────────────┐
                          │ Senior Mgmt  │                │    Team /    │
                                    │  Dashboard   │                │Intern Dashbd │
                                    └──────────────┘                └──────────────┘
```

### 5.2 Standard CRUD Data Flow (e.g. Update a Use Case)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        STANDARD CRUD DATA FLOW                                │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐   User edits      ┌──────────────┐
    │  React Page │── a field + ─────▶│  Axios PUT   │
    │ (Usecases)  │   clicks Save     │  /usecases/  │
    └─────────────┘                   │     :id      │
                                      └──────┬───────┘
                                             │ HTTPS + JWT in header
                                             ▼
                                      ┌──────────────┐
                                      │  Auth        │
                                      │  Middleware  │◀── Verifies JWT token
                                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  Controller  │
                                      │  (Express)   │
                                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  Model       │
                                      │  (SQL query) │
                                      └──────┬───────┘
                                             │ UPDATE use_cases SET ...
                                             ▼
                                      ┌──────────────┐
                                      │  PostgreSQL  │
                                      │  Database    │
                                      └──────┬───────┘
                                             │ Updated row
                                             ▼
                                      ┌──────────────┐
                                      │  JSON        │
                                      │  Response    │──▶ React updates UI
                                      └──────────────┘
```

### 5.3 Senior Management Dashboard Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   SENIOR MANAGEMENT DASHBOARD FLOW                        │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐   Page loads      ┌──────────────────────────────────────┐
    │ Senior Mgmt  │──────────────────▶│  Parallel Axios GET calls:           │
    │  Dashboard  │                   │  GET /companies                      │
    └─────────────┘                   │  GET /costs                          │
                                      │  GET /projects                       │
                                      │  GET /productivity                   │
                                      └──────────────────┬───────────────────┘
                                                         │
                                                         ▼
                                               ┌──────────────────┐
                                               │  Backend fetches │
                                               │  all companies   │
                                               │  (no filter —    │
                                               │ senior_mgmt role │
                                               └────────┬─────────┘
                                                        │
                                             ┌──────────┴──────────┐
                                             ▼                     ▼
                                    ┌──────────────┐      ┌──────────────┐
                                    │  KPI Cards   │      │  Recharts    │
                                    │  (revenue,   │      │  Graphs      │
                                    │  GM%, active │      │  (trends)    │
                                    │  clients)    │      └──────────────┘
                                    └──────────────┘
```

### 5.4 Team / Intern Restricted Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     TEAM / INTERN RESTRICTED DATA FLOW                        │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐   Login as        ┌──────────────┐
    │  Team Login │── Intern ────────▶│  JWT token   │
    └─────────────┘                   │  role=team   │
                                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  GET         │
                                      │  /companies  │
                                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌────────────────────────────────────┐
                                      │  Backend checks:                   │
                                      │  role = 'team'                     │
                                      │  → filter by company_team_members  │
                                      │  → only return assigned companies  │
                                      └────────────────────────────────────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  Only sees   │
                                      │  own clients │
                                      └──────────────┘
```

---

## 6. Database Design

### 6.1 Entity Relationship Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE — TABLE RELATIONSHIPS                         │
└──────────────────────────────────────────────────────────────────────────────┘

   users ──────────────────────────────────────────────────────┐
     │                                                         │
     │ (via company_team_members)                              │
     ▼                                                         │
   companies ────────────────────────────────────┐            │
     │                                           │            │
     ├──▶ projects                               │            │
     │       └──▶ use_cases                      │            │
     │                                           │            │
     ├──▶ trainings                              │            │
     ├──▶ weekly_reports                         │            │
     ├──▶ monthly_reviews                        │            │
     ├──▶ costs                                  │            │
     └──▶ productivity_logs ─────────────────────┘────────────┘
                                       (links company + user)
```

### 6.2 Table Schemas

#### users
```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('founder', 'team')),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

#### companies
```sql
CREATE TABLE companies (
  id              SERIAL PRIMARY KEY,
  company_name    VARCHAR(150) NOT NULL,
  industry        VARCHAR(100),
  sub_industry    VARCHAR(100),
  country         VARCHAR(100),
  entity_type     VARCHAR(50),
  business_model  VARCHAR(50),               -- B2B / B2C / OEM
  status          VARCHAR(50) DEFAULT 'Active',  -- Active / Completed / On Hold
  contract_value  NUMERIC(15, 2),
  start_date      DATE,
  created_by      INT REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### company_team_members
```sql
CREATE TABLE company_team_members (
  id          SERIAL PRIMARY KEY,
  company_id  INT REFERENCES companies(id) ON DELETE CASCADE,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (company_id, user_id)
);
```

#### projects
```sql
CREATE TABLE projects (
  id                    SERIAL PRIMARY KEY,
  company_id            INT REFERENCES companies(id) ON DELETE CASCADE,
  project_name          VARCHAR(150) NOT NULL,
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  current_phase         VARCHAR(100),
  status                VARCHAR(50) DEFAULT 'In Progress',  -- In Progress / Completed / Delayed
  start_date            DATE,
  expected_end_date     DATE,
  created_at            TIMESTAMP DEFAULT NOW()
);
```

#### use_cases
```sql
CREATE TABLE use_cases (
  id               SERIAL PRIMARY KEY,
  project_id       INT REFERENCES projects(id) ON DELETE CASCADE,
  use_case_name    VARCHAR(200) NOT NULL,
  department       VARCHAR(100),
  complexity       VARCHAR(50),               -- Low / Med / Complex / V Complex
  solution_category VARCHAR(150),
  ideation_status  VARCHAR(50),               -- Done / In Progress / To be Planned / High Level
  design_dev_status VARCHAR(50),
  uat_status       VARCHAR(50),
  go_live_date     DATE,
  weekly_comments  TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);
```

#### trainings
```sql
CREATE TABLE trainings (
  id              SERIAL PRIMARY KEY,
  company_id      INT REFERENCES companies(id) ON DELETE CASCADE,
  training_name   VARCHAR(200) NOT NULL,
  trainer_name    VARCHAR(100),
  duration        VARCHAR(50),                -- e.g. "1 Day"
  training_date   DATE,
  status          VARCHAR(50),               -- Completed / TBD / In Progress
  value           NUMERIC(15, 2),
  feedback        TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### weekly_reports
```sql
CREATE TABLE weekly_reports (
  id              SERIAL PRIMARY KEY,
  company_id      INT REFERENCES companies(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  email_subject   VARCHAR(250),
  email_body      TEXT,
  status          VARCHAR(50),               -- Draft / Sent on Time / Delayed
  sent_by         INT REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### monthly_reviews
```sql
CREATE TABLE monthly_reviews (
  id               SERIAL PRIMARY KEY,
  company_id       INT REFERENCES companies(id) ON DELETE CASCADE,
  review_date      DATE NOT NULL,
  agenda           TEXT,
  attendees        TEXT,
  location         VARCHAR(150),
  status           VARCHAR(50),
  mom_notes        TEXT,                     -- Minutes of Meeting
  key_ctas         TEXT,                     -- Key Call To Actions / action items
  next_review_date DATE,
  created_at       TIMESTAMP DEFAULT NOW()
);
```

#### costs
```sql
CREATE TABLE costs (
  id                  SERIAL PRIMARY KEY,
  company_id          INT REFERENCES companies(id) ON DELETE CASCADE,
  month               VARCHAR(20) NOT NULL,  -- e.g. 'Mar2026'
  scope_delivered     TEXT,
  revenue_accrued     NUMERIC(15, 2) DEFAULT 0,
  travel_cost         NUMERIC(15, 2) DEFAULT 0,
  license_cost        NUMERIC(15, 2) DEFAULT 0,
  freelancer_cost     NUMERIC(15, 2) DEFAULT 0,
  fte_cost            NUMERIC(15, 2) DEFAULT 0,
  part_time_cost_india NUMERIC(15, 2) DEFAULT 0,
  part_time_cost_us   NUMERIC(15, 2) DEFAULT 0,
  total_cost          NUMERIC(15, 2) GENERATED ALWAYS AS (
                        travel_cost + license_cost + freelancer_cost +
                        fte_cost + part_time_cost_india + part_time_cost_us
                      ) STORED,
  gross_margin        NUMERIC(15, 2),        -- revenue_accrued - total_cost
  margin_percentage   NUMERIC(6, 2),         -- gross_margin / revenue_accrued * 100
  created_at          TIMESTAMP DEFAULT NOW()
);
```

#### productivity_logs
```sql
CREATE TABLE productivity_logs (
  id                  SERIAL PRIMARY KEY,
  user_id             INT REFERENCES users(id),
  company_id          INT REFERENCES companies(id),
  month               VARCHAR(20) NOT NULL,
  tasks_completed     INT DEFAULT 0,
  reports_submitted   INT DEFAULT 0,
  milestones_closed   INT DEFAULT 0,
  usecases_updated    INT DEFAULT 0,
  score               NUMERIC(5, 2),
  created_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 7. API Design

### 7.1 Full Endpoint Reference

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| `POST` | `/auth/login` | No | All | Login with email + password → returns JWT |
| `GET` | `/auth/me` | Yes | All | Returns current user info from token |
| `POST` | `/users` | Yes | Senior Management | Create a new team member account |
| `GET` | `/users` | Yes | Senior Management | List all users |
| `POST` | `/companies` | Yes | Senior Management | Create a new company |
| `GET` | `/companies` | Yes | All | Senior Management: all companies. Team: assigned only |
| `GET` | `/companies/:id` | Yes | All | Get single company detail |
| `PUT` | `/companies/:id` | Yes | Senior Management | Update company info |
| `POST` | `/companies/:id/assign` | Yes | Senior Management | Assign a team member to a company |
| `POST` | `/projects` | Yes | All | Create a project under a company |
| `GET` | `/projects/company/:companyId` | Yes | All | Get all projects for a company |
| `PUT` | `/projects/:id` | Yes | All | Update project phase and % completion |
| `POST` | `/usecases` | Yes | All | Add a new AI use case |
| `GET` | `/usecases/project/:projectId` | Yes | All | List all use cases for a project |
| `PUT` | `/usecases/:id` | Yes | All | Update use case status / phase / comments |
| `POST` | `/trainings` | Yes | All | Add a training record |
| `GET` | `/trainings/company/:companyId` | Yes | All | List trainings for a company |
| `PUT` | `/trainings/:id` | Yes | All | Update training status |
| `POST` | `/weekly-reports` | Yes | All | Submit weekly report |
| `GET` | `/weekly-reports/company/:companyId` | Yes | All | Get all weekly reports |
| `POST` | `/monthly-reviews` | Yes | All | Add exec review record |
| `GET` | `/monthly-reviews/company/:companyId` | Yes | All | Get all exec reviews |
| `POST` | `/costs` | Yes | Senior Management | Add monthly cost entry |
| `GET` | `/costs/company/:companyId` | Yes | Senior Management | Get cost history (Senior Management only) |
| `PUT` | `/costs/:id` | Yes | Founder | Update cost entry |
| `GET` | `/productivity` | Yes | Founder | Get all team productivity logs |
| `GET` | `/productivity/user/:userId` | Yes | All | Team member sees own log |

### 7.2 Standard Request / Response Format

```javascript
// Login Request — POST /auth/login
{
  "email": "founder@s3ktech.com",
  "password": "yourpassword"
}

// Login Success Response
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "name": "Sameer",
      "email": "founder@s3ktech.com",
      "role": "founder"
    }
  }
}

// Standard Error Response
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

### 7.3 JWT Token Structure

```javascript
// Payload stored inside the JWT
{
  "userId": 1,
  "email": "founder@s3ktech.com",
  "role": "founder",          // "founder" or "team"
  "iat": 1711900800,          // issued at
  "exp": 1712505600           // expires in 7 days
}
```

---

## 8. Role-Based Access Control

### 8.1 Permission Matrix

| Feature / Page | Founder | Team / Intern |
|----------------|---------|---------------|
| View all companies | ✅ | ❌ — assigned only |
| Create company | ✅ | ❌ |
| Edit company | ✅ | ❌ |
| Assign team to company | ✅ | ❌ |
| Create/manage user accounts | ✅ | ❌ |
| View Cost Tracker | ✅ | ❌ |
| View all team productivity | ✅ | ❌ — own only |
| View Founder dashboard | ✅ | ❌ |
| Add / update use cases | ✅ | ✅ — assigned clients |
| Add / update trainings | ✅ | ✅ — assigned clients |
| Submit weekly reports | ✅ | ✅ — assigned clients |
| Add exec review notes | ✅ | ✅ — assigned clients |
| Update project progress | ✅ | ✅ — assigned clients |
| View own productivity log | ✅ | ✅ |

### 8.2 How Role Checking Works in Backend

```javascript
// auth.middleware.js — runs on every protected route
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;          // { userId, email, role }
  next();
};

// role.middleware.js — used on founder-only routes
const requireFounder = (req, res, next) => {
  if (req.user.role !== 'founder') {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
  next();
};

// Example: only founders can see cost data
router.get('/costs/company/:id', verifyToken, requireFounder, costController.getByCo);
```

---

## 9. Deployment Strategy

### 9.1 Local Development Setup

```yaml
# docker-compose.yml — local database only
version: '3.8'

services:
  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=s3k_user
      - POSTGRES_PASSWORD=s3k_pass
      - POSTGRES_DB=s3k_crm
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

> **Note:** Run the React frontend with `npm run dev` on `localhost:5173` and the Express backend with `node src/index.js` on `localhost:4000`. Only the database runs in Docker locally.

### 9.2 CI/CD Pipeline

```
Developer pushes code to GitHub
          │
          ▼
    GitHub Repository
          │
          ├──────────────────────────────────────────┐
          │                                          │
          ▼                                          ▼
  Vercel Build Trigger                     (Future) GitHub Actions
  (Frontend auto-deploy)                   Backend tests → deploy
          │                                          │
          ▼                                          ▼
  Preview URL (on PR)                     Render / Railway Deploy
          │
          ▼
  Merge to main → Production Deploy
  → app.s3ktech.com (or custom domain)
```

### 9.3 Deployment Checklist

| Step | Service | Action |
|------|---------|--------|
| 1 | GitHub | Create monorepo with `/client` and `/server` folders |
| 2 | Neon / Supabase | Create PostgreSQL database, run all CREATE TABLE scripts |
| 3 | Render / Railway | Deploy `/server` as a Node.js web service |
| 4 | Render / Railway | Set all `.env` variables in the dashboard |
| 5 | Vercel | Connect GitHub repo, set root to `/client`, deploy |
| 6 | Vercel | Set `VITE_API_URL` to the Render backend URL |
| 7 | Test | Login as Founder, login as Team — verify access control |

---

## 10. Environment Configuration

### 10.1 Frontend — `/client/.env`

```env
# Backend API base URL
VITE_API_URL=https://api.s3ktech.com
```

### 10.2 Backend — `/server/.env`

```env
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://s3k_user:password@host:5432/s3k_crm

# Auth
JWT_SECRET=your-very-long-random-secret-here
JWT_EXPIRES_IN=7d

# CORS — add your Vercel frontend domain
ALLOWED_ORIGINS=https://app.s3ktech.com
```

### 10.3 Required Software (Local Dev)

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20 LTS | Frontend + Backend runtime |
| npm | 10+ | Package management |
| Docker | 24+ | Local PostgreSQL database |
| Git | latest | Version control |

---

## 11. Development Phases

### Phase 1 — Auth + Dashboards
- User login (email + password)
- JWT generation + storage in frontend
- Role-based redirect (Founder Dashboard / Team Dashboard)
- Protected routes setup
- Sidebar navigation with role-aware menu items

### Phase 2 — Company CRM + Projects + Use Cases
- Company CRUD (create, list, edit)
- Assign team members to companies
- Project creation and progress update
- AI Use Cases Tracker (all phases: Ideation → Design → UAT → Go-Live)

### Phase 3 — Training + Weekly Reports + Exec Reviews
- AI Training Tracker (sessions, status, value)
- Weekly Email Report log
- Monthly Executive Review (MOM, CTAs, next date)

### Phase 4 — Cost Tracker + Team Productivity + Charts
- Cost Tracker (revenue, all cost categories, auto GM%)
- Team Productivity logs and monthly scores
- Recharts graphs on Founder Dashboard (revenue trend, GM%, project completion)

### Phase 5 — Deploy + Test + Founder Demo
- Full deployment on Vercel + Render + Neon
- End-to-end testing of Founder and Team flows
- Founder walkthrough and demo

---

## Next Steps

1. **Confirm GitHub repo name and structure** — create `/client` and `/server` folders
2. **Set up local environment** — Docker for PostgreSQL, run CREATE TABLE scripts
3. **Build Phase 1** — Login page + role routing + dashboards (skeleton)
4. **Build Phase 2** — Company CRM as the first full feature
5. **Deploy early** — Get a live URL after Phase 2 for Founder review
6. **Iterate** — Add remaining modules phase by phase

---

**Document End**
