import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getMyDocuments,
  updateDocument,
  updateSharing,
} from "../controllers/document";
import { optionalProtect, protect } from "../utils/auth";

const docRoutes = Router();

// Routes requiring authentication
docRoutes.post("/", protect, createDocument);
docRoutes.get("/", protect, getMyDocuments);
docRoutes.put("/:id/sharing", protect, updateSharing);
docRoutes.delete("/:id", protect, deleteDocument);

// Routes with optional authentication
docRoutes.get("/:id", optionalProtect, getDocumentById);
docRoutes.put("/:id", protect, updateDocument);

export default docRoutes;
