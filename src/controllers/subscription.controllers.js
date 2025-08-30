import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId,
    });

    if(existingSubscription){
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res
            .status(200)
            .json( new ApiResponse(200, {} , "Unsubscribed successfully"));
    }

    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
});

const getUserChannelSubscriptions = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "_id name email");


    if (!subscriptions || subscriptions.length === 0) {
        throw new ApiError(404, "No subscriptions found for this channel");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscriptions retrieved successfully"));
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "_id name email");

    if (!subscribedChannels || subscribedChannels.length === 0) {
        throw new ApiError(404, "No subscribed channels found for this user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels retrieved successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscriptions,
    getSubscribedChannels
}



