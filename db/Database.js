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
const mongoose = persistanceCheck => {
  const cached = global.mongoose || { conn: null, promise: null };
  return cached;
};

const connectDatabase = async () => {
  if (global.mongoose && global.mongoose.conn) {
    return global.mongoose.conn;
  }

  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    global.mongoose.promise = mongoose.connect(process.env.DB_URL, opts).then((mongoose) => {
      console.log(`Database connected successfully: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
};

module.exports = connectDatabase;