import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

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

  return res.status(200).json(
    new ApiResponse(200, {
      videoFile: videoFile?.url, //showing only videoFile and thumbnial in response
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
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "cannot get videoId!!!");
  }
  const video = await Video.findById(videoId).populate("owner");

  if (!video) {
    throw new ApiError(401, "failed to get the video!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "successfully getting the video!!!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;

  const updateTumbnailLocalPath = req.file.path;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoID!!!");
  }

  if (!updateTumbnailLocalPath) {
    throw new ApiError(400, "tumbnailpath is missing!!!");
  }
  const video = await Video.findById(videoId);

  if (!req.validUser?._id.equals(video.owner?._id)) {
    throw new ApiError(401, "not the video owner!!!");
  }
  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }

  if (updateTumbnailLocalPath) {
    const newthumbnail = await uploadOnCloudinary(updateTumbnailLocalPath);
    if (!newthumbnail?.url) {
      throw new ApiError(401, "failed to upload thumbnail!!!");
    }
    await deleteOnCloudinary(video.thumbnail);
    video.thumbnail = newthumbnail;
  }

  await video.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "successfully updating video!!!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "id not found");
  }

  const video = await Video.findById(videoId)
  if (!video) {
      throw new ApiError(400, "something wrong happened while fetching video");
  }

  //* check you are the owner of this video or not
  if (!req.validUser._id.equals(video.owner._id)) {
      throw new ApiError(400, "you are not the owner of this video");
  }
  

if (video) {
  await Video.findByIdAndDelete(videoId)
await deleteOnCloudinary(video.videoFile);
await deleteOnCloudinary(video.thumbnail);
  await Video.findByIdAndDelete(videoId)
}
      
  
  
    res
    .status(200)
    .json(new ApiResponse(200, {  }, "video delete successfully"));
    }
  

  

)
  


const togglePublishStatus = asyncHandler(async(req,res)=>{
  const {videoId} = req.params;

  if(!isValidObjectId(videoId)){
      throw new ApiError(400,"video id is missing")
  }

  const video = await Video.findById(videoId);
  //* check you are the owner of this video or not
  if (!req.validUser._id.equals(video.owner._id)) {
    throw new ApiError(400, "you are not the owner of this video");
}
  video.isPublished = !video.isPublished;
  await video.save()
  
  return res.json(new ApiResponse(200,video,"updated"))
})


export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
