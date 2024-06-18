import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!(title && description)) {
    throw new ApiError(400, "all the fields are required!!!");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(401, "videolocalpath is required!!!");
  }
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(402, "thumbnaillocalpath is required!!!");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  if (!(videoFile && thumbnail)) {
    throw new ApiError(401, "vidoefile and thumbnail is required!!!");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    duration: videoFile?.duration,
    owner: req.validUser?._id,
  });

  if (!video) {
    throw new ApiError(400, "failed to publish the video!!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        ...video._docs,
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
      })
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 2,
    query = "",
    sortBy,
    sortType,
    userId,
  } = req.query;
  const pageLimit = parseInt(limit);
  const pageSkip = (page - 1) * pageLimit;
  const sortStage = {};
  //sortBy= views
  sortStage[sortBy] = sortType === "asc" ? 1 : -1;

  const matchCondition = {
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  if (userId) {
    matchCondition.owner = ObjectId(userId);
  }

  const videoAggregate = Video.aggregate([
    {
      $match: matchCondition,
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owenerResult",
        pipeline: [
          {
            $project: {
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner_details: {
          $arrayElemAt: ["$ownerResult", 0],
        },
      },
    },
    {
      $sort: sortStage,
    },
    {
      $limit: pageLimit,
    },
    { $skip: pageSkip },
  ]);
  if (!videoAggregate) {
    throw new ApiError(402, "failed to get all the video!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, videoAggregate, "successfully fectched the video!!!")
    );
});
export { getAllVideos, publishVideo };
