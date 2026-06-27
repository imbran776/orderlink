import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Loader from './components/Common/Loader'

// Auth
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))

// Layouts
const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'))
const RetailerLayout = lazy(() => import('./components/Layout/RetailerLayout'))
const DriverLayout = lazy(() => import('./components/Layout/DriverLayout'))

// Distributor pages
const DistDashboard = lazy(() => import('./pages/Distributor/Dashboard'))
const DistProducts = lazy(() => import('./pages/Distributor/Products'))
const DistOrders = lazy(() => import('./pages/Distributor/Orders'))
const DistDeliveries = lazy(() => import('./pages/Distributor/Deliveries'))
const DistStock = lazy(() => import('./pages/Distributor/Stock'))
const DistReports = lazy(() => import('./pages/Distributor/Reports'))

// Retailer pages
const RetailerDashboard = lazy(() => import('./pages/Retailer/Dashboard'))
const RetailerCatalog = lazy(() => import('./pages/Retailer/Catalog'))
const RetailerOrders = lazy(() => import('./pages/Retailer/MyOrders'))
const RetailerTracking = lazy(() => import('./pages/Retailer/Tracking'))

// Driver pages
const DriverDashboard = lazy(() => import('./pages/Driver/Dashboard'))
const DriverDeliveries = lazy(() => import('./pages/Driver/Deliveries'))

// ── Protected Route ────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loader fullscreen />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role))
    return <Navigate to="/unauthorized" replace />
  return children
}

// ── Role-based home redirect ───────────────────────────────────────────────
const HomeRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return <Loader fullscreen />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

export default function App() {
  return (
    <Suspense fallback={<Loader fullscreen />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeRedirect />} />

        {/* Distributor */}
        <Route
          path="/distributor"
          element={
            <ProtectedRoute roles={['distributor']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DistDashboard />} />
          <Route path="products" element={<DistProducts />} />
          <Route path="orders" element={<DistOrders />} />
          <Route path="deliveries" element={<DistDeliveries />} />
          <Route path="stock" element={<DistStock />} />
          <Route path="reports" element={<DistReports />} />
        </Route>

        {/* Retailer */}
        <Route
          path="/retailer"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RetailerDashboard />} />
          <Route path="catalog" element={<RetailerCatalog />} />
          <Route path="orders" element={<RetailerOrders />} />
          <Route path="tracking/:orderId" element={<RetailerTracking />} />
        </Route>

        {/* Driver */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DriverDashboard />} />
          <Route path="deliveries" element={<DriverDeliveries />} />
        </Route>

        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-6xl mb-4">🚫</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Akses Ditolak
                </h1>
                <p className="text-gray-500 mb-6">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <Link to="/" className="btn-primary px-6 py-2 rounded-lg">
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
