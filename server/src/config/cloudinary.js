import dotenv from "dotenv"
dotenv.config()
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profilePhoto",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

export { cloudinary, storage };
