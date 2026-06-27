import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'retailer',
    phone: '',
    address: '',
    company_name: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      return toast.error('Password tidak cocok')
    }
    setLoading(true)
    try {
      const res = await api.post('/register', form)
      const { token, user } = res.data
      loginWithToken(user, token) // update global auth state + localStorage + axios header
      toast.success('Registrasi berhasil!')
      navigate(`/${user.role}`)
    } catch (err) {
      // Error toast is shown by api interceptor
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Daftar Akun 🔗 OrderLink
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nama Lengkap</label>
              <input
                className="input"
                value={form.name}
                onChange={set('name')}
                required
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={set('role')}
              >
                <option value="retailer">Retailer / Toko</option>
                <option value="driver">Driver / Kurir</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>
          {form.role === 'retailer' && (
            <div>
              <label className="label">Nama Toko / Perusahaan</label>
              <input
                className="input"
                value={form.company_name}
                onChange={set('company_name')}
              />
            </div>
          )}
          <div>
            <label className="label">Nomor HP</label>
            <input
              className="input"
              value={form.phone}
              onChange={set('phone')}
            />
          </div>
          <div>
            <label className="label">Alamat</label>
            <textarea
              className="input"
              rows={2}
              value={form.address}
              onChange={set('address')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={set('password')}
                required
              />
            </div>
            <div>
              <label className="label">Konfirmasi Password</label>
              <input
                type="password"
                className="input"
                value={form.password_confirmation}
                onChange={set('password_confirmation')}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="text-primary-600 font-medium hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
export default Register
