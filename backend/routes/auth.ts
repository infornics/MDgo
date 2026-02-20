import { Router } from "express";
import passport from "../utils/passport";
import { getProfile, login, register } from "../controllers/auth";
import { googleCallback, githubCallback } from "../controllers/oauth";
import { protect } from "../utils/auth";

const authRoutes = Router();

// Email/password routes (only for existing users)
authRoutes.post("/register", register);
authRoutes.post("/login", login);

// OAuth routes
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

authRoutes.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

authRoutes.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  githubCallback
);

// Profile route
authRoutes.get("/profile", protect, getProfile);

export default authRoutes;
