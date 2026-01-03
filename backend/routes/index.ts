import { Router } from "express";

// routes
import authRoutes from "./auth";
import documentRoutes from "./document";

// controllers
import { health, home } from "../controllers/base";

const baseRoutes = Router();

baseRoutes.get("/", home);
baseRoutes.get("/health", health);

// API routes
baseRoutes.use("/auth", authRoutes);
baseRoutes.use("/documents", documentRoutes);

export { baseRoutes };
