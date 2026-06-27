import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MdNotifications, MdCheck } from 'react-icons/md'
import api from '../../services/api'
import { connectSocket, subscribeToNotifications } from '../../services/socket'
import { useAuth } from '../../context/AuthContext'

const NotificationDropdown = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const r = await api.get('/notifications')
      setNotifications(r.data.data || [])
      setUnreadCount(r.data.data?.filter((n) => !n.is_read).length || 0)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications()

    connectSocket(user.id)
    const unsubscribe = subscribeToNotifications(user.id, () => {
      fetchNotifications()
    })
    return () => unsubscribe && unsubscribe()
  }, [user, fetchNotifications])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (e) {
      console.error(e)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 60) return `${mins}m yang lalu`
    if (hours < 24) return `${hours}j yang lalu`
    if (days === 1) return 'Kemarin'
    return date.toLocaleDateString('id-ID')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <MdNotifications className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full animate-bounce"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-slideUp origin-top-right">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex gap-3
                      ${!n.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                  >
                    <div
                      className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-primary-500' : 'bg-transparent'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(n.id)
                        }}
                        className="text-gray-400 hover:text-primary-600 p-1"
                        title="Tandai dibaca"
                      >
                        <MdCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
