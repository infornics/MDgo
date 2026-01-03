import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  title: string;
  contentUrl: string; // ImageKit URL
  fileId: string; // ImageKit fileId
  owner: mongoose.Types.ObjectId;
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);
