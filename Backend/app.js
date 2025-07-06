import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
const app = express();
import cookieParser from 'cookie-parser';
import connectToDB from './db/db.js';
import userRoutes from './routes/user.routes.js';

// Connect to database (non-blocking)
connectToDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));   // urlencoded is used to parse form data this is basically a middleware
app.use(cookieParser()); // Middleware to parse cookies

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;