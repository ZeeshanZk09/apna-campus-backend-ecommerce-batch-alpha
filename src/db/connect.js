import mongoose from 'mongoose';

const connectDB = () => {
  try {
    mongoose.connect(process.env?.MONGODB_URI ?? 'mongodb://localhost:27017');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
