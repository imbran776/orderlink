import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  MdLocationOn,
  MdCameraAlt,
  MdCheckCircle,
  MdWarning,
  MdDeliveryDining,
} from 'react-icons/md'
import api from '../../services/api'
import { SkeletonDeliveryList } from '../../components/Common/Skeleton'
import Pagination from '../../components/Common/Pagination'
import toast from 'react-hot-toast'

const statusFlow = {
  assigned: 'picked_up',
  picked_up: 'on_the_way',
  on_the_way: 'delivered',
}
const statusLabel = {
  assigned: 'Ditugaskan',
  picked_up: 'Diambil',
  on_the_way: 'Dalam Perjalanan',
  delivered: 'Terkirim',
  failed: 'Gagal',
}
const statusColor = {
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-purple-100 text-purple-800',
  on_the_way: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}
const nextLabel = {
  assigned: 'Tandai Diambil',
  picked_up: 'Mulai Pengiriman',
  on_the_way: 'Konfirmasi Terkirim',
}

const DriverDeliveries = () => {
  const [deliveries, setDeliveries] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [podModal, setPodModal] = useState(null)
  const [podForm, setPodForm] = useState({
    recipient_name: '',
    notes: '',
    photo: null,
  })
  const [uploading, setUploading] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const trackingRef = useRef(null) // BUG 20 fix: useRef instead of useState, no stale closure
  const fileRef = useRef()

  const fetchDeliveries = useCallback(() => {
    // BUG 19 fix: renamed from fetch
    setLoading(true)
    api
      .get('/my-deliveries', { params: { page } })
      .then((r) => {
        setDeliveries(r.data.data || [])
        setPagination({
          current_page: r.data.current_page,
          last_page: r.data.last_page,
          per_page: r.data.per_page,
          total: r.data.total,
          from: r.data.from,
          to: r.data.to,
        })
      })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  // Auto-send GPS for active deliveries
  useEffect(() => {
    if (!navigator.geolocation) return
    const active = deliveries.find((d) => d.status === 'on_the_way')

    // BUG 20 fix: read ref directly — no stale closure, always sees current interval id
    if (!active) {
      if (trackingRef.current) {
        clearInterval(trackingRef.current)
        trackingRef.current = null
        setIsTracking(false)
      }
      return
    }

    if (trackingRef.current) return // interval sudah berjalan, jangan buat lagi

    setIsTracking(true)
    trackingRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        api
          .post(`/deliveries/${active.id}/location`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
          .catch(() => {})
      })
    }, 15000)

    return () => {
      if (trackingRef.current) {
        clearInterval(trackingRef.current)
        trackingRef.current = null
        setIsTracking(false)
      }
    }
  }, [deliveries])

  const updateStatus = async (delivery) => {
    const next = statusFlow[delivery.status]
    if (!next) return

    if (next === 'delivered') {
      setPodModal(delivery)
      return
    }

    setUpdating(delivery.id)
    try {
      await api.put(`/deliveries/${delivery.id}/status`, { status: next })
      toast.success(`Status diperbarui: ${statusLabel[next]}`)
      fetchDeliveries()
    } finally {
      setUpdating(null)
    }
  }

  const handlePOD = async (e) => {
    e.preventDefault()
    if (!podForm.photo) return toast.error('Upload foto bukti terlebih dahulu')
    if (!podForm.recipient_name) return toast.error('Nama penerima harus diisi')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', podForm.photo)
      formData.append('recipient_name', podForm.recipient_name)
      formData.append('notes', podForm.notes)
      await api.post(`/deliveries/${podModal.id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Pengiriman dikonfirmasi berhasil! ✅')
      setPodModal(null)
      setPodForm({ recipient_name: '', notes: '', photo: null })
      fetchDeliveries()
    } finally {
      setUploading(false)
    }
  }

  const markFailed = async (delivery) => {
    if (!confirm('Tandai pengiriman ini sebagai gagal?')) return
    await api.put(`/deliveries/${delivery.id}/status`, {
      status: 'failed',
      notes: 'Pengiriman gagal',
    })
    toast.success('Pengiriman ditandai gagal')
    fetchDeliveries()
  }

  const sendLocation = (delivery) => {
    if (!navigator.geolocation) return toast.error('Geolocation tidak didukung')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        api
          .post(`/deliveries/${delivery.id}/location`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
          .then(() => toast.success('Lokasi berhasil dikirim ✅'))
      },
      () => toast.error('Gagal mendapatkan lokasi')
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengiriman Saya</h1>

      {isTracking && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm text-green-700 font-medium">
            Lokasi GPS sedang dikirim otomatis setiap 15 detik
          </p>
        </div>
      )}

      {loading ? (
        <SkeletonDeliveryList />
      ) : (
        <div className="space-y-4">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className={`card ${d.status === 'on_the_way' ? 'border-2 border-indigo-200 bg-indigo-50/30' : ''}`}
            >
              {d.status === 'on_the_way' && (
                <div className="flex items-center gap-2 mb-3 text-indigo-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Sedang Berlangsung
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-primary-600">
                    {d.order?.order_number}
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {d.order?.retailer?.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">
                    {d.order?.delivery_address}
                  </p>
                  {d.order?.retailer?.phone && (
                    <a
                      href={`tel:${d.order.retailer.phone}`}
                      className="text-xs text-primary-600 hover:underline mt-1 block"
                    >
                      📞 {d.order.retailer.phone}
                    </a>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor[d.status]}`}
                >
                  {statusLabel[d.status]}
                </span>
              </div>

              {/* Order items summary */}
              {d.order?.items?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Isi Paket:
                  </p>
                  {d.order.items.slice(0, 3).map((item) => (
                    <p key={item.id} className="text-xs text-gray-500">
                      • {item.product?.name} × {item.quantity}
                    </p>
                  ))}
                  {d.order.items.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{d.order.items.length - 3} item lainnya
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              {!['delivered', 'failed'].includes(d.status) && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {statusFlow[d.status] && (
                    <button
                      onClick={() => updateStatus(d)}
                      disabled={updating === d.id}
                      className="flex items-center gap-1.5 btn-primary text-sm"
                    >
                      <MdCheckCircle className="w-4 h-4" />
                      {updating === d.id ? 'Memproses...' : nextLabel[d.status]}
                    </button>
                  )}
                  {d.status === 'on_the_way' && (
                    <button
                      onClick={() => sendLocation(d)}
                      className="flex items-center gap-1.5 text-sm px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                    >
                      <MdLocationOn className="w-4 h-4" /> Kirim Lokasi
                    </button>
                  )}
                  <button
                    onClick={() => markFailed(d)}
                    className="flex items-center gap-1.5 text-sm px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <MdWarning className="w-4 h-4" /> Gagal
                  </button>
                </div>
              )}

              {d.status === 'delivered' && d.proof && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-green-600">
                  <MdCheckCircle className="w-4 h-4" />
                  <span className="text-xs">
                    Terkirim ke {d.proof.recipient_name}
                  </span>
                </div>
              )}
            </div>
          ))}
          {!deliveries.length && (
            <div className="card text-center py-16 text-gray-400">
              <MdDeliveryDining className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada pengiriman yang ditugaskan.</p>
            </div>
          )}

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </div>
      )}

      {/* POD Modal */}
      {podModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-1">
              Konfirmasi Pengiriman
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Order:{' '}
              <span className="font-mono font-bold">
                {podModal.order?.order_number}
              </span>
            </p>
            <form onSubmit={handlePOD} className="space-y-4">
              <div>
                <label className="label">Nama Penerima *</label>
                <input
                  className="input"
                  placeholder="Siapa yang menerima?"
                  value={podForm.recipient_name}
                  onChange={(e) =>
                    setPodForm({ ...podForm, recipient_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Foto Bukti Pengiriman *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition"
                >
                  {podForm.photo ? (
                    <div>
                      <img
                        src={URL.createObjectURL(podForm.photo)}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {podForm.photo.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <MdCameraAlt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Tap untuk upload foto
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) =>
                    setPodForm({ ...podForm, photo: e.target.files[0] })
                  }
                />
              </div>
              <div>
                <label className="label">Catatan (opsional)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={podForm.notes}
                  onChange={(e) =>
                    setPodForm({ ...podForm, notes: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={uploading}
                >
                  {uploading ? 'Mengupload...' : '✅ Konfirmasi Terkirim'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setPodModal(null)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default DriverDeliveries
