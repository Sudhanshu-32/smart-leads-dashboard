import mongoose from 'mongoose';

// Why a separate file? So we can import this anywhere and not repeat
// the connection logic. It also makes testing easier.
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit the process so Docker/PM2 can restart it
    process.exit(1);
  }
};

export default connectDB;
