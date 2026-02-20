import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from "passport-github2";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "../constants/config";

// Get backend URL from environment or default
const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || "http://localhost:8000";

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: (error: any, user?: any) => void
      ) => {
        // Passport will call done with the profile
        // The profile will be available in req.user in the callback route
        return done(null, profile);
      }
    )
  );
} else {
  console.warn("Google OAuth credentials not configured");
}

// GitHub OAuth Strategy
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: GitHubProfile,
        done: (error: any, user?: any) => void
      ) => {
        // Passport will call done with the profile
        // The profile will be available in req.user in the callback route
        return done(null, profile);
      }
    )
  );
} else {
  console.warn("GitHub OAuth credentials not configured");
}

export default passport;
