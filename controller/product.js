// const express = require("express");
// const { isSeller } = require("../middleware/auth");
// const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const router = express.Router();
// const Product = require("../model/product");
// const Shop = require("../model/shop");
// const Order = require("../model/order");
// const { upload } = require("../multer");
// const ErrorHandler = require("../utils/ErrorHandler");
// const fs = require("fs");
// const path = require("path");
// const { isAuthenticated } = require("../middleware/auth");

// // 1. Create Product
// router.post(
//   "/create-product",
//   upload.array("images"),
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const shopId = req.body.shopId;
//       const shop = await Shop.findById(shopId);

//       if (!shop) {
//         return next(new ErrorHandler("Shop Id is invalid!", 400));
//       }

//       const files = req.files;
//       if (!files || files.length === 0) {
//         return next(new ErrorHandler("Please upload at least one image!", 400));
//       }

//       const imagesUrls = files.map((file) => {
//         return {
//           public_id: file.filename,
//           url: file.filename,
//         };
//       });

//       const productData = req.body;
//       productData.images = imagesUrls;
//       productData.shop = shop;

//       const product = await Product.create(productData);

//       res.status(201).json({
//         success: true,
//         product,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message || error, 400));
//     }
//   }),
// );

// // 2. Get All Products of a Shop (Updated with populate)
// router.get(
//   "/get-all-products-shop/:id",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const products = await Product.find({ shopId: req.params.id }).populate(
//         "shop",
//       );

//       res.status(200).json({
//         success: true,
//         products,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message || error, 400));
//     }
//   }),
// );

// // 3. Delete Product of a Shop (With Uploads Folder Image Cleanup)
// router.delete(
//   "/delete-shop-product/:id",
//   isSeller,
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const productId = req.params.id;
//       const product = await Product.findById(productId);

//       if (!product) {
//         return next(new ErrorHandler("Product is not found with this id", 404));
//       }
//       if (product.images && product.images.length > 0) {
//         product.images.forEach((img) => {
//           const fileName = img.public_id || img.url || img;
//           const filePath = path.join(
//             process.cwd(),
//             "uploads",
//             path.basename(fileName),
//           );

//           if (fs.existsSync(filePath)) {
//             fs.unlink(filePath, () => {});
//           }
//         });
//       }

//       await Product.findByIdAndDelete(productId);

//       res.status(200).json({
//         success: true,
//         message: "Product Deleted successfully!",
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message || error, 400));
//     }
//   }),
// );

// // 4. Get All Products (Updated with populate)
// router.get(
//   "/get-all-products",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const products = await Product.find()
//         .sort({ createdAt: -1 })
//         .populate("shop");

//       res.status(200).json({
//         success: true,
//         products,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }),
// );

// // review for a product
// router.put(
//   "/create-new-review",
//   isAuthenticated,
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const { user, rating, comment, productId, orderId } = req.body;

//       console.log("Backend ko mili productId:", productId);

//       if (!productId) {
//         return next(
//           new ErrorHandler("Product ID is missing from request!", 400),
//         );
//       }

//       let product = null;

//       if (
//         typeof productId === "string" &&
//         productId.length === 24 &&
//         productId.match(/^[0-9a-fA-F]{24}$/)
//       ) {
//         product = await Product.findById(productId);
//       }

//       if (!product) {
//         product = await Product.findOne({
//           $or: [{ id: Number(productId) || productId }, { name: productId }],
//         });
//       }

//       if (!product) {
//         return next(new ErrorHandler("Product database mein nahi mila!", 400));
//       }

//       const review = {
//         user: user || req.user,
//         rating,
//         comment,
//         productId: product._id,
//       };

//       const isReviewed = product.reviews.find(
//         (rev) =>
//           rev.user &&
//           rev.user._id &&
//           rev.user._id.toString() === req.user._id.toString(),
//       );

//       if (isReviewed) {
//         product.reviews.forEach((rev) => {
//           if (
//             rev.user &&
//             rev.user._id &&
//             rev.user._id.toString() === req.user._id.toString()
//           ) {
//             rev.rating = rating;
//             rev.comment = comment;
//             rev.user = user || req.user;
//           }
//         });
//       } else {
//         product.reviews.push(review);
//       }

