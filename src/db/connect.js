import mongoose, { mongo } from 'mongoose';
import { DB_NAME, MONGODB_URI } from '../constants.js';
// promises
// callback
// async await
const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB is already connected');
      return mongoose.connection;
    }

    // Check if connection string is valid
    if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB connection string format');
    }

    const connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected \n`, connectionInstance.connection.host);
    return connectionInstance;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
