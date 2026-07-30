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

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(process.env.DB_URL, opts)
      .then((mongoose) => {
        console.log(
          `Database connected successfully: ${mongoose.connection.host}`,
        );
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDatabase;
