import { Router } from "express";

import {
  addCommunityPostComment,
  updateCommunityPostComment,
  deleteCommunityPostComment,
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

//Here this is route for comment on communityPost!!!

router.route("/:postId").post(addCommunityPostComment);
router.route("/c/:commentId").patch(updateCommunityPostComment);
router.route("/c/:commentId").delete(deleteCommunityPostComment);
export default router;
