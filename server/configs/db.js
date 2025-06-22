import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const db = mongoose.connection;

    db.on("error", (err) => {
      console.log("ERROR: DB is not connected correctly");
    });

    db.on("disconnected", () => {
      console.log("DB is disconnected successfully!!!");
    });

    db.on("connected", () => {
      console.log("DB is connected successfully!!!");
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error(error.message);
  }
};

export default connectDB;