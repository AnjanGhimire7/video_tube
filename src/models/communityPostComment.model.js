import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    communityPost: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
  },
  {
    timestamps: true,
  }
);
commentSchema.plugin(paginate);
export const CommunityPostComment = mongoose.model(
  "CommunityPostComment",
  commentSchema
);
