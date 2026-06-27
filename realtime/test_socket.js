const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  query: { userId: 2 },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  socket.emit('subscribe:delivery', { orderId: 1 });
  console.log('📦 Subscribed to delivery room');
  
  setTimeout(() => {
    console.log('🔌 Disconnecting...');
    socket.close();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
