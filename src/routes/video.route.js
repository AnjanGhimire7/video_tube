import { Router } from "express";
import { getAllVideos } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.use(verifyJWT); // this will implement verifyJwt middleware in all videos route.

router.route("/").get(getAllVideos);

export default router