import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, CheckSquare, LogOut,
  Zap, User, ChevronDown
} from 'lucide-react'
import { useState } from 'react'

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/tasks', label: 'Task Board', icon: CheckSquare },
  ]

  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-ink-100 fixed h-full z-20">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-ink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent-600 rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-ink-900 tracking-tight">TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-ink-100">
          <button onClick={handleLogout} className="sidebar-link w-full text-rose-400 hover:text-rose-600 hover:bg-rose-50">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col ml-60">
        {/* Top navbar */}
        <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-ink-100 sticky top-0 z-10">
          <div className="text-sm text-ink-400 font-medium">
            Team Task Manager
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-ink-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-accent-100 flex items-center justify-center">
                <User size={14} className="text-accent-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-ink-800 leading-none">{user?.name}</div>
                <div className="text-xs text-ink-400 mt-0.5 capitalize">{user?.role}</div>
              </div>
              <ChevronDown size={14} className="text-ink-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 w-48 card py-1.5 animate-fade-in">
                <div className="px-3 py-2 text-xs text-ink-400 border-b border-ink-50 mb-1">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
