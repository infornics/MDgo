import { Router } from "express";
import { protect } from "../utils/auth";
import {
  requestAccess,
  getAccessRequests,
  updateAccessRequest,
} from "../controllers/accessRequest";

const accessRequestRoutes = Router();

accessRequestRoutes.post("/", protect, requestAccess);
accessRequestRoutes.get("/", protect, getAccessRequests);
accessRequestRoutes.patch("/:id", protect, updateAccessRequest);

export default accessRequestRoutes;
