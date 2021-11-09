const express = require("express");
require("./db/mongoose");
const userRoutes = require("./routers/user");
const taskRoutes = require("./routers/task");
const log = console.log;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(userRoutes);
app.use(taskRoutes);

app.listen(port, () => {
  log(`Express server is running on port ${port}`);
});

// const jwt = require("jsonwebtoken");

// const myFn = async () => {
//   const token = jwt.sign(
//     { _id: "123", email: "tenten@tailedfox.com" },
//     "thisisme",
//     { expiresIn: "1 day" }
//   );
//   log(token);
//   const data = jwt.verify(token, "thisisme");
//   log(data);
// };

// myFn();
