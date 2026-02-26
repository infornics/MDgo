import { Response } from "express";
import mongoose from "mongoose";
import Document from "../database/models/Document";
import { uploadToImageKit, deleteFromImageKit } from "../utils/imagekit";

/**
 * @desc    Create/Upload a new document
 * @route   POST /documents
 * @access  Private
 */
export const createDocument = async (req: any, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || content === undefined) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    // Upload content as a file to ImageKit
    const uploadResponse = await uploadToImageKit(content, `${title}.md`);

    const document = await Document.create({
      title,
      contentUrl: uploadResponse.url,
      fileId: uploadResponse.fileId,
      owner: req.user._id,
    });

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all documents for current user
 * @route   GET /documents
 * @access  Private
 */
export const getMyDocuments = async (req: any, res: Response) => {
  try {
    const documents = await Document.find({
      $or: [{ owner: req.user._id }, { "sharedWith.email": req.user.email }],
    }).sort({
      updatedAt: -1,
    });

    const documentsWithRole = documents.map((doc: any) => {
      const isOwner = doc.owner.toString() === req.user._id.toString();
      const userRole = isOwner
        ? "owner"
        : doc.sharedWith.find((s: any) => s.email === req.user.email)?.role ||
          "read";
      return { ...doc._doc, role: userRole, isOwner };
    });

    res.json(documentsWithRole);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single document by ID
 * @route   GET /documents/:id
 * @access  Private
 */
export const getDocumentById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check ownership
    const isOwner =
      req.user && document.owner.toString() === req.user._id.toString();
    const isPublic = document.isPublic;
    const isShared =
      req.user &&
      document.sharedWith.some((s: any) => s.email === req.user.email);

    if (!isOwner && !isPublic && !isShared) {
      return res.status(403).json({
        message: "Not authorized to access this document",
        requiresAuth: !req.user,
        documentId: id,
      });
    }

    const userRole = isOwner
      ? "owner"
      : document.sharedWith.find((s: any) => s.email === req.user?.email)
          ?.role || (isPublic ? "read" : null);

    res.json({ ...document._doc, role: userRole, isOwner });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a document
 * @route   DELETE /documents/:id
 * @access  Private
 */
export const deleteDocument = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check ownership
    if (document.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this document" });
    }

    // Delete from ImageKit
    await deleteFromImageKit(document.fileId);

    // Delete from MongoDB
    await Document.deleteOne({ _id: document._id });

    res.json({ message: "Document removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a document
 * @route   PUT /documents/:id
 * @access  Private
 */
export const updateDocument = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isOwner = document.owner.toString() === req.user._id.toString();
    const canEdit =
      isOwner ||
      document.sharedWith.some(
        (s: any) => s.email === req.user.email && s.role === "edit",
      );

    if (!canEdit) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this document" });
    }

    // If content changes, we should ideally upload a new version or replace it
    // For simplicity, we'll upload and update the fileId/url
    if (content !== undefined) {
      // NOTE: We should ideally only upload if content actually changed,
      // but comparing with remote content might be expensive.
      // For now, we'll assume the caller only sends content if it changed.

      await deleteFromImageKit(document.fileId);
      const uploadResponse = await uploadToImageKit(
        content,
        `${title || document.title}.md`,
      );
      document.contentUrl = uploadResponse.url;
      document.fileId = uploadResponse.fileId;
    }

    if (title) {
      document.title = title;
      // Keep ProjectItem name in sync
      const ProjectItem = mongoose.model("ProjectItem");
      await ProjectItem.updateOne({ document: document._id }, { name: title });
    }

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update sharing permissions
 * @route   PUT /documents/:id/sharing
 * @access  Private
 */
export const updateSharing = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { isPublic, sharedWith } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Only owner can change sharing permissions
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to manage sharing for this document",
      });
    }

    if (isPublic !== undefined) document.isPublic = isPublic;
    if (sharedWith !== undefined) document.sharedWith = sharedWith;

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
