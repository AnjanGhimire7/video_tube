import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Community } from "../models/communitypost.model.js";
import { VideoComment } from "../models/videoComment.model.js";
import { CommunityPostComment } from "../models/communityPostComment.model.js";
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "Invalid videoId!!!");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req?.validUser?._id,
  });
  if (!existingLike) {
    await Like.create({
      video: videoId,
      likedBy: req?.validUser?._id,
    });
  } else {
    await Like.findByIdAndDelete(existingLike._id);
  }
  const isLiked = existingLike ? false : true;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        "Successfully toggle the like on video!!!"
      )
    );
});

const toggleVideoCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(403, "Invalid commentId!!!");
  }
  const comment = await VideoComment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment on video not found!!!");
  }
  const existingLike = await Like.findOne({
    commentOnVideo: commentId,
    likedBy: req?.validUser?._id,
  });
  if (!existingLike) {
    await Like.create({
      commentOnVideo: commentId,
      likedBy: req?.validUser?._id,
    });
  } else {
    await Like.findByIdAndDelete(existingLike._id);
  }
  const isLiked = existingLike ? false : true;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        "Successfully toggle like on comment!!!"
      )
    );
});

const toggleCommunityPostCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(403, "Invalid commentId!!!");
  }
  const comment = await CommunityPostComment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment on communityPost not found!!!");
  }
  const existingLike = await Like.findOne({
    commentOnCommunityPost: commentId,
    likedBy: req?.validUser?._id,
  });
  if (!existingLike) {
    await Like.create({
      commentOnCommunityPost: commentId,
      likedBy: req?.validUser?._id,
    });
  } else {
    await Like.findByIdAndDelete(existingLike._id);
  }
  const isLiked = existingLike ? false : true;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        "Successfully toggle like on comment!!!"
      )
    );
});

const toggleCommunityPostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(403, "Invalid postId!!!");
  }
  const communityPost = await Community.findById(postId);
  if (!communityPost) {
    throw new ApiError(404, "communityPost not found!!!");
  }

  const existingLike = await Like.findOne({
    communityPost: postId,
    likedBy: req?.validUser?._id,
  });
  if (!existingLike) {
    await Like.create({
      communityPost: postId,
      likedBy: req?.validUser?._id,
    });
  } else {
    await Like.findByIdAndDelete(existingLike._id);
  }
  const isLiked = existingLike ? false : true;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        "Successfully toggle like on communityPost"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedvideos = await Like.find({
    likedBy: req.validUser._id,
    video: { $exists: true },
  }).populate("video");
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likedvideos },
        "Liked videos are fetched successfully"
      )
    );
});

export {
  toggleVideoCommentLike,
  toggleCommunityPostLike,
  toggleVideoLike,
  getLikedVideos,
  toggleCommunityPostCommentLike,
};
