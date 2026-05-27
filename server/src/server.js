import dotenv from "dotenv"
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import messageRoute from './routes/message.route.js'
import postRoute from './routes/post.route.js'
import userRoute from './routes/user.route.js';
import { app, server } from "./config/socket.js";


dotenv.config()
// const app = express();

// Enable CORS — place this BEFORE your routes
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // if you send cookies/auth tokens
}));

// Middleware to parse JSON
app.use(express.json());

app.use(cookieParser());

// Connect to database
connectDB();

// Define routes
app.use('/api/message', messageRoute);
app.use('/api/post', postRoute);
app.use('/api/user', userRoute);

// Global error handler
app.use(errorHandler);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
