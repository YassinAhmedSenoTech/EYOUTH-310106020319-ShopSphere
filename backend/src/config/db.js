import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // ❌ REMOVED: process.exit(1) — this kills Vercel serverless functions!
    throw error;
  }
};