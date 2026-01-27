import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

// locals and configs
import { CORS_ORIGINS, PORT } from "./constants/config";
import { getLocalIpAddress } from "./utils/config";
import { configureLogger } from "./utils/logger";

// Database
import connectDB from "./database/connection/mongoose";

// Routes
import {
  authRoutes,
  baseRoutes,
  docRoutes,
  projectRoutes,
  projectItemRoutes,
} from "./routes";

const app = express();

// Initialize Database
connectDB();

// Setup request logging with custom Morgan configuration
const logger = configureLogger();
if (Array.isArray(logger)) {
  logger.forEach((middleware) => app.use(middleware));
} else {
  app.use(logger);
}

app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-ID"],
    exposedHeaders: ["X-Session-ID"],
    credentials: true,
  })
);

// Parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use("/", baseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", projectItemRoutes);

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("🔥 Global Error Handler Caught:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
);

// start the server
const startServer = async () => {
  let currentPort = parseInt(PORT.toString());
  let maxRetries = 10;
  let retryCount = 0;

  const attemptListen = () => {
    return new Promise<void>((resolve, reject) => {
      const server = app
        .listen(currentPort)
        .on("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE" && retryCount < maxRetries) {
            retryCount++;
            currentPort++;
            console.log(
              `Port ${currentPort - 1} is in use, trying port ${currentPort}...`
            );
            server.close();
            attemptListen().then(resolve).catch(reject);
          } else {
            reject(err);
          }
        })
        .on("listening", () => {
          const ipAddress = getLocalIpAddress();
          console.log(`Server is up and running on port ${currentPort}`);
          console.log(`Local: http://localhost:${currentPort}`);
          if (ipAddress) {
            console.log(`Network: http://${ipAddress}:${currentPort}`);
          }
          resolve();
        });
    });
  };

  try {
    await attemptListen();
  } catch (error) {
    console.error(
      `Failed to start server after ${retryCount} retry attempts:`,
      error
    );
    process.exit(1);
  }
};

startServer();
