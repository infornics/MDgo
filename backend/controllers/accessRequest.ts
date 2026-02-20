import { Request, Response } from "express";
import AccessRequest from "../database/models/AccessRequest";
import Document from "../database/models/Document";
import Notification from "../database/models/Notification";
import User from "../database/models/User";
import mongoose from "mongoose";

/**
 * @desc    Request access to a document
 * @route   POST /api/access-requests
 * @access  Private
 */
export const requestAccess = async (req: any, res: Response) => {
  try {
    const { documentId, requestedRole, message } = req.body;
    const userId = req.user._id.toString();

    if (!documentId || !requestedRole) {
      return res.status(400).json({
        message: "Document ID and requested role are required",
      });
    }

    if (!["read", "edit"].includes(requestedRole)) {
      return res.status(400).json({
        message: "Requested role must be 'read' or 'edit'",
      });
    }

    // Validate document ID
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user is already the owner
    if (document.owner.toString() === userId) {
      return res.status(400).json({
        message: "You are already the owner of this document",
      });
    }

    // Check if user already has access
    const isShared = document.sharedWith.some(
      (s: any) => s.email === req.user.email
    );
    if (isShared || document.isPublic) {
      return res.status(400).json({
        message: "You already have access to this document",
      });
    }

    // Check if there's already a pending request
    const existingRequest = await AccessRequest.findOne({
      document: documentId,
      requester: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending access request for this document",
      });
    }

    // Create access request
    const accessRequest = await AccessRequest.create({
      document: documentId,
      requester: userId,
      owner: document.owner,
      requestedRole,
      message: message || "",
    });

    // Create notification for document owner
    const ownerName = req.user.name || req.user.email;
    await Notification.create({
      user: document.owner,
      type: "access_request",
      accessRequest: accessRequest._id,
      document: documentId,
      message: `${ownerName} requested ${requestedRole} access to "${document.title}"`,
    });

    res.status(201).json({
      message: "Access request sent successfully",
      accessRequest,
    });
  } catch (error: any) {
    console.error("Error creating access request:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get access requests for a user (as owner)
 * @route   GET /api/access-requests
 * @access  Private
 */
export const getAccessRequests = async (req: any, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const { status } = req.query;

    const query: any = { owner: userId };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const accessRequests = await AccessRequest.find(query)
      .populate("requester", "name email profilePicture")
      .populate("document", "title")
      .sort({ createdAt: -1 });

    res.json(accessRequests);
  } catch (error: any) {
    console.error("Error fetching access requests:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve or reject an access request
 * @route   PATCH /api/access-requests/:id
 * @access  Private
 */
export const updateAccessRequest = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"
    const userId = req.user._id.toString();

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Action must be 'approve' or 'reject'",
      });
    }

    const accessRequest = await AccessRequest.findById(id)
      .populate({
        path: "requester",
        select: "name email profilePicture",
      })
      .populate("document", "title");

    if (!accessRequest) {
      return res.status(404).json({ message: "Access request not found" });
    }

    // Check if user is the owner
    if (accessRequest.owner.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to modify this request",
      });
    }

    // Check if request is already processed
    if (accessRequest.status !== "pending") {
      return res.status(400).json({
        message: "This access request has already been processed",
      });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    accessRequest.status = newStatus;
    await accessRequest.save();

    // If approved, add user to document's sharedWith
    if (action === "approve") {
      const document = await Document.findById(accessRequest.document);
      if (document) {
        const requester = await User.findById(accessRequest.requester).select(
          "email"
        );
        if (requester) {
          // Check if user is already in sharedWith
          const existingShare = document.sharedWith.find(
            (s: any) => s.email === requester.email
          );
          if (!existingShare) {
            document.sharedWith.push({
              email: requester.email,
              role: accessRequest.requestedRole,
            });
            await document.save();
          }
        }
      }
    }

    // Create notification for requester
    const notificationType =
      action === "approve" ? "access_approved" : "access_rejected";
    const notificationMessage =
      action === "approve"
        ? `Your access request for "${accessRequest.document.title}" has been approved`
        : `Your access request for "${accessRequest.document.title}" has been rejected`;

    await Notification.create({
      user: accessRequest.requester,
      type: notificationType,
      accessRequest: accessRequest._id,
      document: accessRequest.document._id,
      message: notificationMessage,
    });

    res.json({
      message: `Access request ${action}d successfully`,
      accessRequest,
    });
  } catch (error: any) {
    console.error("Error updating access request:", error);
    res.status(500).json({ message: error.message });
  }
};
