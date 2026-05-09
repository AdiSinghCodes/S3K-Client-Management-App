import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isActive = (path) => location.pathname === path

  // Senior Management/Admin Navigation (Full Access)
  const foundationAdminLinks = [
    { path: '/dashboard' ,label: 'Dashboard', icon: '' },
    { path: '/companies', label: 'Company CRM', icon: '' },
    { path: '/usecases', label: 'AI Usecases', icon: '' },
    { path: '/training', label: 'AI Training', icon: '' },
    { path: '/weekly-report', label: 'Weekly Report', icon: '' },
    { path: '/monthly-review', label: 'Exec Review', icon: '' },
    { path: '/costs', label: 'Cost Tracker', icon: '' },
    { path: '/productivity', label: 'Team Productivity', icon: '' },
  ]

  // Team Member Navigation (Limited Access)
  const teamMemberLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '' },
    { path: '/companies', label: 'My Clients', icon: '' },
    { path: '/usecases', label: 'AI Use Cases', icon: '' },
    { path: '/training', label: 'Training', icon: '' },
    { path: '/weekly-report', label: 'Weekly Report', icon: '' },
    { path: '/monthly-review', label: 'Exec Review', icon: '' },
  ]

  // Check if senior management or admin
  const isAdminOrFounder = user?.role === 'admin' || user?.role === 'senior_management'
  const links = isAdminOrFounder ? foundationAdminLinks : teamMemberLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-primary text-white rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-border z-30 transform transition-transform md:transform-none ${
        showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-border flex flex-col items-center text-center">
          <div className="mb-4">
            <img 
              src="/logo.jpeg" 
              alt="S3K Logo" 
              className="h-20 w-20 mx-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div 
              className="hidden h-20 w-20 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-3xl mx-auto"
            >
              S3K
            </div>
          </div>
          <div>
            <h1 className="font-bold text-dark text-lg">S3KECH</h1>
            <p className="text-xs text-muted">AI Solutions</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setShowMobileMenu(false)}
              className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div
          onClick={() => setShowMobileMenu(false)}
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
        />
      )}
    </>
  )
}

export default Sidebar
