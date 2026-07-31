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
// const mongoose = require("mongoose");

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// const connectDatabase = async () => {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//       serverSelectionTimeoutMS: 10000,
//     };

//     cached.promise = mongoose
//       .connect(process.env.DB_URL, opts)
//       .then((mongoose) => {
//         console.log(
//           `Database connected successfully: ${mongoose.connection.host}`,
//         );
//         return mongoose;
//       });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null;
//     throw e;
//   }

//   return cached.conn;
// };

// module.exports = connectDatabase;
// const mongoose = require("mongoose");

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// const connectDatabase = async () => {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: true, // yahan true kar dein taake commands buffer ho sakein
//       serverSelectionTimeoutMS: 30000, // timeout ko 30 seconds kar dein
//     };

//     cached.promise = mongoose
//       .connect(process.env.DB_URL, opts)
//       .then((mongoose) => {
//         console.log(
//           `Database connected successfully: ${mongoose.connection.host}`,
//         );
//         return mongoose;
//       });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null;
//     throw e;
//   }

//   return cached.conn;
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

  // Check karein ke environment variable kaun sa active hai
  const DB_URL =
    process.env.DB_URL || process.env.MONGO_URI || process.env.DB_URI;

  if (!DB_URL) {
    throw new Error(
      "Please define the DB_URL or MONGO_URI environment variable inside Vercel",
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Serverless ke liye false behtar hota hai taake buffering block na kare
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    };

    cached.promise = mongoose.connect(DB_URL, opts).then((mongoose) => {
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
