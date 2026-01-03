import dotenv from "dotenv";
import os from "os";

export const getLocalIpAddress = (): string | null => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    if (addresses) {
      for (const address of addresses) {
        if (address.family === "IPv4" && !address.internal) {
          return address.address;
        }
      }
    }
  }
  return null;
};

// Load environment variables from .env file if it exists
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const result = dotenv.config();
  if (result.error) {
    console.warn("⚠️  Error parsing .env file:", result.error);
  } else {
    console.log("✅ .env file loaded successfully");
  }
} else {
  // Silent fail - standard for cloud environments where env vars are provided via UI
  console.log("ℹ️  Using environment variables from system shell");
}
