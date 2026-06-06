import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  const api = import.meta.env.VITE_API || undefined;

  // If VITE_API is missing, socket.io will throw; let caller handle via try/catch if needed.
  socket = io(api, {
    autoConnect: true,
    query: { userId },
    // Allow socket.io to choose the best transport (polling -> websocket fallback)
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 500,
    timeout: 20000,
  });

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => socket?.disconnect();

