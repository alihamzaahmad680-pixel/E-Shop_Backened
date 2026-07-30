const multer = require("multer");

const storage = multer.diskStorage({
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

exports.upload = multer({ storage });
