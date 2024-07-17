import { Router } from "express";
import {
  loginUser,
  logOut,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory,
  resetPassword,
  forgetPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logOut);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").put(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").put(verifyJWT, updateAccountDetails);
router.route("/forget-password").post(verifyJWT, forgetPassword);
router.route("/reset-password").patch(verifyJWT, resetPassword);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
