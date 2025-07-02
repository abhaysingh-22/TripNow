import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
const app = express();
import connectToDB from './db/db.js';

// Connect to database (non-blocking)
connectToDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;