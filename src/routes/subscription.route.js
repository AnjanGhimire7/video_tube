import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c/:channelId") // here c means channel
  .get(getUserChannelSubscribers)
  .post(toggleSubscription);
router.route("/u/:subscriberId").get(getSubscribedChannels); //  here u means user
export default router;
