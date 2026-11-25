import mongoose from 'mongoose';

export async function connectDB() {
  // Accept the common MONGODB_URI spelling as well as the documented MONGO_URI.
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('Set MONGO_URI (or MONGODB_URI) in server/.env');
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
