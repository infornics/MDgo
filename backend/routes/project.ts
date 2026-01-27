import { Router } from "express";
import { protect } from "../utils/auth";
import {
  addOrUpdateProjectMember,
  createProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/project";

const router = Router();

router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.patch("/:projectId", updateProject);
router.post("/:projectId/members", addOrUpdateProjectMember);

export default router;

