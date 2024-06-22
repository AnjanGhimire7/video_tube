import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
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
    videoFile: {
      url: videoFile?.url,
      public_id: videoFile?.public_id,
    },

    thumbnail: {
      url: thumbnail?.url,
      public_id: thumbnail?.public_id,
    },

    duration: videoFile?.duration,
    owner: req.validUser?._id,
  });

  if (!video) {
    throw new ApiError(400, "failed to publish the video!!!");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      video,
    })
  );
});

// get all videos
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
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

  const pipeline = [];

  // for using Full Text based search you need to create a search index in mongoDB atlas
  // you can include field mapppings in search index eg.title, description, as well
  // Field mappings specify which fields within your documents should be indexed for text search.
  // this helps in seraching only in title, description providing faster search results
  // here the name of search index is 'search-videos'

  if (query) {
    pipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          text: [title, description],
        },
      },
    });
  }

  if (userId) {
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid id");

    // fetch videos only that are set isPublished as true

    pipeline.push({
      $match: {
        $or: [{ owner: ObjectId(userId) }, { isPublished: true }],
      },
    });
  }

  if (sortStage) {
    pipeline.push({
      $sort: sortStage,
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              userName: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner_details: {
          $arrayElemAt: ["$ownerDetails", 0],
        },
      },
    }
  );

  const videoAggregate = await Video.aggregate(pipeline);

  const options = {
    pageLimit,
    pageSkip,
  };

  console.log("videoAggregate", videoAggregate);

  const video = await Video.paginate(videoAggregate, options);

  return res.status(200, video, "Videos fetched succesffuly");
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
  //adding video to watch history
  await User.findByIdAndUpdate(req.validUser._id, {
    $set: {
      watchHistory: videoId,
    },
  });
  //increment the views by 1 if video fetched successfully!!!
  await Video.findByIdAndUpdate(videoId, {
    $inc: {
      views: 1,
    },
  });

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
    const thumbnailToDelete = video.thumbnail.public_id;
    await deleteOnCloudinary(thumbnailToDelete);
    video.thumbnail = newthumbnail;
  }

  await video.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "successfully updating video!!!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "id not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "something wrong happened while fetching video");
  }

  //* check you are the owner of this video or not
  if (!req.validUser._id.equals(video.owner._id)) {
    throw new ApiError(400, "you are not the owner of this video");
  }

  const deleteVideo = await deleteOnCloudinary(video.thumbnail.public_id);

  const deleteThumbnail = await deleteOnCloudinary(
    video.videoFile.public_id,
    "video"
  );
  await Video.findByIdAndDelete(videoId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deleteVideo, deleteThumbnail },
        "video delete successfully"
      )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is missing");
  }

  const video = await Video.findById(videoId);
  //* check you are the owner of this video or not
  if (!req.validUser._id.equals(video.owner._id)) {
    throw new ApiError(400, "you are not the owner of this video");
  }
  video.isPublished = !video.isPublished;
  await video.save();

  return res.json(new ApiResponse(200, video, "updated"));
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
