import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Logo from '../../components/Common/Logo'
// TEMPORARILY REMOVED - Testing white screen issue
// import FloatingBlobs from '../../components/Brand/FloatingBlobs'
// import BrandPattern from '../../components/Brand/BrandPattern'
import {
  MdEmail,
  MdLock,
  MdArrowForward,
  MdCheckCircle,
  MdClose,
} from 'react-icons/md'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [buttonState, setButtonState] = useState('idle') // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setButtonState('loading')
    try {
      const user = await login(form.email, form.password)
      setButtonState('success')
      toast.success(`Selamat datang, ${user.name}!`)

      // Delay redirect sedikit agar user melihat feedback sukses
      setTimeout(() => {
        navigate(`/${user.role}`)
      }, 800)
    } catch (err) {
      setButtonState('error')
      toast.error(err.response?.data?.message || 'Login gagal')

      // Kembali ke idle setelah animasi error
      setTimeout(() => {
        setButtonState('idle')
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 selection:bg-teal-500 selection:text-white">
      {/* Left panel - Branding with Teal+Coral Brand Identity */}
      <div className="hidden lg:flex lg:w-5/12 bg-brand-gradient relative flex-col justify-between p-12 overflow-hidden border-r border-teal-700">
        {/* TEMPORARILY DISABLED - Testing white screen issue
        <FloatingBlobs variant="mixed" density="medium" />
        */}

        {/* TEMPORARILY DISABLED - Testing white screen issue
        <BrandPattern pattern="linkChain" color="teal" opacity="subtle" className="opacity-30" />
        */}

        <div className="relative z-10">
          <Logo className="w-12 h-12" textColor="text-white" />
        </div>

        <div className="relative z-10 space-y-8 max-w-md">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-coral-400 animate-pulse"></span>
              Sistem Aktif 99.9%
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight font-display">
              Distribusi Cepat,{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-teal-900 bg-white px-3 py-1 rounded-lg">
                  Profit Pasti
                </span>
                <span className="absolute inset-0 bg-coral-400 blur-md opacity-40 animate-pulse-slow"></span>
              </span>
            </h1>
            <p className="text-teal-50 mt-6 text-lg leading-relaxed font-medium">
              Platform B2B distribusi end-to-end dengan real-time tracking,
              multi-warehouse, dan smart routing dalam satu dashboard terpadu.
            </p>
          </div>

          <div className="space-y-4 pt-6">
            {[
              'Real-time order tracking & notifications',
              'Multi-role dashboard (Distributor, Retailer, Driver)',
              'GPS delivery tracking & proof of delivery',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-white group">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-coral-500/20 flex items-center justify-center group-hover:bg-coral-500/30 transition-colors">
                  <MdCheckCircle className="text-coral-400 w-5 h-5" />
                </div>
                <span className="font-medium text-teal-50">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-teal-100 text-sm font-medium">
          <p>© {new Date().getFullYear()} OrderLink.</p>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-white transition-colors hover:underline underline-offset-4"
            >
              Bantuan
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors hover:underline underline-offset-4"
            >
              Privasi
            </a>
          </div>
        </div>
      </div>

      {/* Right panel - Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white relative overflow-hidden">
        {/* TEMPORARILY DISABLED - Testing white screen issue
        <BrandPattern pattern="dots" color="teal" opacity="subtle" />
        */}

        <div className="w-full max-w-[440px] animate-slideUp relative z-10">
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo className="w-12 h-12" textColor="text-teal-900" />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-teal-900 tracking-tight font-display">
              Masuk ke Akun
            </h2>
            <p className="text-neutral-500 mt-2 text-base font-medium">
              Platform distribusi B2B end-to-end
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-teal-900">
                Alamat Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdEmail className="text-neutral-400 group-focus-within:text-teal-500 transition-colors w-5 h-5" />
                </div>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-2 border-transparent text-teal-900 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-0 transition-all font-medium placeholder:text-neutral-400 placeholder:font-normal"
                  placeholder="nama@perusahaan.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-teal-900">
                  Kata Sandi
                </label>
                <a
                  href="#"
                  className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors hover:underline underline-offset-4"
                >
                  Lupa sandi?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdLock className="text-neutral-400 group-focus-within:text-teal-500 transition-colors w-5 h-5" />
                </div>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-2 border-transparent text-teal-900 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-0 transition-all font-medium placeholder:text-neutral-400 placeholder:font-normal"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] ${
                buttonState === 'idle'
                  ? 'bg-coral-500 hover:bg-coral-600 text-white hover:shadow-coral hover:-translate-y-0.5'
                  : buttonState === 'loading'
                    ? 'bg-teal-500 text-white cursor-wait'
                    : buttonState === 'success'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white animate-shake'
              }`}
              disabled={buttonState !== 'idle'}
            >
              {buttonState === 'loading' && (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Mengautentikasi...
                </span>
              )}
              {buttonState === 'success' && (
                <span className="flex items-center justify-center gap-2">
                  <MdCheckCircle className="w-6 h-6" />
                  Berhasil! Membuka dashboard...
                </span>
              )}
              {buttonState === 'error' && (
                <span className="flex items-center justify-center gap-2">
                  <MdClose className="w-6 h-6" />
                  Gagal! Coba lagi
                </span>
              )}
              {buttonState === 'idle' && (
                <span className="flex items-center justify-center gap-2">
                  Masuk ke Dashboard <MdArrowForward className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-neutral-500 mt-8">
            Belum terdaftar sebagai mitra?{' '}
            <Link
              to="/register"
              className="text-teal-600 font-bold hover:text-teal-700 hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              Ajukan Akun Baru
            </Link>
          </p>

          {/* Demo Section with Brand Colors */}
          <div className="mt-12">
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                Akses Demo
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  role: 'Distributor',
                  email: 'admin@orderlink.com',
                  color:
                    'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100',
                },
                {
                  role: 'Retailer',
                  email: 'retailer@orderlink.com',
                  color:
                    'bg-coral-50 text-coral-900 border-coral-200 hover:bg-coral-100',
                },
                {
                  role: 'Driver',
                  email: 'driver@orderlink.com',
                  color:
                    'bg-neutral-100 text-neutral-900 border-neutral-200 hover:bg-neutral-200',
                },
              ].map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() =>
                    setForm({ email: a.email, password: 'password' })
                  }
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 group ${a.color}`}
                >
                  <p className="text-[11px] font-extrabold uppercase tracking-wide opacity-90 mb-0.5">
                    {a.role}
                  </p>
                  <p className="text-[10px] font-mono font-medium truncate opacity-70">
                    {a.email}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
