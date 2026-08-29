import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connect to MongoDB with robust event handling and graceful lifecycle
 */
export async function connectDB(uri = env.MONGO_URI) {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`🔌 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully.');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB initial connection failed:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB gracefully
 */
export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed gracefully.');
  } catch (err) {
    console.error('❌ Error during MongoDB disconnection:', err.message);
  }
}

export default { connectDB, disconnectDB };
