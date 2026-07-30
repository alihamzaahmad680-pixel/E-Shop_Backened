const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { upload } = require("../multer");
const Shop = require("../model/shop");
const Event = require("../model/event");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 1. Create Event
router.post(
  "/create-event",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return next(new ErrorHandler("Please upload at least one image!", 400));
      }

      const imagesUrls = files.map((file) => {
        return {
          public_id: file.filename,
          url: file.filename,
        };
      });

      const eventData = req.body;
      eventData.images = imagesUrls;
      eventData.shop = shop;

      const event = await Event.create(eventData);

      res.status(201).json({
        success: true,
        event,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  }),
);

// 2. Get All Events of a Shop
router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });

      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  }),
);

// 3. Delete Event of a Shop (Silent Image Cleanup)
router.delete(
  "/delete-shop-event/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const eventId = req.params.id;
      const event = await Event.findById(eventId);

      if (!event) {
        return next(new ErrorHandler("Event is not found with this id", 404));
      }

      if (event.images && event.images.length > 0) {
        event.images.forEach((img) => {
          const fileName = img.public_id || img.url || img;
          const filePath = path.join(
            process.cwd(),
            "uploads",
            path.basename(fileName),
          );

          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, () => {});
          }
        });
      }

      await Event.findByIdAndDelete(eventId);

      res.status(200).json({
        success: true,
        message: "Event deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  }),
);

module.exports = router;
