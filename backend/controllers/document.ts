import { Response } from "express";
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
    const documents = await Document.find({ owner: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(documents);
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
    const document = await Document.findById(req.params.id);

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
    const { title, content } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this document" });
    }

    // If content changes, we should ideally upload a new version or replace it
    // For simplicity, we'll upload and update the fileId/url
    if (content !== undefined) {
      await deleteFromImageKit(document.fileId);
      const uploadResponse = await uploadToImageKit(
        content,
        `${title || document.title}.md`
      );
      document.contentUrl = uploadResponse.url;
      document.fileId = uploadResponse.fileId;
    }

    if (title) document.title = title;

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
