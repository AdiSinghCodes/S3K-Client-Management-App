import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './layouts/ProtectedRoute'
import AdminOnlyRoute from './layouts/AdminOnlyRoute'
import AppLayout from './components/layout/AppLayout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CompanyCRM from './pages/CompanyCRM'
import ClientsSummary from './pages/ClientsSummary'
import AIUsecasesTracker from './pages/AIUsecasesTracker'
import AITrainingTracker from './pages/AITrainingTracker'
import WeeklyReport from './pages/WeeklyReport'
import MonthlyExecReview from './pages/MonthlyExecReview'
import CostTracker from './pages/CostTracker'
import TeamProductivity from './pages/TeamProductivity'

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CompanyCRM />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients-summary"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ClientsSummary />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usecases"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AIUsecasesTracker />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AITrainingTracker />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-report"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <WeeklyReport />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monthly-review"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MonthlyExecReview />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/costs"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CostTracker />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity"
            element={
              <AdminOnlyRoute>
                <AppLayout>
                  <TeamProductivity />
                </AppLayout>
              </AdminOnlyRoute>
            }
          />

          {/* Catch All - Redirect to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </DataProvider>
  </AuthProvider>
  )
}

export default App
