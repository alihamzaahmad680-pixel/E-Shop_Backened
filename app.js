const express = require("express");
const errorMiddleware = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "backened/config/.env",
  });
}
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Shop Backend is running",
  });
});

const product = require("./controller/product");
const user = require("./controller/user");
const shop = require("./controller/shop");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const message = require("./controller/message");

app.use("/api/v2/product", product);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);

app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/order", order);

app.use(errorMiddleware);

module.exports = app;
