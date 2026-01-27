import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export type ProjectItemType = "folder" | "file";

export interface IProjectItem extends MongooseDocument {
  name: string;
  type: ProjectItemType;
  project: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId | null;
  document?: mongoose.Types.ObjectId | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectItemSchema = new Schema<IProjectItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["folder", "file"],
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "ProjectItem",
      default: null,
      index: true,
    },
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ProjectItemSchema.index({ project: 1, parent: 1, order: 1 });

export default mongoose.models.ProjectItem ||
  mongoose.model<IProjectItem>("ProjectItem", ProjectItemSchema);

