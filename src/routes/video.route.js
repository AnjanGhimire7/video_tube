import { Router } from "express";
import { getAllVideos, publishVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use(verifyJWT); // this will implement verifyJwt middleware in all videos route.

router.route("/").get(getAllVideos);
router.route("/publishVideo").post(upload.fields([
    {
        name: "videoFile",
        maxCount:1
    }, {
        name: "thumbnail",
        maxCount:1
    }
]),
   publishVideo)

export default router