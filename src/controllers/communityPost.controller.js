import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Community } from "../models/communitypost.model.js";
import { isValidObjectId } from "mongoose";

const createCommunityPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required!!!");
  }
  const createPost = await Community.create({
    content,
    owner: req?.validUser?._id,
  });
  if (!createPost) {
    throw new ApiError(400, "failed to create the community post!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, createPost, "successfully creating the post!!!")
    );
});

const updateCommunityPost = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "invalid post Id!!!");
  }
  const communityPost = await Community.findById(postId);
  if (!req.validUser._id.equals(communityPost.owner?._id)) {
    throw new ApiError(400, "you are not the owner of the post!!!");
  }

  const updatePost = await Community.findByIdAndUpdate(
    postId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  );

  if (!updatePost) {
    throw new ApiError(400, "failed to update the post!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatePost, "successfully updated the post!!!"));
});

const deleteCommunityPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "invalid postId!!!");
  }
  const commuinty = await Community.findById(postId);
  if (!req?.validUser?._id.equals(commuinty.owner._id)) {
    throw new ApiError(400, "your are not the onwer of the post!!!");
  }
  const deletePost = await Community.findByIdAndDelete(postId);
  if (!deletePost) {
    throw new ApiError(400, "failed to deleted the post!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "suuccessfully deleted the post!!!"));
});

export { createCommunityPost, updateCommunityPost, deleteCommunityPost };
