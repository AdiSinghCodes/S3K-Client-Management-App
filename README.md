# S3K Client Management App

**AI Assisted, Human Governed**

A comprehensive client management and project governance platform designed for managing companies, tracking AI use cases, monitoring team productivity, and financial metrics. Features include cost tracking with detailed expense breakdown, training management, executive reviews, and role-based access for senior management and team members.

---

## 🚀 Features

### Client Management
- ✅ Create and manage client companies
- ✅ Track company details and industries
- ✅ Assign clients to team members
- ✅ View assigned companies dashboard

### AI Use Cases Tracking
- ✅ Create and manage AI projects
- ✅ Track project phases (Ideation → Design → Development → UAT → Live)
- ✅ Monitor progress percentage
- ✅ Edit and delete use cases
- ✅ Set start date, expected end date, and go-live date

### Financial Management
- ✅ Track monthly revenue and expenses
- ✅ Break down costs by category:
  - Travel Cost
  - License Cost
  - Freelancer Cost
  - FTE Salary
  - Part-Time India Cost
  - Part-Time US Cost
- ✅ Auto-calculate gross margin and GM%
- ✅ Monthly financial trends visualization

### Team Performance
- ✅ Track team member productivity metrics
- ✅ Monitor tasks completed vs target
- ✅ Track reports submitted
- ✅ Milestones closed and AI use case updates
- ✅ Performance scoring system

### Training & Development
- ✅ Log AI training sessions
- ✅ Track trainer, topic, date, duration
- ✅ Manage training status
- ✅ Add notes and participant tracking

### Executive Reviews
- ✅ Document monthly executive reviews
- ✅ Track meeting details, CTAs, and risks
- ✅ Store MOM (Minutes of Meeting)

### Weekly Reports
- ✅ Submit weekly progress reports
- ✅ Track activities and achievements
- ✅ Document blockers and next steps

### Role-Based Access
- ✅ **Senior Management**: Full access to all features
- ✅ **Team Members**: Limited access to own data
  - Can create and view their own clients
  - Can track their own use cases
  - Can log training and reviews
  - Cannot view Team Productivity

---

## 🛠 Tech Stack

### Frontend
- **React 18.2** - UI Library
- **Vite 5.4** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express.js 4+** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Database
- **PostgreSQL 12+**
- Tables: users, companies, use_cases, trainings, weekly_reports, monthly_reviews, costs, productivity_logs

---

## 📋 Project Structure

```
S3K-Client-Management-App/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CompanyCRM.jsx
│   │   │   ├── AIUsecasesTracker.jsx
│   │   │   ├── AITrainingTracker.jsx
│   │   │   ├── WeeklyReport.jsx
│   │   │   ├── MonthlyExecReview.jsx
│   │   │   ├── CostTracker.jsx
│   │   │   └── TeamProductivity.jsx
│   │   ├── components/             # Reusable components
│   │   ├── services/               # API services
│   │   ├── context/                # React Context (Auth)
│   │   ├── hooks/                  # Custom hooks
│   │   └── layouts/                # Protected routes
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── controllers/            # Business logic
│   │   ├── models/                 # Database queries
│   │   ├── routes/                 # API endpoints
│   │   ├── middleware/             # Auth & validation
│   │   ├── utils/                  # JWT, bcrypt helpers
│   │   └── config/                 # Database config
│   ├── server.js                   # Entry point
│   └── package.json
│
├── .env                            # Environment variables
├── database.sql                    # Database schema
└── README.md                       # This file
```

---

## 🔐 Authentication

### JWT (JSON Web Tokens)
- Token expiry: **7 days**
- Token contains: `{id, role, name}`
- Password hashing: **bcrypt (10 rounds)**

### Demo Credentials
```
Admin Account:
  Email: admin@s3ktech.com
  Password: (set during initial setup)

Team Member Account:
  Email: team@s3ktech.com
  Password: (set during initial setup)
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure .env file
# Create/update .env with:
NODE_ENV=development
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=s3k_db
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Create database
createdb s3k_db

# Run migrations
npm run migrate

# Start server
npm start
```

