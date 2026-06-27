import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        api
          .get('/profile')
          .then((res) => setUser(res.data.user))
          .catch(() => {
            localStorage.removeItem('token')
            delete api.defaults.headers.common['Authorization']
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }
    initAuth()

    // BUG 38 fix: listen to 401 event from api.js interceptor
    const handleLogout = () => setUser(null)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  // Dipakai oleh Register.jsx — set state langsung tanpa hit /login lagi
  const loginWithToken = (userData, token) => {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (err) {
      // Ignore logout errors - token cleanup happens regardless
    }
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const isDistributor = () => user?.role === 'distributor'
  const isRetailer = () => user?.role === 'retailer'
  const isDriver = () => user?.role === 'driver'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithToken,
        logout,
        isDistributor,
        isRetailer,
        isDriver,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
