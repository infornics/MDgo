import { Router } from "express";
import { protect } from "../utils/auth";
import {
  createProjectItem,
  deleteProjectItem,
  getProjectItems,
  updateProjectItem,
} from "../controllers/projectItem";

const router = Router();

router.use(protect);

router.get("/:projectId/items", getProjectItems);
router.post("/:projectId/items", createProjectItem);
router.patch("/:projectId/items/:itemId", updateProjectItem);
router.delete("/:projectId/items/:itemId", deleteProjectItem);

export default router;

