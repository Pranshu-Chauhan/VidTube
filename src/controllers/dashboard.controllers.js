import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import { Comment } from "../models/comment.models.js";


const getChannelDashboard = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const totalVideos = await Video.countDocuments({ owner: userId });

    if (totalVideos === null || totalVideos === undefined) {
        throw new ApiError(500, "Something went wrong while fetching the total videos");
    }

    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    if (totalSubscribers === null || totalSubscribers === undefined) {
        throw new ApiError(500, "Something went wrong while fetching the total subscribers");
    }

    const totalVideoLikes = await Like.countDocuments({
        video: {
            $in: await Video.find({ owner: userId }).distinct("_id")
        }
    })

    if (totalVideoLikes === null || totalVideoLikes === undefined) {
        throw new ApiError(500, "Something went wrong while fetching the total video likes");
    }

    const totalTweetLikes = await Like.countDocuments({
        tweet: {
            $in: await Tweet.find({ owner: userId }).distinct("_id")
        }
    })

    if (totalTweetLikes === null || totalTweetLikes === undefined) {
        throw new ApiError(500, "Something went wrong while fetching the total tweet likes");
    }


    const totalCommentLikes = await Like.countDocuments({
        comment: {
            $in: await Comment.find({ owner: userId }).distinct("_id")
        }
    })

    if (totalCommentLikes === null || totalCommentLikes === undefined) {
        throw new ApiError(500, "Something went wrong while fetching the total comment likes");
    }

    const totalViews = await Video.aggregate([
        {
            $match: { owner: userId }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])

    if (totalViews === null || totalViews === undefined) {
        throw new ApiError(500, "Something went wrong while fetching the total views");
    }

    return res
        .status(200)
        .json( new ApiResponse(200, {
            totalVideos,
            totalSubscribers,
            totalVideoLikes,
            totalTweetLikes,
            totalCommentLikes,
            totalViews: totalViews[0]?.totalViews || 0
        } ,"Channel dashboard fetched successfully"));
})


const getChannelVideos = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelDashboard, getChannelVideos };



