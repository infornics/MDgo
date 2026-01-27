import { Router } from "express";
import { getProfile, login, register } from "../controllers/auth";
import { protect } from "../utils/auth";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/profile", protect, getProfile);

export default authRoutes;
