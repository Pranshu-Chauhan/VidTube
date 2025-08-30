import mongoose, { isValidObjectId } from "mongoose";
import {Video} from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";    
import { uploadOnCloudinary } from "../utils/cloudinary.js";    
import { getVideoDuration } from "../utils/videoDuration.js";


const getAllVideos = asyncHandler(async (req, res) => {
    // Extracting query parameters from the request
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId,
    } = req.query;

    // Check if user is authenticated
    if (!req.user){
        throw new ApiError(401, "Unauthorized access, please login first");
    }

    // Constructing the filter object based on userId and query
    const match = {
        ...(query ? {title: {$regex: query, $options: "i"}} : {}), 
        ...(userId ? {owner: mongoose.Types.ObjectId(userId)} : {})
    }

    const videos =  await Video.aggregate([
        {
            $match: match,
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        }, 
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1 ,
                views: 1, 
                isPublished: 1, 
                owner: {
                    $arrayElemAt: ["$ownerDetails", 0],
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1,
            }
        },
        {
            $skip: (page - 1) * parseInt(limit),
        }, 
        {
            $limit: parseInt(limit),
        }
    ]);

    if(!videos.length) {
        throw new ApiError(404, "No videos found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));

});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, owner, duration } = req.body;

    if (!title){
        throw new ApiError(400, "Title is required");   
    }
    if (!description){
        throw new ApiError(400, "Description is required");   
    }
    if (!owner){
        throw new ApiError(400, "Owner is required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    if(!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    try {
        // const duration = await getVideoDuration(videoFileLocalPath);
        const videoFile = await uploadOnCloudinary(videoFileLocalPath);

        if(!videoFile) {
            throw new ApiError(500, "Error uploading video file to cloud");
        }

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail) {
            throw new ApiError(500, "Error uploading thumbnail to cloud");
        }

        const videoDoc  = await Video.create(
            {
                videoFile: videoFile.url,
                thumbnail: thumbnail.url,
                title, 
                description,
                owner: req.user?._id,
                duration,
            }
        )

        if(!videoDoc) {
            throw new ApiError(500, "Error creating video document");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, videoDoc, "Video published successfully"));
    }
    catch (error) {
        throw new ApiError(500, error);
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "name email");

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    const { title, description } = req.body;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    let updateData = { title, description };

    if (req.file){
        const thumbnailLocalPath = req.file.path;

        if(!thumbnailLocalPath){
            throw new ApiError(400, "Thumbnail is required");
        }
        console.log("Thumbnail file uploaded:", req.file);


        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if(!thumbnail.url) {
            throw new ApiError(500, "Error uploading thumbnail to cloud");
        }

        updateData.thumbnail = thumbnail.url;

    }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId, 
        {
            $set: updateData
        }, 
        { new: true, runValidators: true }
    );

    if(!updateVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateVideo, "Video updated successfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if(!deletedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;

    await video.save();
    return res
        .status(200)
        .json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`));

});


// Exporting the controller functions

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};






