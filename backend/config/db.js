import mongoose from "mongoose";

const connectDB = async () => {
  console.log("MongoDB URI:", process.env.MONGODB_URI);
  try {
    const conn = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(`mongodb connected ${conn.connection.host}`);
  } catch (error) {
    console.log(`error is ${error.message}`);
    process.exit();
  }
};

export default connectDB;
