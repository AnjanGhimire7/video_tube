import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  deleteCommunityPost,
  updateCommunityPost,
  createCommunityPost,
} from "../controllers/communityPost.controller.js";
const router = Router();

router.use(verifyJWT); // this will provide auth middlewares in all the routes
router.route("/createPost").post(createCommunityPost);
router.route("/updatePost/:postId").patch(updateCommunityPost);
router.route("/deletePost/:postId").delete(deleteCommunityPost);

export default router;
