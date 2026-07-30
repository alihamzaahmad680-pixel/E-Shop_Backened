const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then((data) => {
      console.log(
        `Database connected with server successfully: ${data.connection.host}`,
      );
    })
    .catch((err) => {
      console.log("Database connection error:", err);
    });
};

module.exports = connectDatabase;
