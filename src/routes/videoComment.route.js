import { Router } from "express";
import {
  addVideoComment,
  deleteVideoComment,
  getVideoComments,
  updateVideoComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

//Here this is route for comment on video!!!
router.route("/:videoId").post(addVideoComment);
router.route("/:videoId").get(getVideoComments);
router.route("/v/:commentId").patch(updateVideoComment);
router.route("/v/:commentId").delete(deleteVideoComment);

//Here this is route for comment on communityPost!!!

export default router;
