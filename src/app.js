import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import videoCommentRouter from "./routes/videoComment.route.js";
import communityRouter from "./routes/community.route.js";
import communityPostCommentRouter from "./routes/communityPostComment.route.js";
import likeRouter from "./routes/like.route.js";
//route declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videoComments", videoCommentRouter);
app.use("/api/v1/communityPost", communityRouter);
app.use("/api/v1/communityPostComments", communityPostCommentRouter);
app.use("/api/v1/likes", likeRouter);

export { app };
