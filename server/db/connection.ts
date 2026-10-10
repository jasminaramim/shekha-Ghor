import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://shekhaghor:rPWxwIWRlWpj1uiQ@cluster0.ssmpl.mongodb.net/shekhaghor?retryWrites=true&w=majority&appName=Cluster0';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`[MongoDB] Connected to database: ${conn.connection.name || 'shekhaghor'}`);
    return true;
  } catch (error: any) {
    console.error('[MongoDB] Connection error:', error?.message || error);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
