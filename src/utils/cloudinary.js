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
   
    const videoLinkSplit = localpath.split("/")
    const public_id = videoLinkSplit[videoLinkSplit.length - 1].split(".")[0]

    console.log(public_id);
    if (!public_id) {
      throw new ApiError(400, "local path of deleted file missing");
    }
const response= await cloudinary.uploader.destroy(public_id,{
  resource_type:"raw"
})
    
console.log(response)
  }
  catch{
throw new ApiError(400,"failed!!!")
  }
}
export { uploadOnCloudinary, deleteOnCloudinary };
