import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

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
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  const subscribers = await Subscription.find({ channel: channelId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers },
        "Subscribers are fetched successfully"
      )
    );
});
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }
  const user = await User.findById(subscriberId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannels },
        "Subscribed channels are fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
