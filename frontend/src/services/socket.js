import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let socket = null

export const connectSocket = (userId) => {
  // BUG 42 fix: jika socket ada tapi tidak connected, disconnect dulu sebelum buat baru
  if (socket) {
    if (socket.connected) return socket
    socket.disconnect()
    socket = null
  }

  socket = io(SOCKET_URL, {
    auth: { token: localStorage.getItem('token') },
    query: { userId },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => console.log('Socket connected:', socket.id))
  socket.on('disconnect', () => console.log('Socket disconnected'))
  socket.on('connect_error', (err) =>
    console.error('Socket error:', err.message)
  )

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

export const subscribeToDelivery = (orderId, callback) => {
  if (!socket) return

  const doSubscribe = () => {
    socket.emit('subscribe:delivery', { orderId })
    socket.on(`delivery:update:${orderId}`, callback)
  }

  // Jika sudah connect langsung subscribe, jika belum tunggu event connect
  if (socket.connected) {
    doSubscribe()
  } else {
    socket.once('connect', doSubscribe)
  }
}

export const unsubscribeFromDelivery = (orderId) => {
  if (!socket) return
  socket.emit('unsubscribe:delivery', { orderId })
  socket.off(`delivery:update:${orderId}`)
}

export const subscribeToNotifications = (userId, callback) => {
  if (!socket) return
  socket.on(`notification:${userId}`, callback)
}
