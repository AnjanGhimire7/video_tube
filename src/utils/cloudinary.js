import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteOnCloudinary = async (localpath) => {
  try {
    const publicId = localpath
      .split("/")
      .pop()
      .replace(/\.(jpg|png|gif|jpeg|mp4|avi|mov|mkv)$/, "");

    console.log(publicId);
    if (!publicId) {
      throw new ApiError(400, "local path of deleted file missing");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    
  } catch (error) {
    throw new ApiError(400, "cannot delete!!!");
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
