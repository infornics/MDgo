import { Request, Response } from "express";
import mongoose from "mongoose";
import Project, { IProjectMember } from "../database/models/Project";
import ProjectItem, { IProjectItem } from "../database/models/ProjectItem";
import Document from "../database/models/Document";
import { uploadToImageKit, deleteFromImageKit } from "../utils/imagekit";

const ensureProjectMember = async (projectId: string, userId: string) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return { project: null, allowed: false, status: 404 as const };
  }

  const isMember =
    project.owner.toString() === userId.toString() ||
    project.members.some(
      (m: IProjectMember) => m.user.toString() === userId.toString()
    );

  if (!isMember && !project.isPublic) {
    return { project, allowed: false, status: 403 as const };
  }

  return { project, allowed: true, status: 200 as const };
};

export const getProjectItems = async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;
    const { parentId } = req.query as { parentId?: string };
    const userId = req.user._id.toString();

    const { project, allowed, status } = await ensureProjectMember(
      projectId,
      userId
    );
    if (!project || !allowed) {
      return res
        .status(status)
        .json({ message: status === 404 ? "Project not found" : "Forbidden" });
    }

    const query: any = { project: project._id };

    if (typeof parentId === "string") {
      // When parentId is provided, restrict to that parent (or null)
      if (parentId === "null") {
        query.parent = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          return res.status(400).json({ message: "Invalid parentId" });
        }
        query.parent = parentId;
      }
    }

    const items = await ProjectItem.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProjectItem = async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, type, parentId, content } = req.body as {
      name: string;
      type: "folder" | "file";
      parentId?: string | null;
      content?: string;
    };
    const userId = req.user._id.toString();

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!["folder", "file"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type must be either 'folder' or 'file'" });
    }

    const { project, allowed, status } = await ensureProjectMember(
      projectId,
      userId
    );
    if (!project || !allowed) {
      return res
        .status(status)
        .json({ message: status === 404 ? "Project not found" : "Forbidden" });
    }

    let parent: mongoose.Types.ObjectId | null = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parentId" });
      }
      const parentItem = await ProjectItem.findOne({
        _id: parentId,
        project: project._id,
      });
      if (!parentItem) {
        return res.status(404).json({ message: "Parent item not found" });
      }
      parent = parentItem._id;
    }

    let documentId: mongoose.Types.ObjectId | null = null;
    if (type === "file") {
      const fileContent = content ?? "";
      const uploadResponse = await uploadToImageKit(
        fileContent,
        `${name.trim()}.md`
      );

      const document = await Document.create({
        title: name.trim(),
        contentUrl: uploadResponse.url,
        fileId: uploadResponse.fileId,
        owner: req.user._id,
        project: project._id,
      });

      documentId = document._id;
    }

    const maxOrderItem = await ProjectItem.findOne({
      project: project._id,
      parent,
    }).sort({ order: -1 });
    const nextOrder =
      maxOrderItem && typeof maxOrderItem.order === "number"
        ? maxOrderItem.order + 1
        : 0;

    const item = await ProjectItem.create({
      name: name.trim(),
      type,
      project: project._id,
      parent,
      document: documentId,
      order: nextOrder,
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectItem = async (req: any, res: Response) => {
  try {
    const { projectId, itemId } = req.params;
    const { name, parentId, order } = req.body as {
      name?: string;
      parentId?: string | null;
      order?: number;
    };
    const userId = req.user._id.toString();

    const { project, allowed, status } = await ensureProjectMember(
      projectId,
      userId
    );
    if (!project || !allowed) {
      return res
        .status(status)
        .json({ message: status === 404 ? "Project not found" : "Forbidden" });
    }

    const item = await ProjectItem.findOne({
      _id: itemId,
      project: project._id,
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (name && typeof name === "string") {
      const trimmedName = name.trim();
      item.name = trimmedName;

      // Keep the backing document title in sync for file items
      if (item.type === "file" && item.document) {
        const doc = await Document.findById(item.document);
        if (doc) {
          doc.title = trimmedName;
          await doc.save();
        }
      }
    }

    if (typeof order === "number") {
      item.order = order;
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        item.parent = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          return res.status(400).json({ message: "Invalid parentId" });
        }
        const parentItem = await ProjectItem.findOne({
          _id: parentId,
          project: project._id,
        });
        if (!parentItem) {
          return res.status(404).json({ message: "Parent item not found" });
        }
        item.parent = parentItem._id;
      }
    }

    const updated = await item.save();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItemRecursive = async (
  projectId: mongoose.Types.ObjectId,
  itemId: mongoose.Types.ObjectId
) => {
  const children = await ProjectItem.find({
    project: projectId,
    parent: itemId,
  });

  for (const child of children) {
    await deleteItemRecursive(projectId, child._id);
  }

  const item = await ProjectItem.findById(itemId);
  if (!item) return;

  if (item.type === "file" && item.document) {
    const doc = await Document.findById(item.document);
    if (doc) {
      await deleteFromImageKit(doc.fileId);
      await Document.deleteOne({ _id: doc._id });
    }
  }

  await ProjectItem.deleteOne({ _id: itemId });
};

export const deleteProjectItem = async (req: any, res: Response) => {
  try {
    const { projectId, itemId } = req.params;
    const userId = req.user._id.toString();

    const { project, allowed, status } = await ensureProjectMember(
      projectId,
      userId
    );
    if (!project || !allowed) {
      return res
        .status(status)
        .json({ message: status === 404 ? "Project not found" : "Forbidden" });
    }

    const item = await ProjectItem.findOne({
      _id: itemId,
      project: project._id,
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await deleteItemRecursive(project._id, item._id);

    res.json({ message: "Item deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

