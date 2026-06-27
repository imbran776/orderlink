import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import api from '../../services/api'
import { SkeletonReports } from '../../components/Common/Skeleton'
import { MdTrendingUp, MdPieChart, MdInventory } from 'react-icons/md'

const COLORS = [
  '#0ea5e9',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary-900 text-white px-4 py-3 rounded-xl text-sm shadow-xl border border-primary-700">
        <p className="font-bold mb-1.5 text-primary-200">Tgl: {label}</p>
        <p className="font-mono font-bold text-lg text-white">
          Rp {Number(payload[0].value).toLocaleString('id')}
        </p>
      </div>
    )
  }
  return null
}

const Reports = () => {
  const [sales, setSales] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      Promise.all([
        api.get('/reports/sales', { params: { year } }),
        api.get('/reports/delivery'),
      ])
        .then(([s, d]) => {
          setSales(s.data)
          setDelivery(d.data)
        })
        .finally(() => setLoading(false))
    }
    fetchData()
  }, [year])

  if (loading) return <SkeletonReports />

  const dailyData =
    sales?.data?.slice(-30).map((d) => ({
      date: d.date?.substring(5),
      revenue: Number(d.revenue),
      orders: d.total_orders,
    })) || []

  const deliveryPieData =
    delivery?.deliveries?.map((d) => ({
      name: d.status,
      value: d.total,
    })) || []

  return (
    <div className="space-y-8 pb-8">
      {/* Header section with gradient line */}
      <div className="relative pb-4 border-b border-primary-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">
            Laporan & Analitik
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1.5">
            Wawasan pendapatan, produk terlaris, dan kinerja pengiriman.
          </p>
          <div className="absolute bottom-[-1px] left-0 w-24 h-[2px] bg-accent-500 rounded-full"></div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Tahun Laporan
          </label>
          <select
            className="w-32 py-2.5 px-4 bg-gray-50 border-2 border-transparent text-primary-900 font-bold rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all cursor-pointer"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <MdTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-900 tracking-tight">
              Revenue Harian (30 Hari Terakhir)
            </h2>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">
              Tren pendapatan kotor harian
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={dailyData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
              tickMargin={10}
            />
            <RechartsTooltip
              content={<CustomTooltip />}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar
              dataKey="revenue"
              fill="#0ea5e9"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
              activeBar={{ fill: '#0284c7' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MdInventory className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-900 tracking-tight">
                Produk Terlaris
              </h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                Top 10 produk berdasarkan pendapatan
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {sales?.topProducts?.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black
                    ${
                      i === 0
                        ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200'
                        : i === 1
                          ? 'bg-gray-200 text-gray-700'
                          : i === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-white text-gray-400 border border-gray-200'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-primary-900 group-hover:text-emerald-700 transition-colors">
                      {p.name}
                    </span>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">
                      Terjual:{' '}
                      <span className="font-bold text-gray-700">
                        {p.total_qty} unit
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-extrabold text-green-600">
                    Rp {Number(p.total_revenue).toLocaleString('id')}
                  </p>
                </div>
              </div>
            ))}
            {!sales?.topProducts?.length && (
              <div className="h-full flex items-center justify-center py-10">
                <p className="text-center text-gray-400 font-medium">
                  Belum ada data penjualan produk.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Status Pie */}
        <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <MdPieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-900 tracking-tight">
                Rasio Status Pengiriman
              </h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                Proporsi kesuksesan armada
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
            {deliveryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deliveryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                    stroke="none"
                  >
                    {deliveryPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                    itemStyle={{ fontWeight: 700, color: '#0f172a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 font-medium py-10">
                Belum ada data pengiriman.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Reports
