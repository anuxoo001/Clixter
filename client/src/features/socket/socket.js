import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  const api = import.meta.env.VITE_API || undefined;
  socket = io(api, {
    query: { userId },
    transports: ['websocket'],
  });

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => socket?.disconnect();
