import React, { useEffect, useState, useCallback } from 'react'
import {
  MdSearch,
  MdLocalShipping,
  MdVisibility,
  MdInventory,
  MdCheckCircle,
  MdArrowForward,
} from 'react-icons/md'
import api from '../../services/api'
import { Skeleton, SkeletonTable } from '../../components/Common/Skeleton'
import Modal from '../../components/Common/Modal'
import Pagination from '../../components/Common/Pagination'
import { EmptyOrders } from '../../components/Common/EmptyState'
import InvoiceTemplate from '../../components/Common/InvoiceTemplate'
import toast from 'react-hot-toast'
const statusOptions = [
  '',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]
const nextStatus = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
}

const OrderTimeline = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Pesanan Dibuat', icon: MdInventory },
    { key: 'confirmed', label: 'Dikonfirmasi', icon: MdCheckCircle },
    { key: 'processing', label: 'Diproses', icon: MdInventory },
    { key: 'shipped', label: 'Dalam Pengiriman', icon: MdLocalShipping },
    { key: 'delivered', label: 'Terkirim', icon: MdCheckCircle },
  ]
  const statusIndex = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
  }
  const currentStep = statusIndex[status] ?? -1

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 p-4 rounded-xl flex items-center justify-center border border-red-200 shadow-sm">
        <p className="text-red-700 font-bold flex items-center gap-2">
          <MdCheckCircle className="w-5 h-5" /> Pesanan Dibatalkan
        </p>
      </div>
    )
  }

  return (
    <div className="py-4 px-2">
      <div className="relative">
        <div className="absolute left-4 top-4 bottom-4 w-1 bg-gray-100 rounded-full" />
        <div
          className="absolute left-4 top-4 w-1 bg-accent-500 transition-all duration-700 rounded-full"
          style={{
            height: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%`,
          }}
        />

        <div className="space-y-8">
          {steps.map((step, i) => {
            const done = i <= currentStep
            const current = i === currentStep
            return (
              <div
                key={step.key}
                className="flex items-center gap-5 relative group"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all duration-500
                  ${done ? 'bg-primary-900 shadow-md' : 'bg-gray-100 border border-gray-200'} ${current ? 'ring-4 ring-accent-500/30 scale-110' : ''}`}
                >
                  <step.icon
                    className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`}
                  />
                </div>
                <div>
                  <p
                    className={`font-bold text-sm transition-colors ${done ? 'text-primary-900' : 'text-gray-400'}`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const badge = (s) => {
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
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${map[s] || map.pending}`}
    >
      {labels[s] || s}
    </span>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [assignModal, setAssignModal] = useState(false)
  const [assignOrder, setAssignOrder] = useState(null)
  const [driverId, setDriverId] = useState('')
  const [invoiceModal, setInvoiceModal] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchOrders = useCallback(async () => {
      setLoading(true)
      try {
          const r = await api.get('/orders', {
              params: {
                  search: debouncedSearch,
                  status: statusFilter,
                  page: currentPage,
              },
          })
          setOrders(r.data.data || [])
          setPagination(r.data.meta)
      } finally {
          setLoading(false)
      }
  }, [debouncedSearch, statusFilter, currentPage])

  const fetchDrivers = useCallback(async () => {
      const r = await api.get('/drivers')
      setDrivers(r.data.data || [])
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])
  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const updateStatus = async (order, status) => {
    await api.put(`/orders/${order.id}/status`, { status })
    toast.success('Status diperbarui')
    fetchOrders()
  }

  const openAssign = (order) => {
    setAssignOrder(order)
    setDriverId('')
    setAssignModal(true)
  }

  const handleAssign = async () => {
    if (!driverId) return toast.error('Pilih driver terlebih dahulu')
    await api.post(`/orders/${assignOrder.id}/assign-driver`, {
      driver_id: driverId,
    })
    toast.success('Driver berhasil di-assign')
    setAssignModal(false)
    fetchOrders()
  }

  if (loading)
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    )

  return (
    <div className="space-y-8 pb-8">
      {/* Header section with gradient line */}
      <div className="relative pb-4 border-b border-primary-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">
            Manajemen Order
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1.5">
            Pantau, proses, dan kelola semua pesanan grosir.
          </p>
          <div className="absolute bottom-[-1px] left-0 w-24 h-[2px] bg-accent-500 rounded-full"></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MdSearch className="text-gray-400 group-focus-within:text-accent-500 transition-colors w-5 h-5" />
            </div>
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-medium placeholder:text-gray-400"
              placeholder="Cari nomor order (contoh: ORD-...) atau retailer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="w-full sm:w-56 py-2.5 px-4 bg-gray-50 border-2 border-transparent text-primary-900 font-bold rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            {statusOptions.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  No. Order
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Retailer
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Total Nilai
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Status
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Tanggal
                </th>
                <th className="py-3 px-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-gray-100 hover:bg-primary-50 transition-colors group"
                >
                  <td className="py-4 px-4 font-mono font-bold text-primary-900 group-hover:text-accent-600 transition-colors">
                    {o.order_number}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">
                      {o.retailer?.name}
                    </p>
                    <p className="text-gray-500 text-xs font-medium">
                      {o.retailer?.company_name}
                    </p>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-green-600">
                    Rp {Number(o.total_amount).toLocaleString('id')}
                  </td>
                  <td className="py-4 px-4">{badge(o.status)}</td>
                  <td className="py-4 px-4 text-gray-500 text-xs font-bold">
                    {o.created_at?.substring(0, 10)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setSelected(o)}
                        className="p-2 text-primary-900 hover:text-accent-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-accent-200 hover:shadow-sm"
                        title="Lihat Detail"
                      >
                        <MdVisibility className="w-4 h-4" />
                      </button>

                      {o.invoice && (
                        <button
                          onClick={() => {
                            setSelected(o)
                            setInvoiceModal(true)
                          }}
                          className="text-[11px] px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all border border-gray-200"
                        >
                          Invoice
                        </button>
                      )}

                      {nextStatus[o.status] && (
                        <button
                          onClick={() => updateStatus(o, nextStatus[o.status])}
                          className="text-[11px] px-3 py-1.5 bg-primary-900 text-white rounded-lg hover:bg-black font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          Proses <MdArrowForward />
                        </button>
                      )}

                      {o.status === 'processing' && (
                        <button
                          onClick={() => openAssign(o)}
                          className="text-[11px] px-3 py-1.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <MdLocalShipping className="w-3.5 h-3.5" /> Assign
                          Driver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <EmptyOrders />}
        </div>
        <Pagination pagination={pagination} onPageChange={setCurrentPage} />
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Detail Pesanan"
        size="lg"
      >
        {selected && (
          <div className="p-0">
            {/* Modal Header Banner */}
            <div className="bg-primary-900 p-6 flex items-start justify-between">
              <div>
                <p className="text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">
                  Nomor Pesanan
                </p>
                <p className="font-mono font-extrabold text-white text-2xl">
                  {selected.order_number}
                </p>
              </div>
              <div>{badge(selected.status)}</div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Retailer & Items */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-primary-900 text-sm uppercase tracking-wider mb-3">
                    Informasi Retailer
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-base font-bold text-gray-900">
                      {selected.retailer?.name}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mb-4">
                      {selected.retailer?.company_name}
                    </p>

                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Alamat Pengiriman
                    </p>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                      {selected.delivery_address}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-primary-900 text-sm uppercase tracking-wider mb-3">
                    Rincian Item
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-4 space-y-4">
                      {selected.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {item.product?.image ? (
                                <img
                                  src={`${api.defaults.baseURL.replace('/api', '')}/storage/${item.product.image}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <MdInventory className="text-gray-300 w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {item.product?.name}
                              </p>
                              <p className="text-xs font-medium text-gray-500 mt-0.5">
                                {item.quantity} {item.product?.unit} × Rp{' '}
                                {Number(item.price).toLocaleString('id')}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-gray-900">
                            Rp {Number(item.subtotal).toLocaleString('id')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-gray-500 text-sm uppercase">
                        Total Pembayaran
                      </span>
                      <span className="font-mono font-extrabold text-green-600 text-lg">
                        Rp {Number(selected.total_amount).toLocaleString('id')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Timeline */}
              <div>
                <h3 className="font-bold text-primary-900 text-sm uppercase tracking-wider mb-3">
                  Status Pengiriman
                </h3>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <OrderTimeline status={selected.status} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign Driver"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm font-medium text-gray-600 mb-5 leading-relaxed">
            Pilih driver untuk mengantar pesanan{' '}
            <span className="font-mono font-bold text-primary-900 bg-primary-50 px-1 rounded">
              {assignOrder?.order_number}
            </span>
          </p>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-primary-900">
                Pilih Armada/Driver
              </label>
              <select
                className="w-full py-3 px-4 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-bold cursor-pointer"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                <option value="">Pilih Driver...</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAssign}
                className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                Tugaskan
              </button>
              <button
                onClick={() => setAssignModal(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={invoiceModal}
        onClose={() => setInvoiceModal(false)}
        title="Invoice Pesanan"
        size="xl"
      >
        <div className="p-6 bg-slate-50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <InvoiceTemplate invoice={selected?.invoice} order={selected} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default Orders
