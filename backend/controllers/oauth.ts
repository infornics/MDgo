import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/User";
import { JWT_SECRET } from "../constants/config";

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * OAuth callback handler - handles both Google and GitHub
 * This function is called after OAuth provider authentication
 */
export const oauthCallback = async (
  req: Request,
  res: Response,
  provider: "google" | "github"
) => {
  try {
    const profile = req.user as any; // Passport sets req.user with the profile
    
    // Handle different profile structures for Google and GitHub
    let email: string | undefined;
    let name: string = "";
    let providerId: string | undefined;

    if (provider === "google") {
      email = profile.emails?.[0]?.value || profile.email;
      name = profile.displayName || profile.name?.givenName || profile.name?.familyName || "";
      providerId = profile.id;
    } else if (provider === "github") {
      // GitHub profile structure
      email = profile.emails?.[0]?.value || profile._json?.email;
      name = profile.displayName || profile._json?.name || profile.username || "";
      providerId = profile.id || profile._json?.id;
    }

    if (!email) {
      return res.status(400).json({ message: "Email not provided by OAuth provider" });
    }

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID not found" });
    }

    // Check if user exists with this email
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - link OAuth account to existing account
      // If user has password (local account), we link the OAuth provider
      if (user.provider === "local" || !user.provider) {
        // Link OAuth provider to existing account
        user.provider = provider;
        user.providerId = providerId.toString();
        // Update name if not set or if OAuth provides better name
        if (!user.name && name) {
          user.name = name;
        }
        await user.save();
      } else if (user.provider !== provider) {
        // User exists with different OAuth provider - still allow login
        // This handles cases where user might have multiple OAuth accounts with same email
        if (!user.providerId) {
          user.providerId = providerId.toString();
          await user.save();
        }
      }
    } else {
      // New user - create account with OAuth provider
      user = await User.create({
        email: email.toLowerCase(),
        name: name,
        provider: provider,
        providerId: providerId.toString(),
      });
    }

    // Generate token and redirect to frontend with token
    const token = generateToken(user._id as string);
    
    // Redirect to frontend with token in query parameter
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error: any) {
    console.error(`OAuth ${provider} callback error:`, error);
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message || "Authentication failed")}`);
  }
};

/**
 * Google OAuth callback
 */
export const googleCallback = async (req: Request, res: Response) => {
  return oauthCallback(req, res, "google");
};

/**
 * GitHub OAuth callback
 */
export const githubCallback = async (req: Request, res: Response) => {
  return oauthCallback(req, res, "github");
};
