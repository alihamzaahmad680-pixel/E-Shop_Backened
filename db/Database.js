// const mongoose = require("mongoose");

// const connectDatabase = () => {
//   mongoose
//     .connect(process.env.DB_URL)
//     .then((data) => {
//       console.log(
//         `Database connected with server successfully: ${data.connection.host}`,
//       );
//     })
//     .catch((err) => {
//       console.log("Database connection error:", err);
//     });
// };

// module.exports = connectDatabase;
const mongoose = require("mongoose");

const connectDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout jaldi pakre agar issue ho
    });
    console.log(`Database connected successfully: ${mongoose.connection.host}`);
  } catch (err) {
    console.log("Database connection error:", err);
  }
};

module.exports = connectDatabase;
