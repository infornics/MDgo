import mongoose from "mongoose";
import { MONGO_URI } from "../../constants/config";

let cached = (global as any).mongoose || { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) {
    console.log("ℹ️  Using cached DB connection");
    return cached.conn;
  }

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in the environment variables");
    throw new Error("MONGO_URI is missing in environment");
  }

  // Mask sensitive parts of URI for logging
  const sanitizedUri = MONGO_URI.replace(
    /\/\/([^:]+):([^@]+)@/,
    "//***:***@"
  ).split("?")[0];

  console.log(`📡 Attempting to connect to MongoDB: ${sanitizedUri}...`);

  try {
    cached.promise =
      cached.promise ||
      mongoose.connect(MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });

    cached.conn = await cached.promise;
    console.log("✅ New MongoDB connection established");
    return cached.conn;
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", {
      message: error.message,
      code: error.code,
      name: error.name,
    });

    // Explicit tip for common cloud issues
    if (error.message.includes("SSL") || error.message.includes("TLsv1")) {
      console.error(
        "💡 TIP: Verify your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access."
      );
    }

    cached.promise = null; // Reset for retry
    throw error;
  }
};

export default connectDB;
