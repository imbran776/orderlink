import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdShoppingCart, 
  MdAttachMoney,
  MdPendingActions,
  MdArrowForward,
} from 'react-icons/md'
import api from '../../services/api'
import { SkeletonDashboard } from '../../components/Common/Skeleton'

const StatCard = ({ icon: Icon, label, value, bgColor, color }) => (
  <div className="card-hover">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-2xl ${bgColor} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  </div>
)

const RetailerDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />

  const { stats, active_delivery, recent_orders } = data || {}

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Dikonfirmasi',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Terkirim',
    cancelled: 'Dibatalkan',
  }
  const badgeCls = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    processing: 'badge-processing',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan aktivitas belanja Anda
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={MdShoppingCart}
          label="Total Pesanan"
          value={stats?.myOrders || 0}
          bgColor="bg-blue-50"
          color="text-blue-600"
        />
        <StatCard
          icon={MdPendingActions}
          label="Menunggu"
          value={stats?.pendingOrders || 0}
          bgColor="bg-amber-50"
          color="text-amber-600"
        />
        <StatCard
          icon={MdAttachMoney}
          label="Total Belanja"
          value={`Rp ${Number(stats?.totalSpent || 0).toLocaleString('id')}`}
          bgColor="bg-emerald-50"
          color="text-emerald-600"
        />
      </div>

      {active_delivery && (
        <div className="card border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50/50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <p className="text-sm font-bold text-indigo-700">
                  Pengiriman Sedang Berlangsung
                </p>
              </div>
              <p className="font-mono font-bold text-gray-900">
                {active_delivery.order?.order_number}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Driver: {active_delivery.driver?.name} —{' '}
                {active_delivery.driver?.phone}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="badge-shipped">
                {active_delivery.status_label}
              </span>
              <div className="mt-2">
                <Link
                  to={`/retailer/tracking/${active_delivery.order?.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Lacak <MdArrowForward className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            Pesanan Terbaru
          </h2>
          <Link
            to="/retailer/orders"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Lihat Semua <MdArrowForward className="w-4 h-4" />
          </Link>
        </div>
        {recent_orders?.length ? (
          <div className="space-y-2">
            {recent_orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-blue-600">
                    {o.order_number}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.created_at}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">
                    Rp {Number(o.total_amount).toLocaleString('id')}
                  </p>
                  <span
                    className={`${badgeCls[o.status] || 'badge-pending'} mt-1`}
                  >
                    {statusLabels[o.status] || o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <MdShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Belum ada pesanan.</p>
            <Link
              to="/retailer/catalog"
              className="inline-block mt-3 btn-primary text-xs px-4 py-2"
            >
              Mulai Belanja
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
export default RetailerDashboard
