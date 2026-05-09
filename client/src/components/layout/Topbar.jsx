import { useAuth } from '../../hooks/useAuth'

const Topbar = () => {
  const { user, logout } = useAuth()

  return (
    <div className="h-16 bg-white border-b border-border flex items-center justify-between px-8 fixed top-0 right-0 left-0 md:left-64 z-20">
      {/* Left - Title */}
      <div className="hidden md:block">
        <h1 className="text-lg font-bold text-dark">S3K Tech.ai</h1>
      </div>

      {/* Right - User Profile & Notifications */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-500 hover:text-dark transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-border">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {/* User Info */}
          <div className="flex flex-col">
            <p className="font-semibold text-dark text-sm">{user?.name}</p>
            <p className="text-xs text-muted">
              {user?.role === 'senior_management' ? 'Senior Management' : user?.role === 'admin' ? 'Admin' : 'Team Member'}
            </p>
          </div>
          {/* Dropdown Menu */}
          <button
            onClick={logout}
            className="ml-2 p-1 text-gray-400 hover:text-dark transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Topbar
