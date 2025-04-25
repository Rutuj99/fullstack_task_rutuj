let socket;

export const connectSocket = () => {
  socket = new WebSocket(
    window.location.protocol === 'https:'
      ? 'wss://your-backend-domain.com' 
      : 'ws://localhost:3000'
  );

  socket.onopen = () => {
    console.log('✅ WebSocket connected');
  };

  socket.onerror = (err) => {
    console.error('❌ WebSocket error:', err);
  };
};

export const getSocket = () => socket;
