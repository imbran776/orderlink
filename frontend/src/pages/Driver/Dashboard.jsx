import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdDeliveryDining,
  MdCheckCircle,
  MdToday,
  MdArrowForward,
  MdLocationOn,
} from 'react-icons/md'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
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

const statusLabel = {
  assigned: 'Ditugaskan',
  picked_up: 'Diambil',
  on_the_way: 'Dalam Perjalanan',
  delivered: 'Terkirim',
  failed: 'Gagal',
}

const DriverDashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />

  const { stats, active_delivery } = data || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {user?.name}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Driver Portal — OrderLink</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={MdDeliveryDining}
          label="Total Pengiriman"
          value={stats?.totalDeliveries || 0}
          bgColor="bg-blue-50"
          color="text-blue-600"
        />
        <StatCard
          icon={MdToday}
          label="Pengiriman Hari Ini"
          value={stats?.todayDeliveries || 0}
          bgColor="bg-amber-50"
          color="text-amber-600"
        />
        <StatCard
          icon={MdCheckCircle}
          label="Berhasil Terkirim"
          value={stats?.completedDeliveries || 0}
          bgColor="bg-emerald-50"
          color="text-emerald-600"
        />
      </div>

      {active_delivery ? (
        <div className="card border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-emerald-700">
                  Pengiriman Aktif
                </span>
              </div>
              <p className="font-mono font-bold text-gray-900 text-lg">
                {active_delivery.order?.order_number}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <MdDeliveryDining className="w-4 h-4 text-gray-400" />
                  {active_delivery.order?.retailer?.name}
                </p>
                <p className="text-sm text-gray-500 flex items-start gap-1.5">
                  <MdLocationOn className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  {active_delivery.order?.delivery_address}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Status:{' '}
                <span className="font-semibold text-gray-600">
                  {statusLabel[active_delivery.status]}
                </span>
              </p>
            </div>
            <Link
              to="/driver/deliveries"
              className="btn-primary text-sm flex-shrink-0"
            >
              Lanjut <MdArrowForward className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MdDeliveryDining className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            Tidak ada pengiriman aktif saat ini.
          </p>
          <Link
            to="/driver/deliveries"
            className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline mt-3 font-semibold"
          >
            Lihat semua pengiriman <MdArrowForward className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
export default DriverDashboard
