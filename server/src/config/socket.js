import {Server} from 'socket.io'
import express from 'express'
import http from 'http'

const app = express()

const server = http.createServer(app)

const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173,http://localhost:5175')
  .split(',')
  .map((s) => s.trim())

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('.onrender.com')) return true;
  return false;
}

const io = new Server(server, {
    cors: {
        origin: isAllowedOrigin,
        methods: ['GET', 'POST'],
    }
})

const userSocketMap = {};

export const getSocketId = (receiverId) => {
    const sockets = userSocketMap[receiverId];
    return Array.isArray(sockets) && sockets.length > 0 ? sockets[0] : undefined;
}

const emitToUser = (userId, event, payload) => {
    const sockets = userSocketMap[userId];
    if (Array.isArray(sockets)) {
        sockets.forEach((id) => io.to(id).emit(event, payload));
    }
}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    if(userId){
        if (!userSocketMap[userId]) userSocketMap[userId] = [];
        userSocketMap[userId].push(socket.id);
        console.log(`User connected: userId = ${userId} , socketId = ${socket.id}`)
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on('typing', (data) => {
        const { receiverId } = data || {};
        if (receiverId) emitToUser(receiverId, 'typing', { senderId: userId, receiverId });
    });

    socket.on('stopTyping', (data) => {
        const { receiverId } = data || {};
        if (receiverId) emitToUser(receiverId, 'stopTyping', { senderId: userId, receiverId });
    });

    socket.on('messageSeen', (data) => {
        const { receiverId } = data || {};
        if (receiverId) emitToUser(receiverId, 'messageSeen', { chatWith: userId, receiverId });
    });

    socket.on('disconnect', () => {
        if(userId){
            console.log(`User disconnected: userId = ${userId} , socketId = ${socket.id}`)
            const sockets = userSocketMap[userId] || [];
            userSocketMap[userId] = sockets.filter((id) => id !== socket.id);
            if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})

export {app, server, io}