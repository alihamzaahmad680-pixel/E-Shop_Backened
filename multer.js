// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },

//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

//     const name = file.originalname.split(".")[0];
//     const ext = file.originalname.split(".").pop();

//     cb(null, name + "-" + uniqueSuffix + "." + ext);
//   },
// });

// exports.upload = multer({ storage });
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");

dotenv.config();

// 1. Cloudinary Configuration (Vercel / Production ke liye)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage Setup
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "e-shop-uploads", // Cloudinary par folder ka naam
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// 2. Local Disk Storage Setup (Local development ke liye)
const localDiskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const name = file.originalname.split(".")[0];
    const ext = file.originalname.split(".").pop();
    cb(null, name + "-" + uniqueSuffix + "." + ext);
  },
});

// 3. Dynamic Switch: Agar app production (Vercel) par hai toh Cloudinary, warna Local
const isProduction = process.env.NODE_ENV === "production";

const upload = multer({
  storage: isProduction ? cloudinaryStorage : localDiskStorage,
});

exports.upload = upload;
