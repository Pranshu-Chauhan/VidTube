import mongoose, { isValidObjectId} from "mongoose";    
import {Comment} from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    // Extract videoId from request parameters
    const { videoId } = req.params;

    // Extract page and limit from query parameters
    const {page = 1, limit = 10} = req.query;

    // Validate videoId
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    console.log(
        "Video ID:", videoId,
        "Type:", typeof videoId
    );

    // VideoID to ObjectId
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    // Fetch comments for the video

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoObjectId
            }
        },
        {
            $lookup: {
                from: "videos", // Assuming the user collection is named 'users'
                localField: "video",
                foreignField: "_id",
                as: "CommentOnWhichVideo"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "OwnerOfComment"
            }
        },
        {
            $project: {
                content: 1,
                owner: {
                    $arrayElemAt: ["$OwnerOfComment", 0],
                },
                video: {
                    $arrayElemAt: ["$CommentOnWhichVideo", 0],
                },
                createdAt: 1,
            }
        },
        {
            $skip: (page - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);

     console.log(comments);

    // Check if comments were found
    if(!comments?.length){
        throw new ApiError(404, "No comments found for this video");    
    }

    // Return the comments
    return res
        .status(200)
        .json(new ApiResponse(200, comments ,"Comments fetched successfully"));

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if(!req.user){
        throw new ApiError(401, "You must be logged in to add a comment");  
    }

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const addedComment = await Comment.create({
        content,
        owner: req.user?._id,
        video: videoId
    });

    if(!addedComment) {
        throw new ApiError(500, "Failed to add comment");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, addedComment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!req.user) {
        throw new ApiError(401, "You must be logged in to update a comment");
    }

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        { $set: { content } },
        { new: true }
    );
    if (!updatedComment) {
        throw new ApiError(500, "Something went wrong while updating the comment");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!req.user) {
        throw new ApiError(401, "You must be logged in to delete a comment");
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id
    });

    if (!deletedComment) {
        throw new ApiError(500, "Something went wrong while deleting the comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}

