import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id!!!");
  }
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.validUser._id,
  });
  if (!existingSubscription) {
    await Subscription.create({
      channel: channelId,
      subscriber: req?.validUser._id,
    });
  } else {
    await Subscription.findByIdAndDelete(existingSubscription._id);
  }
  const isSubscribed = existingSubscription ? false : true;

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, { isSubscribed, totalSubscribers }, "succcess!!!")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Not found channel id");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel does not exits");
  }

  const aggregate = [
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 }, // Count the number of documents
      },
    },
  ];

  const subscriberList = await Subscription.aggregate(aggregate);
  console.log(subscriberList);

  if (!subscriberList ) {
    throw new ApiError(404, "Subscriberes not founded");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, subscriberList, "Successfully got the subscribers")
    );
});

// controller to return channel list to which user has subscribed

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "Not found subscriber id");
  }

  const user = await User.findById(subscriberId);
  if (!user) {
    throw new ApiError(404, "Channel does not exits");
  }

  const aggregate = [
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
      },
    },
  ];

  const subscribedList = await Subscription.aggregate(aggregate);

  if (!subscribedList || subscribedList.length === 0) {
    throw new ApiError(404, "Subscriberes not founded");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, subscribedList, "Successfully got the subscribers")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
