import { Router } from "express";
import {
  getLikedVideos,
  toggleVideoCommentLike,
  toggleVideoLike,
  toggleCommunityPostLike,
  toggleCommunityPostCommentLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/videoComment/:commentId").post(toggleVideoCommentLike);
router
  .route("/toggle/communityPostComment/:commentId")
  .post(toggleCommunityPostCommentLike);
router.route("/toggle/c/:postId").post(toggleCommunityPostLike);
router.route("/videos").get(getLikedVideos);

export default router;
