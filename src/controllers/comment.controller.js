import { Types, isValidObjectId } from "mongoose";
import { VideoComment } from "../models/videoComment.model.js";
import { CommunityPostComment } from "../models/communityPostComment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addVideoComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  if (!content) {
    throw new ApiError(400, "content is required!!!");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id!!!");
  }

  const comment = await VideoComment.create({
    content,
    video: videoId,
    owner: req?.validUser?._id,
  });

  if (!comment) {
    throw new ApiError(400, "failed to comment on video!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, comment, "successfully commented on the video!!! ")
    );
});
// get video comments
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 3, sortType } = req.query;

  const pageLimit = parseInt(limit);
  const pageSkip = (page - 1) * pageLimit;
  // check if Invalid videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId!");
  }

  const aggregate = VideoComment.aggregate([
    {
      $match: {
        video: new Types.ObjectId(videoId),
      },
    },
    {
      $sort: { createdAt: sortType === "new" ? -1 : 1 },
    },
    {
      $skip: pageSkip,
    },
    {
      $limit: pageLimit,
    },
  ]);
  const options = {
    page: parseInt(page),
    limit: pageLimit,
  };
  VideoComment.paginate(aggregate, options)
    .then(function (allcomments) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, allcomments, "successfully fetched the comments")
        );
    })
    .catch(function (error) {
      throw error;
    });
});

const updateVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Comment text is required");
  }
  const comment = await VideoComment.findById(commentId);
  if (content) {
    comment.content = content;
  }
  await comment.save({
    validateBeforeSave: false,
  });
  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment is updated successfully"));
});

const deleteVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment Id!!!");
  }

  const deleteComment = await VideoComment.findByIdAndDelete(commentId);

  if (!deleteComment) {
    throw new ApiError(400, "failed to delete the comment!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "successfully deleted the comment!!!"));
});
// comment for communityPost

const addCommunityPostComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  if (!content) {
    throw new ApiError(400, "content is required!!!");
  }
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "invalid Postid!!!");
  }

  const comment = await CommunityPostComment.create({
    content,
    communityPost: postId,
    owner: req?.validUser?._id,
  });

  if (!comment) {
    throw new ApiError(400, "failed to comment on communityPost!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comment,
        "successfully commented on the communityPost!!! "
      )
    );
});
const updateCommunityPostComment = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id!!!");
  }
  if (!newContent) {
    throw new ApiError(400, "content is required");
  }
  const comment = await CommunityPostComment.findById(commentId);

  if (!req?.validUser?._id.equals(comment.owner?._id)) {
    throw new ApiError(400, "you are not the owner!!!");
  }
  if (newContent) {
    comment.content = newContent;
  }
  await comment.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comment,
        "successfully updating the comment on communityPost!!!"
      )
    );
});

const deleteCommunityPostComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId!!!");
  }
  const comment = await CommunityPostComment.findById(commentId);
  if (!req?.validUser?._id.equals(comment.owner?._id)) {
    throw new ApiError(400, "you are not the owner!!!");
  }

  const deleteComment = await CommunityPostComment.findByIdAndDelete(commentId);
  if (!deleteComment) {
    throw new ApiError(400, "failed to delete the comment!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "successfully delete the comment from communityPost!!!"
      )
    );
});
export {
  getVideoComments,
  addVideoComment,
  updateVideoComment,
  deleteVideoComment,
  addCommunityPostComment,
  updateCommunityPostComment,
  deleteCommunityPostComment,
};
