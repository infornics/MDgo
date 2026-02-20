import mongoose, { Schema, Document } from "mongoose";

export interface IAccessRequest extends Document {
  document: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId; // User requesting access
  owner: mongoose.Types.ObjectId; // Document owner
  status: "pending" | "approved" | "rejected";
  requestedRole: "read" | "edit";
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccessRequestSchema: Schema = new Schema(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    requestedRole: {
      type: String,
      enum: ["read", "edit"],
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
AccessRequestSchema.index({ owner: 1, status: 1 });
AccessRequestSchema.index({ document: 1, requester: 1 });

export default mongoose.models.AccessRequest ||
  mongoose.model<IAccessRequest>("AccessRequest", AccessRequestSchema);
