const mongoose = require("mongoose");
const validator = require("validator");

const connectionUrl = "mongodb://127.0.0.1:27017"; // 27017 is default port for mongodb
const dataBaseName = "task-manager";
const dBUrl = "mongodb://127.0.0.1:27017/task-manager-api";

mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
  useNewUrlParser: true,
  //   useCreateIndex: true,
});
