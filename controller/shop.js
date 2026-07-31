const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const User = require("../model/user");
const Shop = require("../model/shop");
const sendToken = require("../utils/jwtToken");
const fs = require("fs");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");
const { isSeller } = require("../middleware/auth");

const ACTIVATION_SECRET =
  process.env.ACTIVATION_SECRET || "your_activation_secret_12345";

const createActivationToken = (seller) => {
  return jwt.sign(seller, ACTIVATION_SECRET, {
    expiresIn: "1d",
  });
};

// Create Shop Route
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password, address, phoneNumber, zipCode } = req.body;

    const sellerEmail = await Shop.findOne({ email });
    if (sellerEmail) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return next(new ErrorHandler("Shop with this email already exists", 400));
    }

    if (!req.file) {
      return next(new ErrorHandler("Please upload an image", 400));
    }

    const fileUrl = req.file.filename;

    const seller = {
      name,
      email,
      password,
      avatar: fileUrl,
      address,
      phoneNumber,
      zipCode,
    };

    const activationToken = createActivationToken(seller);
    const activationUrl = `http://localhost:5173/seller/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your Shop",
        message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email:- ${seller.email} to activate your shop!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Activate Shop Route
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      if (!activation_token) {
        return next(new ErrorHandler("Activation token is missing", 400));
      }

      const newSeller = jwt.verify(activation_token, ACTIVATION_SECRET);

      if (!newSeller) {
        return next(new ErrorHandler("Invalid or expired token", 400));
      }

      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(
          new ErrorHandler("Shop already exists with this email", 400),
        );
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      console.log("Activation Error:", error.message);
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// Login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields!", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User does not exist!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Invalid email or password!", 400));
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      next(error);
    }
  }),
);

// Load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// Get Shop Info by ID
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);

      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      res.status(200).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// Logout shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.status(200).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// Update Seller Info Route
router.put("/update-seller-info", isSeller, async (req, res) => {
  try {
    const { name, description, address, phoneNumber, zipCode } = req.body;

    const shop = await Shop.findByIdAndUpdate(
      req.seller._id,
      {
        name,
        description,
        address,
        phoneNumber,
        zipCode,
      },
      { new: true },
    );

    if (!shop) {
      return res.status(400).json({
        success: false,
        message: "Shop not found",
      });
    }

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update Shop Avatar Route
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new ErrorHandler("Please upload an image", 400));
      }

      const fileUrl = req.file.path || req.file.secure_url;

      const shop = await Shop.findByIdAndUpdate(
        req.seller._id,
        {
          avatar: fileUrl,
        },
        { new: true },
      );

      res.status(200).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);
module.exports = router;
