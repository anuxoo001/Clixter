import { io } from 'socket.io-client';
import { API as API_URL } from '../../services/apiClient';

let socket = null;

export const connectSocket = (userId) => {
  socket = io(API_URL, {
    autoConnect: true,
    query: { userId },
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 500,
    timeout: 20000,
  });

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => socket?.disconnect();

