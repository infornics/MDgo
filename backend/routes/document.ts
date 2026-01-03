import { Router } from "express";
import {
  createDocument,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../controllers/document";
import { protect } from "../utils/auth";

const router = Router();

router.use(protect);

router.post("/", createDocument);
router.get("/", getMyDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

export default router;
