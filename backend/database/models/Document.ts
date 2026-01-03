import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  title: string;
  contentUrl: string; // ImageKit URL
  fileId: string; // ImageKit fileId
  owner: mongoose.Types.ObjectId;
  isPublic: boolean;
  sharedWith: {
    email: string;
    role: "read" | "edit";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    contentUrl: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        role: {
          type: String,
          enum: ["read", "edit"],
          default: "read",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster lookup by email in sharedWith
DocumentSchema.index({ "sharedWith.email": 1 });

export default mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);
