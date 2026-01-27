import { Request, Response } from "express";
import Project, { IProjectMember } from "../database/models/Project";
import User from "../database/models/User";

export const createProject = async (req: any, res: Response) => {
  try {
    const { name, isPublic } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name: name.trim(),
      owner: req.user._id,
      isPublic: !!isPublic,
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember =
      project.owner.toString() === userId.toString() ||
      project.members.some(
        (m: IProjectMember) => m.user.toString() === userId.toString()
      );

    if (!isMember && !project.isPublic) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this project" });
    }

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, isPublic } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can update this project" });
    }

    if (name && typeof name === "string") {
      project.name = name.trim();
    }
    if (typeof isPublic === "boolean") {
      project.isPublic = isPublic;
    }

    const updated = await project.save();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addOrUpdateProjectMember = async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user._id;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Member email is required" });
    }

    if (!["owner", "edit", "read"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be one of owner, edit, read" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can manage collaborators" });
    }

    const memberUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!memberUser) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    const existingIndex = project.members.findIndex(
      (m: IProjectMember) => m.user.toString() === memberUser._id.toString()
    );

    if (existingIndex >= 0) {
      project.members[existingIndex].role = role;
    } else {
      project.members.push({ user: memberUser._id, role });
    }

    const updated = await project.save();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

