import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../database/models/User";
import { JWT_SECRET } from "../constants/config";

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new user (DISABLED - Only OAuth sign-in allowed for new users)
 * @route   POST /auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Reject new email/password registrations
    // Existing users can still login with email/password
    return res.status(403).json({ 
      message: "Email/password registration is disabled. Please use Google or GitHub to sign in." 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Auth user & get token (Only for existing email/password users)
 * @route   POST /auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    // Only allow login for existing local (email/password) accounts
    if (user && user.provider === "local" && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        token: generateToken(user._id as string),
      });
    } else if (user && user.provider && user.provider !== "local") {
      // User exists but registered with OAuth
      res.status(401).json({ 
        message: "This account was created with OAuth. Please sign in with Google or GitHub." 
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /auth/profile
 * @access  Private
 */
export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
