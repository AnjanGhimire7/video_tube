import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const parseLimit = parseInt(limit);
  const pageSkip = (page - 1) * parseLimit;
  const sortStage = {};
  //sortBy= views
  sortStage[sortBy] = sortType === "asc" ? 1 : -1;
  const allVideo = await Video.aggregate([
    {
      $match: {
        isPublished: true,

      },
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
      $skip: pageSkip,
    },
    {
      $limit: parseLimit,
    },
    {
      $project: {
        ownerResult: 0,
      },
    },
    
  
    
  ]);
if (!allVideo) {
    throw new ApiError(402,"failed to get all the video!!!")
}
  res
    .status(200)
    .json(
      new ApiResponse(200, allVideo, "successfully getting all the videos!!!")
    );
});

export { getAllVideos };
