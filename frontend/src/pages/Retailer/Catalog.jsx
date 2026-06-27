import React, { useEffect, useState } from 'react'
import { MdSearch, MdShoppingCart, MdAdd, MdRemove, MdDelete, MdClose } from 'react-icons/md'
import api from '../../services/api'
import { SkeletonCatalog } from '../../components/Common/Skeleton'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const Catalog = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderModal, setOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({
    delivery_address: user?.address || '',
    notes: '',
    scheduled_delivery: '',
  })
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data || []))
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      api
        .get('/products', {
          params: { search: debouncedSearch, category_id: catFilter },
        })
        .then((r) => setProducts(r.data.data || []))
        .finally(() => setLoading(false))
    }
    fetchProducts()
  }, [debouncedSearch, catFilter])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing)
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      return [...prev, { product, qty: 1 }]
    })
    toast.success(`${product.name} ditambahkan`, { duration: 1200 })
  }

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === productId
            ? { ...c, qty: Math.max(0, c.qty + delta) }
            : c
        )
        .filter((c) => c.qty > 0)
    )
  }

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((c) => c.product.id !== productId))

  const cartTotal = cart.reduce(
    (sum, c) => sum + (c.product.wholesale_price ?? c.product.price) * c.qty,
    0
  )
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!cart.length) return toast.error('Keranjang kosong')
    setPlacing(true)
    try {
      await api.post('/orders', {
        items: cart.map((c) => ({ product_id: c.product.id, quantity: c.qty })),
        delivery_address: orderForm.delivery_address,
        notes: orderForm.notes,
        scheduled_delivery: orderForm.scheduled_delivery || undefined,
      })
      toast.success('Pesanan berhasil dibuat!')
      setCart([])
      setOrderModal(false)
      setCartOpen(false)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Katalog Produk</h1>
          <p className="text-gray-500 text-sm mt-1">
            Temukan produk yang Anda butuhkan
          </p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="btn-primary relative"
        >
          <MdShoppingCart className="w-5 h-5" />
          Keranjang
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="input pl-10"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-full sm:w-52"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonCatalog />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const inCart = cart.find((c) => c.product.id === p.id)
            return (
              <div key={p.id} className="card-hover flex flex-col">
                <div className="aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                  {p.image ? (
                    <img
                      src={`${api.defaults.baseURL.replace('/api', '')}/storage/${p.image}`}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        Stok Habis
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <p className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    {p.category?.name} · {p.unit}
                  </p>

                  <div className="mb-3">
                    {p.wholesale_price && p.wholesale_price < p.price && (
                      <p className="text-xs text-gray-400 line-through">
                        Rp {Number(p.price).toLocaleString('id')}
                      </p>
                    )}
                    <p className="text-blue-600 font-bold text-base">
                      Rp{' '}
                      {Number(p.wholesale_price ?? p.price).toLocaleString(
                        'id'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.stock > p.min_stock
                          ? 'text-emerald-700 bg-emerald-50'
                          : p.stock > 0
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-red-700 bg-red-50'
                      }`}
                    >
                      Stok: {p.stock}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQty(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <MdRemove className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">
                          {inCart.qty}
                        </span>
                        <button
                          onClick={() => updateQty(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                        >
                          <MdAdd className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stock === 0}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
                      >
                        <MdAdd className="w-3.5 h-3.5" /> Tambah
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {!products.length && (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-400 font-medium">
                Tidak ada produk ditemukan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="w-full max-w-sm bg-white flex flex-col shadow-2xl animate-slideInRight">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Keranjang</h2>
                <p className="text-xs text-gray-400">
                  {cartCount} item dipilih
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.length === 0 && (
                <div className="text-center py-12">
                  <MdShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    Keranjang masih kosong.
                  </p>
                </div>
              )}
              {cart.map((c) => (
                <div
                  key={c.product.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {c.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rp{' '}
                      {Number(
                        c.product.wholesale_price ?? c.product.price
                      ).toLocaleString('id')}{' '}
                      / {c.product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQty(c.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <MdRemove className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">
                      {c.qty}
                    </span>
                    <button
                      onClick={() => updateQty(c.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                    >
                      <MdAdd className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(c.product.id)}
                    className="text-gray-300 hover:text-red-500 transition"
                  >
                    <MdDelete className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex justify-between mb-4 px-1">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-lg text-blue-600">
                    Rp {Number(cartTotal).toLocaleString('id')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false)
                    setOrderModal(true)
                  }}
                  className="btn-primary w-full py-3"
                >
                  Pesan Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">Konfirmasi Pesanan</h2>
              <button
                onClick={() => setOrderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 rounded-2xl p-4 mb-5 border border-blue-100">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  {cartCount} item — Total:{' '}
                  <span className="text-blue-600">
                    Rp {Number(cartTotal).toLocaleString('id')}
                  </span>
                </p>
                {cart.map((c) => (
                  <p key={c.product.id} className="text-xs text-blue-600">
                    {c.product.name} × {c.qty}
                  </p>
                ))}
              </div>
              <form onSubmit={handleOrder} className="space-y-4">
                <div>
                  <label className="label">Alamat Pengiriman</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={orderForm.delivery_address}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        delivery_address: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    Jadwal Pengiriman{' '}
                    <span className="text-gray-400 font-normal">
                      (opsional)
                    </span>
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={orderForm.scheduled_delivery}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        scheduled_delivery: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label">
                    Catatan{' '}
                    <span className="text-gray-400 font-normal">
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    value={orderForm.notes}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    className="btn-primary flex-1 py-3"
                    disabled={placing}
                  >
                    {placing ? 'Memproses...' : 'Buat Pesanan'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setOrderModal(false)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Catalog
