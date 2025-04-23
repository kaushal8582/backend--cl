
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const fileExtension = localFilePath.split(".").pop().toLowerCase();
    let resourceType = "auto";

    if (fileExtension === "pdf") {
      resourceType = "raw";
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
    });

    return response;
  } catch (error) {
    console.log(error.message);
    return null;
  } finally {
    fs.unlinkSync(localFilePath);
  }
};

module.exports = uploadOnCloudinary;
