import { Types, isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  if (!content) {
    throw new ApiError(400, "content is required!!!");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id!!!");
  }
  const comment = await Comment.create({
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

  const aggregate = Comment.aggregate([
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
  Comment.paginate(aggregate, options)
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

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Comment text is required");
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment is updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment Id!!!");
  }
  const deleteComment = await Comment.findByIdAndDelete(commentId);

  if (!deleteComment) {
    throw new ApiError(400, "failed to delete the comment!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "successfully deleted the comment!!!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
