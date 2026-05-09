import Sidebar from './Sidebar'
import Topbar from './Topbar'

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto pt-16 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
