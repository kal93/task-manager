const mongoose = require("mongoose");
const validator = require("validator");

mongoose.connect(process.env.MONGO_DB_CONNECTION_URL, {
  useNewUrlParser: true,
  //   useCreateIndex: true,
});
