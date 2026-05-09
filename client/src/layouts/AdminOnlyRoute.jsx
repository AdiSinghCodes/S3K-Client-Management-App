import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AdminOnlyRoute = ({ children }) => {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Only allow admin or senior_management role
  if (user?.role !== 'admin' && user?.role !== 'senior_management') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminOnlyRoute
