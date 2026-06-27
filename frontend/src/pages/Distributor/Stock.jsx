import React, { useEffect, useState, useCallback } from 'react'
import { MdWarning, MdAdd, MdRemove } from 'react-icons/md'
import api from '../../services/api'
import { SkeletonStock } from '../../components/Common/Skeleton'
import Pagination from '../../components/Common/Pagination'
import toast from 'react-hot-toast'

const Stock = () => {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    product_id: '',
    type: 'in',
    quantity: 1,
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const fetchStock = useCallback(async () => {
    setLoading(true)
    api
      .get('/stocks', { params: { page } })
      .then((r) => {
        setProducts(r.data.data || [])
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
    fetchStock()
  }, [fetchStock])

  const openAdjust = (p, type) => {
    setForm({
      product_id: p.id,
      product_name: p.name,
      type,
      quantity: 1,
      notes: '',
    })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/stocks/adjustment', form)
      toast.success('Stok berhasil disesuaikan')
      setModal(false)
      fetchStock()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <SkeletonStock />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok</h1>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Produk</th>
                <th className="pb-3 pr-4">SKU</th>
                <th className="pb-3 pr-4">Stok Saat Ini</th>
                <th className="pb-3 pr-4">Min. Stok</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className={p.is_low_stock ? 'bg-red-50' : 'hover:bg-gray-50'}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {p.is_low_stock && (
                        <MdWarning className="text-red-500 w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-gray-500">{p.sku}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`font-bold text-lg ${p.is_low_stock ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {p.stock}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">{p.unit}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {p.min_stock} {p.unit}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAdjust(p, 'in')}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <MdAdd className="w-3 h-3" /> Masuk
                      </button>
                      <button
                        onClick={() => openAdjust(p, 'out')}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <MdRemove className="w-3 h-3" /> Keluar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && (
            <p className="text-center text-gray-400 py-10">Tidak ada produk.</p>
          )}

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-1">Penyesuaian Stok</h2>
            <p className="text-sm text-gray-500 mb-4">
              {form.product_name} —{' '}
              <span
                className={
                  form.type === 'in'
                    ? 'text-green-600 font-medium'
                    : 'text-red-600 font-medium'
                }
              >
                {form.type === 'in' ? 'Stok Masuk' : 'Stok Keluar'}
              </span>
            </p>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Jumlah</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Catatan</label>
                <textarea
                  className="input"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-lg text-white font-medium ${form.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setModal(false)}
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
export default Stock
