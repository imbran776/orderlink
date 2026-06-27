/**
 * OrderLink — Realtime Server
 * Stack: Node.js + Express + Socket.io + node-cron
 * Port: 3001
 */

const express = require('express')
const http    = require('http')
const { Server } = require('socket.io')
const cron    = require('node-cron')
const axios   = require('axios')
require('dotenv').config()

const app    = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://localhost:8000/api'

// ── Connected users map: userId -> socketId ──────────────────────────────────
const connectedUsers = new Map()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connected_users: connectedUsers.size,
    timestamp: new Date().toISOString(),
  })
})

// ── Socket.io ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId

  if (userId) {
    connectedUsers.set(String(userId), socket.id)
    console.log(`✅ User ${userId} connected — socket: ${socket.id}`)
  }

  // ── Driver subscribed to a delivery room ───────────────────────────────────
  socket.on('subscribe:delivery', ({ orderId }) => {
    const room = `delivery:${orderId}`
    socket.join(room)
    console.log(`📦 Socket ${socket.id} joined room: ${room}`)
  })

  socket.on('unsubscribe:delivery', ({ orderId }) => {
    socket.leave(`delivery:${orderId}`)
  })

  // ── Driver sends location update ───────────────────────────────────────────
  socket.on('driver:location', ({ orderId, lat, lng, deliveryId }) => {
    console.log(`📍 Driver location update — order:${orderId} [${lat}, ${lng}]`)

    // Broadcast to all clients tracking this order
    io.to(`delivery:${orderId}`).emit(`delivery:update:${orderId}`, {
      location: { lat, lng },
      timestamp: new Date().toISOString(),
    })

    // Also persist to Laravel API (non-blocking)
    if (deliveryId) {
      const token = socket.handshake.auth?.token
      axios.post(`${LARAVEL_API}/deliveries/${deliveryId}/location`,
        { lat, lng },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      ).catch(err => console.error('Location API error:', err.message))
    }
  })

  // ── Delivery status changed ────────────────────────────────────────────────
  socket.on('delivery:status', ({ orderId, status, statusLabel }) => {
    console.log(`🚚 Delivery status — order:${orderId} → ${status}`)
    io.to(`delivery:${orderId}`).emit(`delivery:update:${orderId}`, {
      status,
      statusLabel,
      timestamp: new Date().toISOString(),
    })
  })

  // ── Disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    if (userId) {
      connectedUsers.delete(String(userId))
      console.log(`❌ User ${userId} disconnected`)
    }
  })
})

// ── Helper: emit notification to specific user ────────────────────────────────
const notifyUser = (userId, payload) => {
  const socketId = connectedUsers.get(String(userId))
  if (socketId) {
    io.to(socketId).emit(`notification:${userId}`, payload)
    console.log(`🔔 Notification sent to user ${userId}`)
  }
}

// ── Expose notifyUser for external calls (internal only) ─────────────────────
app.post('/notify', (req, res) => {
  // Validasi internal key agar endpoint tidak bisa diakses sembarang orang
  const internalKey = req.headers['x-internal-key']
  if (internalKey !== (process.env.INTERNAL_API_KEY || 'orderlink-internal')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { userId, title, message, type, referenceId } = req.body
  if (!userId || !title) {
    return res.status(400).json({ error: 'userId and title required' })
  }

  notifyUser(userId, { title, message, type, referenceId, timestamp: new Date().toISOString() })
  res.json({ sent: true })
})

// ── Cron Jobs ─────────────────────────────────────────────────────────────────

// Helper: get cron service token from Laravel (distributor account)
const getCronToken = async () => {
  try {
    const res = await axios.post(`${LARAVEL_API}/login`, {
      email:    process.env.CRON_EMAIL    || 'admin@orderlink.com',
      password: process.env.CRON_PASSWORD || 'password',
      cron:     true,
    })
    return res.data?.token
  } catch (err) {
    console.error('[CRON] Login failed:', err.message)
    return null
  }
}

// Every day at 08:00 — check & mark overdue invoices
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ [CRON] Checking overdue invoices...')
  const token = await getCronToken()
  if (!token) return console.error('[CRON] Skipped: no token')
  try {
    const res = await axios.get(`${LARAVEL_API}/invoices?status=unpaid`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const invoices = res.data?.data || []
    console.log(`📋 [CRON] Found ${invoices.length} unpaid invoices`)
    // Notify each retailer with overdue invoices
    invoices.forEach(inv => {
      const retailerId = inv.order?.retailer?.id
      if (retailerId) {
        notifyUser(retailerId, {
          title:   'Pengingat Invoice',
          message: `Invoice ${inv.invoice_number} belum dibayar. Jatuh tempo: ${inv.due_date}`,
          type:    'invoice',
        })
      }
    })
  } catch (err) {
    console.error('[CRON] Invoice check error:', err.message)
  }
})

// Every day at 09:00 — send delivery reminders for scheduled orders
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ [CRON] Sending scheduled delivery reminders...')
  const token = await getCronToken()
  if (!token) return
  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await axios.get(`${LARAVEL_API}/orders?status=confirmed`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const orders = res.data?.data || []
    const todayOrders = orders.filter(o => o.scheduled_delivery === today)
    console.log(`📦 [CRON] ${todayOrders.length} orders scheduled for today`)
  } catch (err) {
    console.error('[CRON] Reminder error:', err.message)
  }
})

// Every 5 minutes — log active connections + alert if >500
cron.schedule('*/5 * * * *', () => {
  const count = connectedUsers.size
  console.log(`📊 [STATS] Connected users: ${count}`)
  if (count > 500) {
    console.warn(`⚠️ [ALERT] Connection limit exceeded: ${count}/500`)
  }
})

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`\n🚀 OrderLink Realtime Server running on port ${PORT}`)
  console.log(`📡 Socket.io ready`)
  console.log(`⏰ Cron jobs scheduled\n`)
})

module.exports = { app, server, io, notifyUser }
