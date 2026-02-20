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
    
    // Debug: Log profile structure to understand what we're receiving
    console.log(`[${provider}] Profile structure:`, JSON.stringify(profile, null, 2));
    
    // Handle different profile structures for Google and GitHub
    let email: string | undefined;
    let name: string = "";
    let providerId: string | undefined;
    let profilePicture: string | undefined;

    if (provider === "google") {
      email = profile.emails?.[0]?.value || profile.email;
      name = profile.displayName || profile.name?.givenName || profile.name?.familyName || "";
      providerId = profile.id;
      // Google profile picture - try multiple possible locations
      const photoValue = profile.photos?.[0]?.value;
      profilePicture = photoValue || 
                      profile._json?.picture || 
                      profile.picture ||
                      profile.image?.url ||
                      (typeof profile.photos?.[0] === 'string' ? profile.photos[0] : null);
      console.log(`[Google] Profile picture extracted:`, profilePicture);
      console.log(`[Google] Profile photos array:`, profile.photos);
      console.log(`[Google] Profile _json:`, profile._json);
    } else if (provider === "github") {
      // GitHub profile structure
      email = profile.emails?.[0]?.value || profile._json?.email;
      name = profile.displayName || profile._json?.name || profile.username || "";
      providerId = profile.id || profile._json?.id;
      // GitHub profile picture - try multiple possible locations
      const photoValue = profile.photos?.[0]?.value;
      profilePicture = photoValue || 
                      profile._json?.avatar_url || 
                      profile.avatar_url ||
                      (typeof profile.photos?.[0] === 'string' ? profile.photos[0] : null);
      console.log(`[GitHub] Profile picture extracted:`, profilePicture);
      console.log(`[GitHub] Profile photos array:`, profile.photos);
      console.log(`[GitHub] Profile _json:`, profile._json);
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
        // Update profile picture if available
        if (profilePicture) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      } else if (user.provider !== provider) {
        // User exists with different OAuth provider - still allow login
        // This handles cases where user might have multiple OAuth accounts with same email
        if (!user.providerId) {
          user.providerId = providerId.toString();
        }
        // Update profile picture if available and not already set
        if (profilePicture && !user.profilePicture) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      } else {
        // Same provider - update profile picture if available
        if (profilePicture) {
          user.profilePicture = profilePicture;
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
        profilePicture: profilePicture,
      });
    }

    // Generate token and redirect to frontend with token
    const token = generateToken(user._id as string);
    
    // Get return URL from OAuth state parameter (passed through OAuth flow)
    // OAuth providers return the state parameter in the callback
    const returnUrl = (req.query.state as string) || req.query.returnUrl as string || "/";
    
    // Debug: Log user data being saved
    console.log(`[${provider}] User saved:`, {
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      provider: user.provider
    });
    
    // Redirect to frontend with token and return URL
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&returnUrl=${encodeURIComponent(returnUrl)}`);
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
