import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  profilePicture?: string; // Profile picture URL from OAuth provider
  provider?: "local" | "google" | "github";
  providerId?: string; // OAuth provider's user ID
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        // Password is required only for local (email/password) accounts
        return this.provider === "local" || !this.provider;
      },
      select: false,
    },
    name: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    providerId: {
      type: String,
      sparse: true, // Allows multiple nulls but enforces uniqueness when present
    },
    profilePicture: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only for local accounts)
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  
  // Only hash password for local accounts
  if (this.provider && this.provider !== "local") return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password!);
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
