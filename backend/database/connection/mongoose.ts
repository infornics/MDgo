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
        serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
        socketTimeoutMS: 45000, // Socket timeout
        connectTimeoutMS: 30000, // Connection timeout
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

    // Check for IP whitelist issues or timeout issues
    if (
      error.message.includes("whitelist") ||
      error.message.includes("IP") ||
      error.message.includes("timed out") ||
      error.message.includes("timeout") ||
      error.name === "MongooseServerSelectionError"
    ) {
      console.error("\n🔒 IP WHITELIST ISSUE DETECTED");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("Your current IP address is not whitelisted in MongoDB Atlas.");
      console.error("\n📋 To fix this:");
      console.error("1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com/");
      console.error("2. Navigate to: Network Access → IP Access List");
      console.error("3. Click 'Add IP Address'");
      console.error("4. Option A: Add your current IP (recommended for development)");
      console.error("   - Click 'Add Current IP Address'");
      console.error("   - Click 'Confirm'");
      console.error("5. Option B: Allow all IPs (for development only, not secure)");
      console.error("   - Add IP: 0.0.0.0/0");
      console.error("   - Comment: 'Allow all IPs (DEV ONLY)'");
      console.error("   - Click 'Confirm'");
      console.error("\n⏱️  Wait 1-2 minutes for changes to propagate");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }

    // Check for timeout issues specifically
    if (error.message.includes("timed out") || error.message.includes("timeout")) {
      console.error("\n⏱️  CONNECTION TIMEOUT DETECTED");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("Possible causes:");
      console.error("1. IP address not whitelisted in MongoDB Atlas");
      console.error("2. Network connectivity issues");
      console.error("3. MongoDB Atlas cluster might be paused or unavailable");
      console.error("\n💡 Solutions:");
      console.error("- Check MongoDB Atlas dashboard for cluster status");
      console.error("- Verify your IP is whitelisted (see instructions above)");
      console.error("- Check your internet connection");
      console.error("- Try again in a few moments");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }

    // Explicit tip for SSL/TLS issues
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
