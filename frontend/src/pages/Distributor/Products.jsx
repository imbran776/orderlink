import React, { useEffect, useState, useCallback } from 'react'
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdWarning,
  MdInventory,
} from 'react-icons/md'
import api from '../../services/api'
import { Skeleton, SkeletonTable } from '../../components/Common/Skeleton'
import ImageUpload from '../../components/Common/ImageUpload'
import Modal from '../../components/Common/Modal'
import Pagination from '../../components/Common/Pagination'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '',
  sku: '',
  category_id: '',
  price: '',
  wholesale_price: '',
  unit: 'pcs',
  stock: 0,
  min_stock: 10,
  description: '',
  image: null,
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/products', {
        params: { search: debouncedSearch, page },
      })
      setProducts(r.data.data || [])
      setPagination({
        current_page: r.data.current_page,
        last_page: r.data.last_page,
        per_page: r.data.per_page,
        total: r.data.total,
        from: r.data.from,
        to: r.data.to,
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page])

  const fetchCategories = useCallback(async () => {
    const r = await api.get('/categories')
    setCategories(r.data.data || [])
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openAdd = () => {
    setForm(EMPTY)
    setEditing(null)
    setModal(true)
  }
  const openEdit = (p) => {
    setForm({
      ...p,
      category_id: p.category?.id || '',
      image: p.image
        ? `${api.defaults.baseURL.replace('/api', '')}/storage/${p.image}`
        : null,
    })
    setEditing(p.id)
    setModal(true)
  }
  const set = (f) => (e) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      Object.keys(form).forEach((key) => {
        if (key === 'image' && form[key] instanceof File) {
          formData.append('image', form[key])
        } else if (key !== 'image' && form[key] !== null && form[key] !== '') {
          formData.append(key, form[key])
        }
      })

      if (editing) {
        await api.post(`/products/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { _method: 'PUT' },
        })
        toast.success('Produk diperbarui')
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Produk ditambahkan')
      }
      setModal(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus produk "${name}"?`)) return
    await api.delete(`/products/${id}`)
    toast.success('Produk dihapus')
    fetchProducts()
  }

  if (loading)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl" />
        </div>
        <SkeletonTable rows={6} cols={6} />
      </div>
    )

  return (
    <div className="space-y-8 pb-8">
      {/* Header section with gradient line */}
      <div className="relative pb-4 border-b border-primary-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">
            Katalog Produk
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1.5">
            Kelola item, harga grosir, dan persediaan stok.
          </p>
          <div className="absolute bottom-[-1px] left-0 w-24 h-[2px] bg-accent-500 rounded-full"></div>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
        >
          <MdAdd className="w-5 h-5" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
        {/* Search */}
        <div className="relative mb-6 group w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MdSearch className="text-gray-400 group-focus-within:text-accent-500 transition-colors w-5 h-5" />
          </div>
          <input
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-medium placeholder:text-gray-400"
            placeholder="Cari nama produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Item / SKU
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Kategori
                </th>
                <th className="py-3 px-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Harga Eceran
                </th>
                <th className="py-3 px-4 text-center font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Sisa Stok
                </th>
                <th className="py-3 px-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 hover:bg-primary-50 transition-colors group"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-4">
                      {p.image ? (
                        <img
                          src={`${api.defaults.baseURL.replace('/api', '')}/storage/${p.image}`}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                          <MdInventory className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="font-mono text-xs font-semibold text-gray-400">
                            {p.sku}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {p.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-bold uppercase tracking-wider">
                      {p.category?.name || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-mono font-bold text-gray-900">
                      Rp {Number(p.price).toLocaleString('id')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${p.is_low_stock ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}
                      >
                        {p.is_low_stock && (
                          <MdWarning className="w-3.5 h-3.5" />
                        )}
                        {p.stock}
                      </span>
                      {p.is_low_stock && (
                        <span className="text-[10px] font-bold text-red-500 mt-1 uppercase">
                          Stok Kritis
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-primary-900 hover:text-accent-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-accent-200 hover:shadow-sm"
                        title="Edit"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-red-200 hover:shadow-sm"
                        title="Hapus"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && (
            <div className="text-center py-16">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <MdInventory className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-primary-900 font-bold mb-1">
                Tidak ada produk
              </p>
              <p className="text-gray-500 text-sm font-medium">
                Katalog produk masih kosong atau pencarian tidak ditemukan.
              </p>
            </div>
          )}
        </div>

        {pagination && (
          <Pagination pagination={pagination} onPageChange={setPage} />
        )}
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Produk' : 'Tambah Produk Baru'}
        size="lg"
      >
        <form onSubmit={handleSave} className="p-0">
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-center">
              <ImageUpload
                label="Foto Produk"
                value={form.image}
                onChange={(file) =>
                  setForm((prev) => ({ ...prev, image: file }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary-900">
                  Nama Produk
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-medium"
                  value={form.name}
                  onChange={set('name')}
                  required
                  placeholder="Contoh: Kopi Bubuk 500g"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary-900">
                  Kategori
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-bold cursor-pointer"
                  value={form.category_id}
                  onChange={set('category_id')}
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      </option>
                  ))}
                      </select>
                      </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-primary-900">
                SKU (Stock Keeping Unit)
              </label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-mono"
                value={form.sku}
                onChange={set('sku')}
                required
                placeholder="SKU-XXXXXX"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-primary-50 rounded-xl border border-primary-100">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary-900">
                  Harga Eceran (Rp)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white border-2 border-transparent text-primary-900 rounded-xl focus:border-accent-500 focus:ring-0 transition-all font-mono font-bold"
                  value={form.price}
                  onChange={set('price')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary-900">
                  Harga Grosir (Rp)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white border-2 border-transparent text-primary-900 rounded-xl focus:border-accent-500 focus:ring-0 transition-all font-mono font-bold"
                  value={form.wholesale_price}
                  onChange={set('wholesale_price')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary-900">
                  Stok Saat Ini
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-mono"
                  value={form.stock}
                  onChange={set('stock')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary-900">
                  Batas Minimum Stok
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-mono text-amber-600 font-bold"
                  value={form.min_stock}
                  onChange={set('min_stock')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary-900">
                  Satuan
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-bold uppercase"
                  value={form.unit}
                  onChange={set('unit')}
                  placeholder="PCS / DUS"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-primary-900">
                Deskripsi Singkat
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent text-primary-900 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-0 transition-all font-medium resize-none"
                rows={3}
                value={form.description}
                onChange={set('description')}
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
              disabled={saving}
            >
              {saving ? 'Menyimpan Data...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all active:scale-[0.98]"
              onClick={() => setModal(false)}
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default Products
