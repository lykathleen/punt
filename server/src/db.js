import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/punt_hello_world";

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 3000
  });
}

export function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}
