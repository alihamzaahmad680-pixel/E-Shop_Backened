const app = require("../app");
const connectDatabase = require("../db/Database");

// Connect Database
connectDatabase();

module.exports = app;