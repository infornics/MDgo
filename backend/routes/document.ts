import { Router } from "express";
import {
  createDocument,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  updateSharing,
} from "../controllers/document";
import { protect, optionalProtect } from "../utils/auth";

const router = Router();

// Routes requiring authentication
router.post("/", protect, createDocument);
router.get("/", protect, getMyDocuments);
router.put("/:id/sharing", protect, updateSharing);
router.delete("/:id", protect, deleteDocument);

// Routes with optional authentication
router.get("/:id", optionalProtect, getDocumentById);
router.put("/:id", protect, updateDocument);

export default router;
