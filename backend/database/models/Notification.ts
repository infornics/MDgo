import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId; // User who receives the notification
  type: "access_request" | "access_approved" | "access_rejected";
  accessRequest?: mongoose.Types.ObjectId; // Reference to access request if applicable
  document?: mongoose.Types.ObjectId; // Reference to document if applicable
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["access_request", "access_approved", "access_rejected"],
      required: true,
    },
    accessRequest: {
      type: Schema.Types.ObjectId,
      ref: "AccessRequest",
    },
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
