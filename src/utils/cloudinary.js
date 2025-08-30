import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
    path: "src/.env"
})

// Cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function (localFilePath) {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File uploaded on cloudinary. File Src: ", response.url);

        // Once uploaded unlink
        fs.unlinkSync(localFilePath);
        return response;
        
    } catch (error) {
        console.log('Error on cloudinary', error);
        
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted from cloudinary. Public Id: ", publicId);
        
    } catch (error) {
        console.log("Error deleting from cloudinary", error);
        return null;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}