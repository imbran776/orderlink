import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MdLocationOn, MdVisibility, MdSearch } from 'react-icons/md'
import api from '../../services/api'
import { SkeletonOrderList } from '../../components/Common/Skeleton'
import Pagination from '../../components/Common/Pagination'
import toast from 'react-hot-toast'

const badge = (s) => {
  const map = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    processing: 'badge-processing',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled',
  }
  const labels = {
    pending: 'Pending',
    confirmed: 'Dikonfirmasi',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Terkirim',
    cancelled: 'Dibatalkan',
  }
  return <span className={map[s]}>{labels[s] || s}</span>
}

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchOrders = useCallback(() => {
    setLoading(true)
    api
      .get('/my-orders', {
        params: {
          status: statusFilter,
          page: currentPage,
          search: debouncedSearch,
        },
      })
      .then((r) => {
        setOrders(r.data.data || [])
        setPagination(r.data.meta)
      })
      .finally(() => setLoading(false))
  }, [statusFilter, currentPage, debouncedSearch])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const cancelOrder = async (id) => {
    if (!confirm('Batalkan pesanan ini?')) return
    await api.delete(`/orders/${id}`)
    toast.success('Pesanan dibatalkan')
    fetchOrders()
  }

  if (loading) return <SkeletonOrderList />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
            </div>
            <input
              className="input w-full pl-10"
              placeholder="Cari no. order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full sm:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            {[
              'pending',
              'confirmed',
              'processing',
              'shipped',
              'delivered',
              'cancelled',
            ].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-mono font-bold text-primary-600">
                    {o.order_number}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {o.created_at?.substring(0, 16)}
                  </p>
                </div>
                <div className="text-right">
                  {badge(o.status)}
                  <p className="font-bold text-gray-900 mt-1">
                    Rp {Number(o.total_amount).toLocaleString('id')}
                  </p>
                </div>
              </div>

              {o.items?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  {o.items.slice(0, 2).map((item) => (
                    <p key={item.id} className="text-xs text-gray-500">
                      {item.product?.name} × {item.quantity}{' '}
                      {item.product?.unit}
                    </p>
                  ))}
                  {o.items.length > 2 && (
                    <p className="text-xs text-gray-400">
                      +{o.items.length - 2} item lainnya
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => setSelected(o)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <MdVisibility className="w-3 h-3" /> Detail
                </button>
                {o.status === 'shipped' && (
                  <Link
                    to={`/retailer/tracking/${o.id}`}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                  >
                    <MdLocationOn className="w-3 h-3" /> Lacak Pesanan
                  </Link>
                )}
                {['pending', 'confirmed'].includes(o.status) && (
                  <button
                    onClick={() => cancelOrder(o.id)}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          ))}
          {!orders.length && (
            <p className="text-center text-gray-400 py-10">
              Tidak ada pesanan.
            </p>
          )}
        </div>
        <Pagination pagination={pagination} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detail Pesanan</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-mono font-bold text-primary-600 text-sm">
                  {selected.order_number}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Alamat: {selected.delivery_address}
                </p>
                <p className="text-xs text-gray-500">
                  Status: {selected.status}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-700 mb-2">Item:</p>
                {selected.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-1.5 border-b last:border-0"
                  >
                    <span className="text-gray-700">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      Rp {Number(item.subtotal).toLocaleString('id')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2 pt-2 text-sm">
                  <span>Total</span>
                  <span className="text-primary-600">
                    Rp {Number(selected.total_amount).toLocaleString('id')}
                  </span>
                </div>
              </div>
              {selected.invoice && (
                <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                  <p className="font-medium">
                    Invoice:{' '}
                    <span className="font-mono">
                      {selected.invoice.invoice_number}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Jatuh tempo: {selected.invoice.due_date}
                  </p>
                  <span className={`badge-${selected.invoice.status}`}>
                    {selected.invoice.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default MyOrders
