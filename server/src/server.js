  import dotenv from "dotenv"
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import messageRoute from './routes/message.route.js'
import postRoute from './routes/post.route.js'
import userRoute from './routes/user.route.js';
import reactionRoute from './routes/reaction.route.js'
import { app, server } from "./config/socket.js";
import startPublishScheduler from './cron/publishScheduled.js';


dotenv.config()
// const app = express();

// Enable CORS — place this BEFORE your routes
const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:5175', 'https://clixter.vercel.app'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());

app.use(cookieParser());

// Connect to database
connectDB();

// Define routes
app.use('/api/message', messageRoute);
app.use('/api/post', postRoute);
app.use('/api/user', userRoute);
app.use('/api/reaction', reactionRoute);

// Global error handler
app.use(errorHandler);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the existing server or change PORT.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // start scheduled post publisher
  startPublishScheduler();
});
