import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  MdDashboard,
  MdDeliveryDining,
  MdLogout,
  MdMenu,
  MdClose,
  MdPerson,
} from 'react-icons/md'
import toast from 'react-hot-toast'
import Logo from '../Common/Logo'
import PageTransition from '../Common/PageTransition'
import ThemeToggle from '../Common/ThemeToggle'
import NotificationDropdown from '../Common/NotificationDropdown'
import Footer from '../Common/Footer'

const driverNavItems = [
  { to: '/driver', label: 'Dashboard', icon: MdDashboard, exact: true },
  {
    to: '/driver/deliveries',
    label: 'Pengiriman Saya',
    icon: MdDeliveryDining,
  },
]

// --- Static Component: Sidebar ---
// Moved out of DriverLayout to prevent re-creation on every render.
const Sidebar = ({ user, onLogout, onClose, navItems }) => (
  <div className="w-64 bg-brand-gradient min-h-screen flex flex-col relative overflow-hidden">
    {/* Subtle brand pattern overlay */}
    <div className="absolute inset-0 opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>

    <div className="relative z-10 p-5 border-b border-teal-700/50">
      <Logo className="w-8 h-8" textColor="text-white" />
      <span className="mt-3 inline-flex items-center px-2.5 py-1 rounded-lg bg-coral-500/20 border border-coral-400/30 text-coral-200 text-xs font-bold backdrop-blur-sm">
        Portal Driver
      </span>
    </div>

    <nav className="relative z-10 flex-1 p-3 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/30'
                : 'text-teal-100 hover:bg-teal-700/40 hover:text-white'
            }`
          }
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>

    <div className="relative z-10 p-3 border-t border-teal-700/50">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-800/50 backdrop-blur-sm mb-2 border border-teal-600/30">
        <div className="w-9 h-9 bg-coral-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
          <MdPerson className="text-white w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-bold truncate">{user?.name}</p>
          <p className="text-teal-200 text-xs">Driver</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-teal-100 hover:bg-coral-500 hover:text-white transition-all duration-200"
      >
        <MdLogout className="w-5 h-5" />
        <span>Keluar</span>
      </button>
    </div>
  </div>
)

const DriverLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const handleLogout = async () => {
    await logout()
    toast.success('Logout berhasil')
    navigate('/login')
  }

  useEffect(() => {
    const prefetch = () => {
      import('../../pages/Driver/Dashboard')
      import('../../pages/Driver/Deliveries')
    }
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch)
      return () => cancelIdleCallback(id)
    } else {
      const id = setTimeout(prefetch, 2000)
      return () => clearTimeout(id)
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onClose={() => {}}
          navItems={driverNavItems}
        />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 animate-slideInRight">
            <Sidebar
              user={user}
              onLogout={handleLogout}
              onClose={() => setOpen(false)}
              navItems={driverNavItems}
            />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
            >
              {open ? (
                <MdClose className="w-5 h-5" />
              ) : (
                <MdMenu className="w-5 h-5" />
              )}
            </button>
            <Logo
              className="w-6 h-6"
              textColor="text-gray-900 dark:text-white"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              OrderLink
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <Footer />
      </div>
    </div>
  )
}
export default DriverLayout