//       let avg = 0;
//       product.reviews.forEach((rev) => {
//         avg += rev.rating;
//       });

//       product.ratings = avg / product.reviews.length;

//       await product.save({ validateBeforeSave: false });

//       await Order.findOneAndUpdate(
//         { _id: orderId },
//         { $set: { "cart.$[elem].isReviewed": true } },
//         {
//           arrayFilters: [
//             {
//               $or: [
//                 { "elem._id": productId },
//                 { "elem.productId": productId },
//                 { "elem.id": productId },
//               ],
//             },
//           ],
//           new: true,
//         },
//       );

//       res.status(200).json({
//         success: true,
//         message: "Reviewed successfully!",
//       });
//     } catch (error) {
//       console.log("Review Error:", error.message);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }),
// );

// module.exports = router;
const express = require("express");
const { isSeller } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Shop = require("../model/shop");
const Order = require("../model/order");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
const path =  require("path");
const { isAuthenticated } = require("../middleware/auth");

// 1. Create Product (Updated for Local & Cloudinary support)
router.post(
  "/create-product",
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

      // Check karein ke environment production (Vercel/Cloudinary) hai ya local
      const isProduction = process.env.NODE_ENV === "production";

      const imagesUrls = files.map((file) => {
        if (isProduction) {
          // Cloudinary ka case: file.path pura secure URL deta hai, aur file.filename public_id hoti hai
          return {
            public_id: file.filename,
            url: file.path,
          };
        } else {
          // Local storage ka case: sirf filename save hoga
          return {
            public_id: file.filename,
            url: file.filename,
          };
        }
      });

      const productData = req.body;
      productData.images = imagesUrls;
      productData.shop = shop;

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  }),
);

// 2. Get All Products of a Shop (Updated with populate)
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id }).populate(
        "shop",
      );

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  }),
);

// 3. Delete Product of a Shop (With Local & Cloudinary Cleanup support)
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product is not found with this id", 404));
      }

      const isProduction = process.env.NODE_ENV === "production";

      if (product.images && product.images.length > 0) {
        product.images.forEach(async (img) => {
          if (isProduction) {
            // Agar Cloudinary par hai toh wahan se delete karein
            const cloudinary = require("cloudinary").v2;
            if (img.public_id) {
              await cloudinary.uploader.destroy(img.public_id);
            }
          } else {
            // Local folder se delete karein
            const fileName = img.public_id || img.url || img;
            const filePath = path.join(
              process.cwd(),
              "uploads",
              path.basename(fileName),
            );

            if (fs.existsSync(filePath)) {
              fs.unlink(filePath, () => {});
            }
          }
        });
      }

      await Product.findByIdAndDelete(productId);

      res.status(200).json({
        success: true,
        message: "Product Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  }),
);

// 4. Get All Products (Updated with populate)
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 })
        .populate("shop");

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      if (!productId) {
        return next(
          new ErrorHandler("Product ID is missing from request!", 400),
        );
      }

      let product = null;

      if (
        typeof productId === "string" &&
        productId.length === 24 &&
        productId.match(/^[0-9a-fA-F]{24}$/)
      ) {
        product = await Product.findById(productId);
      }

      if (!product) {
        product = await Product.findOne({
          $or: [{ id: Number(productId) || productId }, { name: productId }],
        });
      }

      if (!product) {
        return next(new ErrorHandler("Product database mein nahi mila!", 400));
      }

      const review = {
        user: user || req.user,
        rating,
        comment,
        productId: product._id,
      };

      const isReviewed = product.reviews.find(
        (rev) =>
          rev.user &&
          rev.user._id &&
          rev.user._id.toString() === req.user._id.toString(),
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (
            rev.user &&
            rev.user._id &&
            rev.user._id.toString() === req.user._id.toString()
          ) {
            rev.rating = rating;
            rev.comment = comment;
            rev.user = user || req.user;
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { "cart.$[elem].isReviewed": true } },
        {
          arrayFilters: [
            {
              $or: [
                { "elem._id": productId },
                { "elem.productId": productId },
                { "elem.id": productId },
              ],
            },
          ],
          new: true,
        },
      );

      res.status(200).json({
        success: true,
        message: "Reviewed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

module.exports = router;
