import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    commentOnVideo: {
      type: Schema.Types.ObjectId,
      ref: "VideoComment",
    },
    commentOnCommunityPost:{
      type: Schema.Types.ObjectId,
      ref:"CommunityPostComment"
    },
    communityPost: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