Server runs on: `http://localhost:5000`

---

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env (if needed)
VITE_API_URL=http://localhost:5000/api

# Start dev server
npm run dev
```

Frontend runs on: `http://localhost:5174` (or `http://localhost:5173`)

---

## 📊 Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE s3k_db;

# Run schema
\c s3k_db
\i database.sql
```

---

## 🔄 API Endpoints

### Authentication
```
POST   /api/auth/login       - Login user
POST   /api/auth/register    - Register new user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user
```

### Companies
```
GET    /api/companies        - Get all companies
POST   /api/companies        - Create company
PUT    /api/companies/:id    - Update company
DELETE /api/companies/:id    - Delete company
```

### AI Use Cases
```
GET    /api/usecases         - Get all use cases
POST   /api/usecases         - Create use case
PUT    /api/usecases/:id     - Update use case
DELETE /api/usecases/:id     - Delete use case
```

### Costs
```
GET    /api/costs            - Get all costs
POST   /api/costs            - Create cost record
PUT    /api/costs/:id        - Update cost record
DELETE /api/costs/:id        - Delete cost record
```

### Training
```
GET    /api/training         - Get all trainings
POST   /api/training         - Create training
PUT    /api/training/:id     - Update training
DELETE /api/training/:id     - Delete training
```

### Team Productivity
```
GET    /api/productivity     - Get productivity data
POST   /api/productivity     - Create productivity record
PUT    /api/productivity/:id - Update productivity
DELETE /api/productivity/:id - Delete productivity
```

---

## 📈 Financial Dashboard Calculations

### Total Cost
```
= Travel + License + Freelancer + FTE + Part-Time India + Part-Time US
```

### Gross Margin (GM)
```
= Revenue - Total Cost
```

### GM Percentage
```
= (Gross Margin ÷ Revenue) × 100
```

---

## 🎯 Key Features by Role

### Senior Management
- ✅ View all companies and clients
- ✅ Track all team members' use cases
- ✅ Manage financial data (costs, revenue)
- ✅ View team productivity metrics
- ✅ Create/edit/delete productivity logs
- ✅ Access cost tracking
- ✅ View all reports and reviews

### Team Members
- ✅ View their assigned companies
- ✅ Create and manage own AI use cases
- ✅ Log training sessions
- ✅ Submit weekly reports
- ✅ Log executive reviews
- ✅ View own dashboard
- ❌ Cannot access Team Productivity section
- ❌ Cannot view cost/financial data

---

## 🔄 Running the Application

### Using npm start

**Terminal 1 (Backend):**
```bash
cd server
npm start
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Frontend starts on http://localhost:5174
```

### Build for Production

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
npm run build  # If configured
```

---

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_USER=postgres
DB_PASSWORD=sarita1602
DB_HOST=localhost
DB_PORT=5432
DB_NAME=s3k_db
DATABASE_URL=postgresql://postgres:sarita1602@localhost:5432/s3k_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
taskkill /F /IM node.exe

# Or change PORT in .env
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify credentials in .env
# Ensure database exists
psql -U postgres -d s3k_db -c "SELECT version();"
```

### Token Expired
- Tokens expire after 7 days
- User will be automatically logged out
- Login again to get new token

---

## 📅 Current Date & Version

- **Current Date:** May 9, 2026
- **Version:** 1.0.0
- **Status:** ✅ Production Ready

---

## 👥 Team

- **Developer:** Aditya Singh
- **Project:** S3K Tech.ai Client Management App

---

## 📄 License

© 2026 S3K Tech.ai. All rights reserved.

---

## 🤝 Contributing

1. Create a feature branch
2. Commit changes
3. Push to GitHub
4. Create Pull Request

---

## 📞 Support

For issues or questions, please contact the development team or create an issue on GitHub.

---

## 🎉 Thank You!

Thank you for using S3K Client Management App. Happy coding! 🚀

**Repository:** https://github.com/AdiSinghCodes/S3K-Client-Management-App
