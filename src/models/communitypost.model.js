import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: "1d" },
  },
});
export const Community = mongoose.model("Community", communitySchema);
