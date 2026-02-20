import "../utils/config";

export const PORT = process.env.PORT || 8000;

export const NODE_ENV = process.env.NODE_ENV || "development";

export const TIMESTAMP = new Date().toLocaleString("en-US", {
  timeZone: "Asia/Kolkata",
});

export const API_VERSION = process.env.API_VERSION || "1.0.0";

export const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : "*";

export const MONGO_URI = process.env.MONGO_URI;

export const JWT_SECRET = process.env.JWT_SECRET || "mdgo-secret-key-123";

export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

// OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
