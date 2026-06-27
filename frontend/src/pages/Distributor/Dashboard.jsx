import React, { useEffect, useState } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import {
  MdShoppingCart,
  MdInventory,
  MdLocalShipping,
  MdAttachMoney,
  MdWarning,
  MdTrendingUp,
  MdArrowForward,
} from 'react-icons/md'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { SkeletonDashboard } from '../../components/Common/Skeleton'
import AnimatedCounter from '../../components/Common/AnimatedCounter'

const months = [
  '',
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

const StatCard = React.memo(({
  icon: Icon,
  label,
  value,
  bgColor,
  suffix = '',
  prefix = '',
  trend,
  linkTo,
}) => (
  <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-primary-200 shadow-sm hover:shadow-md transition-all group hover:border-accent-500/30">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3.5 rounded-xl ${bgColor} text-white`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend !== undefined && (
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            trend >= 0
              ? 'text-green-700 bg-green-100'
              : 'text-red-700 bg-red-100'
          }`}
        >
          <MdTrendingUp
            className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`}
          />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-extrabold text-primary-900 tracking-tight">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </h3>
      {linkTo && (
        <Link
          to={linkTo}
          className="opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent-500 hover:text-accent-600 p-1"
        >
          <MdArrowForward className="w-5 h-5" />
        </Link>
      )}
    </div>
  </div>
))

const statusBadge = (status) => {
  const map = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border border-green-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200',
  }
  const labels = {
    pending: 'Pending',
    confirmed: 'Dikonfirmasi',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Terkirim',
    cancelled: 'Dibatalkan',
  }
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${map[status] || map.pending}`}
    >
      {labels[status] || status}
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary-900 text-white px-4 py-3 rounded-xl text-sm shadow-xl border border-primary-700">
        <p className="font-bold mb-1.5 text-primary-200">{label}</p>
        <p className="font-mono font-bold text-lg text-white">
          Rp {Number(payload[0].value).toLocaleString('id')}
        </p>
      </div>
    )
  }
  return null
}

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonDashboard />
  if (!data)
    return <p className="text-gray-500 font-medium">Gagal memuat data.</p>

  const { stats, recent_orders, monthly_sales } = data
  const chartData =
    monthly_sales?.map((m) => ({ name: months[m.month], revenue: m.total })) ||
    []

  return (
    <div className="space-y-8 pb-8">
      {/* Header section with gradient line */}
      <div className="relative pb-4 border-b border-primary-100">
        <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1.5">
          Metrik performa dan aktivitas pesanan real-time.
        </p>
        <div className="absolute bottom-[-1px] left-0 w-24 h-[2px] bg-accent-500 rounded-full"></div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon={MdShoppingCart}
          label="Total Order (Bulan Ini)"
          value={stats.totalOrders}
          bgColor="bg-accent-500"
          trend={12}
          linkTo="/distributor/orders"
        />
        <StatCard
          icon={MdShoppingCart}
          label="Order Pending"
          value={stats.pendingOrders}
          bgColor="bg-amber-500"
          trend={-2}
          linkTo="/distributor/orders?status=pending"
        />
        <StatCard
          icon={MdAttachMoney}
          label="Total Revenue (Bulan Ini)"
          value={stats.totalRevenue}
          bgColor="bg-green-500"
          prefix="Rp "
          trend={18.5}
        />
        <StatCard
          icon={MdInventory}
          label="Katalog Produk"
          value={stats.totalProducts}
          bgColor="bg-purple-500"
          linkTo="/distributor/products"
        />
        <StatCard
          icon={MdWarning}
          label="Peringatan Stok Menipis"
          value={stats.lowStockCount}
          bgColor="bg-red-500"
          trend={5}
          linkTo="/distributor/stock"
        />
        <StatCard
          icon={MdLocalShipping}
          label="Armada Aktif"
          value={stats.activeDrivers}
          bgColor="bg-primary-900"
          linkTo="/distributor/deliveries"
        />
      </div>

      {/* Chart & Table Grid Layout for larger screens */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-primary-900 tracking-tight">
                Trend Penjualan Bulanan
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">
                TAHUN {new Date().getFullYear()}
              </p>
            </div>
            <select className="bg-primary-50 border-none text-sm font-bold text-primary-900 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-accent-500 cursor-pointer">
              <option>Tahun Ini</option>
              <option>Tahun Lalu</option>
            </select>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                  tickMargin={12}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: '#cbd5e1',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0284C7"
                  strokeWidth={3}
                  fill="url(#revenueGrad)"
                  activeDot={{
                    r: 6,
                    fill: '#0369A1',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-gray-400 font-medium">
                Belum ada data penjualan tersedia.
              </p>
            </div>
          )}
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-900 tracking-tight">
              Order Terbaru
            </h2>
            <Link
              to="/distributor/orders"
              className="text-sm font-bold text-accent-500 hover:text-accent-600 transition-colors"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {recent_orders?.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-xl border border-primary-100 hover:border-accent-500/40 hover:bg-primary-50 transition-all group flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-primary-900 group-hover:text-accent-600 transition-colors">
                    {o.order_number}
                  </span>
                  {statusBadge(o.status)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {o.retailer}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {o.created_at}
                  </p>
                </div>
                <div className="pt-3 border-t border-primary-100/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">
                    Total Nilai
                  </span>
                  <span className="font-mono text-sm font-bold text-green-600">
                    Rp {Number(o.total_amount).toLocaleString('id')}
                  </span>
                </div>
              </div>
            ))}
            {!recent_orders?.length && (
              <div className="h-full flex items-center justify-center">
                <p className="text-center text-gray-400 font-medium py-6">
                  Belum ada order masuk.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard