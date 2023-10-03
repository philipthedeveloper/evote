import mongoose from "mongoose";

const connectDB = async (callback) => {
  try {
    let connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the database");
    if (callback) callback();
  } catch (error) {
    console.log("An error occured during db connection");
    console.log(error);
  }
};

export default connectDB;
