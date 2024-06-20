import mongoose from "mongoose";
import Paginate from "mongoose-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      url: {
        type: String, //cloudinary url
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },

    thumbnail: {
      url: {
        type: String, //cloudinary url
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
videoSchema.plugin(Paginate);

export const Video = mongoose.model("Video", videoSchema);
