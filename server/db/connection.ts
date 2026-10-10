import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://shekhaghor:rPWxwIWRlWpj1uiQ@cluster0.ssmpl.mongodb.net/shekhaghor?retryWrites=true&w=majority&appName=Cluster0';

let isConnected = false;

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (isConnected) {
    return true;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
  }

  try {
    const conn = await cachedPromise;
    isConnected = !!conn.connection.readyState;
    console.log(`[MongoDB] Connected to database: ${conn.connection.name || 'shekhaghor'}`);
    return true;
  } catch (error: any) {
    console.error('[MongoDB] Connection error:', error?.message || error);
    cachedPromise = null;
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
