import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      // Dispatch event — AuthContext atau App.jsx bisa listen ini
      // Hindari window.location.href agar React state tidak hilang semua
      window.dispatchEvent(new CustomEvent('auth:logout'))
    } else if (err.response?.status === 403) {
      toast.error('Akses ditolak.')
    } else if (err.response?.status === 422) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((e) => toast.error(e))
      } else {
        toast.error(message || 'Validasi gagal.')
      }
    } else if (err.response?.status >= 500) {
      toast.error('Terjadi kesalahan server.')
    }
    return Promise.reject(err)
  }
)

export default api
