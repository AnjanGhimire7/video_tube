import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").post(addComment);
router.route("/:videoId").get(getVideoComments);
router.route("/c/:commentId").patch(updateComment);
router.route("/c/:commentId").delete(deleteComment);
export default router;
