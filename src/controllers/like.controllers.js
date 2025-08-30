import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if(existingLike){
        await Like.findOneAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, existingLike , "Like removed successfully"));
    }

    const likeVideo = await Like.create({
        video: videoId,
        likedBy: userId 
    });

    return res.status(201).json(new ApiResponse(201, likeVideo, "Video liked successfully"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if(existingLike){
        await Like.findOneAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, existingLike , "Like removed successfully"));
    }

    const likeComment = await Like.create({
        comment: commentId,
        likedBy: userId
    });

    return res.status(201).json(new ApiResponse(201, likeComment, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if  (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    if(existingLike){
        await Like.findOneAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, existingLike , "Like removed successfully"));
    }

    const likeTweet = await Like.create({
        tweet: tweetId,
        likedBy: userId
    });

    return res.status(201).json(new ApiResponse(201, likeTweet, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})
const getLikedComments = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedComments = await Like.find({
        likedBy: userId,
        comment: { $exists: true }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, likedComments, "Liked comments fetched successfully"));
})
const getLikedTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedTweets = await Like.find({
        likedBy: userId,
        tweet: { $exists: true }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, likedTweets, "Liked tweets fetched successfully"));
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
}
