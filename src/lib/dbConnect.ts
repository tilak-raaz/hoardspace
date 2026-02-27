import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // Check if already connected
  if (connection.isConnected) {
    console.log('Using existing database connection');
    return;
  }

  // Check if mongoose has an active connection
  if (mongoose.connections[0]?.readyState === 1) {
    connection.isConnected = mongoose.connections[0].readyState;
    console.log('Using existing mongoose connection');
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment variables');
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('Database connected successfully');
  } catch (error: any) {
    console.error('Database connection failed:', error.message);
    connection.isConnected = 0;
    throw new Error(`DB Connection Error: ${error.message}`);
  }
}

export default dbConnect;