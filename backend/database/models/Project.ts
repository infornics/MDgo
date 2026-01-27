import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export type ProjectMemberRole = "owner" | "edit" | "read";

export interface IProjectMember {
  user: mongoose.Types.ObjectId;
  role: ProjectMemberRole;
}

export interface IProject extends MongooseDocument {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: IProjectMember[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "edit", "read"],
      required: true,
      default: "edit",
    },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [ProjectMemberSchema],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure owner is always present in members with role=owner
ProjectSchema.pre<IProject>("save", function (next) {
  const ownerId = this.owner.toString();
  const hasOwnerMember = this.members.some(
    (m) => m.user.toString() === ownerId && m.role === "owner"
  );

  if (!hasOwnerMember) {
    this.members.push({ user: this.owner, role: "owner" });
  }

  next();
});

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);

