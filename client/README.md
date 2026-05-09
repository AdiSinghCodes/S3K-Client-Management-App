# S3K Client Governance CRM - UI

A modern, production-ready UI for the S3K Client Governance CRM + Project Tracking Platform.

## 🎯 Project Overview

The S3K CRM is a centralized platform replacing all scattered Excel workbooks with a single, unified web application. It provides:

- **Complete visibility** into company health, client status, revenue, and team productivity
- **Multi-role access control** (Founder & Team/Intern roles)
- **8 key modules** for managing clients, projects, training, and financial metrics
- **Real-time dashboards** with charts, KPIs, and actionable insights

## ✨ Features Built

### Pages Completed
1. ✅ **Login** - Clean, modern auth page with demo credentials
2. ✅ **Dashboard** - Founder/Team dashboard with KPI cards, revenue trends, company overview
3. ✅ **Company CRM** - Company management with projects, team members, financial data
4. ✅ **AI Usecases Tracker** - Phase tracking (Ideation → Design → UAT → Go-Live)
5. ✅ **AI Training Tracker** - Training sessions, trainers, attendance, value tracking
6. ✅ **Weekly Reports** - Email report submission and management
7. ✅ **Monthly Executive Review** - MOM, action items, CTAs tracking
8. ✅ **Cost Tracker** - Revenue, costs, gross margin analysis (Founder only)
9. ✅ **Team Productivity** - Individual and team performance metrics (Founder only)
10. ✅ **Sidebar Navigation** - Role-aware navigation with mobile support

## 🚀 Tech Stack

- **Frontend Framework:** React 18 + Vite
- **Styling:** Tailwind CSS 3
- **UI Components:** Custom + ShadCN-inspired
- **Charts:** Recharts
- **Routing:** React Router 6
- **HTTP Client:** Axios (ready for backend integration)
- **State Management:** React Context + Hooks

## 📦 Installation

### Prerequisites
- Node.js 18+ LTS
- npm 10+

### Setup

1. **Navigate to client folder**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🔐 Demo Credentials

Test the app with these credentials:

- **Founder Access:**
  - Email: `founder@s3ktech.com`
  - Password: `demo123`
  - Access: All companies, all modules, financial data, team management

- **Team/Intern Access:**
  - Email: `team@s3ktech.com`
  - Password: `demo123`
  - Access: Assigned clients only, no financial data

## 📱 Responsive Design

- ✅ Mobile-first responsive layout
- ✅ Sidebar collapses on mobile with hamburger menu
- ✅ Touch-friendly buttons and navigation
- ✅ Optimized for tablets and desktops

## 🎨 Design System

### Colors
- **Primary:** #0052CC (Blue)
- **Secondary:** #17B890 (Teal)
- **Accent:** #FF6B6B (Red)
- **Background:** #f9fafb (Light Gray)

### Components
- Card-based layout with subtle shadows
- KPI cards with icons and trends
- Progress bars for tracking
- Data tables with sorting
- Modal dialogs for forms
- Badge system for status

## 📂 Project Structure

```
client/
├── src/
│   ├── pages/              # All page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CompanyCRM.jsx
│   │   ├── AIUsecasesTracker.jsx
│   │   ├── AITrainingTracker.jsx
│   │   ├── WeeklyReport.jsx
│   │   ├── MonthlyExecReview.jsx
│   │   ├── CostTracker.jsx
│   │   └── TeamProductivity.jsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── AppLayout.jsx
│   │   └── ui/
│   │       ├── KPICard.jsx
│   │       └── ProgressBar.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state management
│   │
│   ├── hooks/
│   │   └── useAuth.js       # Custom auth hook
│   │
│   ├── layouts/
│   │   └── ProtectedRoute.jsx
│   │
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔄 Mock Data

All pages include realistic mock data to demonstrate:
- Company management (Tekman India, TechFlow Solutions, DataSync Inc)
- Project tracking with completion percentages
- Use case phase tracking
- Training sessions with values and feedback
- Revenue and cost trends
- Team member performance metrics

## ⚙️ Next Steps - Backend Integration

When backend is ready, integrate API calls:

1. **Update `AuthContext.jsx`** - Replace mock login with API call
2. **Create `services/` folder** - Add API service files:
   - `auth.service.js`
   - `company.service.js`
   - `project.service.js`
   - `usecase.service.js`
   - etc.
3. **Update `components/utils/axiosInstance.js`** - Add base URL and JWT interceptors
4. **Replace mock data** in each page with API calls

## 🎯 Key Features

### Authentication
- Login with email/password
- JWT token storage in localStorage
- Auto-redirect to login if not authenticated
- Logout functionality

### Role-Based Access
- Founder: Full access to all modules and financial data
- Team/Intern: Limited to assigned clients, no cost/productivity data
- Role-aware sidebar navigation
- Protected routes with automatic redirection

### Dashboard Highlights
- Real-time KPI cards with trend indicators
- Revenue vs Cost vs GM% charts
- Company overview table
- Weekly reports and team productivity summaries
- Multi-company data aggregation

### Data Visualization
- Recharts for all graphs
- Line charts for trends
- Bar charts for comparisons
- Progress bars for completion tracking
- Badge system for status indicators

## 📞 Support

For questions or issues with the UI, refer to the project architecture document: `S3K_ClientGovernance_CRM_Architecture.md`

---

**Status:** ✅ UI Complete - Ready for Founder Review
**Next Phase:** Backend Development + API Integration
