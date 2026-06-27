import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  MdDashboard,
  MdInventory,
  MdShoppingCart,
  MdLocalShipping,
  MdWarehouse,
  MdBarChart,
  MdMenu,
  MdClose,
  MdLogout,
  MdPerson,
} from 'react-icons/md'
import toast from 'react-hot-toast'
import { connectSocket, subscribeToNotifications } from '../../services/socket'
import Logo from '../Common/Logo'
import PageTransition from '../Common/PageTransition'
import ThemeToggle from '../Common/ThemeToggle'
import NotificationDropdown from '../Common/NotificationDropdown'
import Footer from '../Common/Footer'

const navItems = [
  { to: '/distributor', icon: MdDashboard, label: 'Dashboard', exact: true },
  { to: '/distributor/products', icon: MdInventory, label: 'Produk' },
  { to: '/distributor/orders', icon: MdShoppingCart, label: 'Order' },
  { to: '/distributor/deliveries', icon: MdLocalShipping, label: 'Pengiriman' },
  { to: '/distributor/stock', icon: MdWarehouse, label: 'Stok' },
  { to: '/distributor/reports', icon: MdBarChart, label: 'Laporan' },
]

const Sidebar = ({ user, onLogout, onClose, mobile = false }) => (
  <div
    className={`${mobile ? 'flex' : 'hidden lg:flex'} w-64 bg-brand-gradient min-h-screen flex-col relative overflow-hidden`}
  >
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
        Distributor Panel
      </span>
    </div>

    <nav className="relative z-10 flex-1 p-3 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/30'
                : 'text-teal-100 hover:bg-teal-700/40 hover:text-white'
            }`
          }
          onClick={onClose}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{item.label}</span>
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
          <p className="text-teal-200 text-xs capitalize">{user?.role}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-teal-100 hover:bg-coral-500 hover:text-white transition-all duration-200 group"
      >
        <MdLogout className="w-5 h-5" />
        <span>Keluar</span>
      </button>
    </div>
  </div>
)
const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Prefetch route chunks saat idle supaya navigasi instan
  useEffect(() => {
    const prefetch = () => {
      import('../../pages/Distributor/Dashboard')
      import('../../pages/Distributor/Products')
      import('../../pages/Distributor/Orders')
      import('../../pages/Distributor/Deliveries')
      import('../../pages/Distributor/Stock')
      import('../../pages/Distributor/Reports')
    }
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch)
      return () => cancelIdleCallback(id)
    } else {
      const id = setTimeout(prefetch, 2000)
      return () => clearTimeout(id)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    connectSocket(user.id)
    subscribeToNotifications(user.id, (notif) => {
      toast(notif.title, { icon: '🔔' })
    })
    return () => {}
  }, [user?.id])

  const handleLogout = async () => {
    await logout()
    toast.success('Logout berhasil')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar user={user} onLogout={handleLogout} onClose={() => {}} />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 animate-slideInRight">
            <Sidebar
              user={user}
              onLogout={handleLogout}
              onClose={() => setOpen(false)}
              mobile
            />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all"
            >
              {open ? (
                <MdClose className="w-5 h-5" />
              ) : (
                <MdMenu className="w-5 h-5" />
              )}
            </button>
            <Logo
              className="w-6 h-6"
              textColor="text-teal-900 dark:text-white"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="font-bold text-teal-900 dark:text-teal-100">
              OrderLink
            </span>
            <span className="text-neutral-400 dark:text-neutral-500">
              Distributor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
