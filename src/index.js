const express = require("express");
require("./db/mongoose");
const userRoutes = require("./routers/user");
const taskRoutes = require("./routers/task");
const log = console.log;

const app = express();
const port = process.env.PORT || 3000;

// express middlewares must come before app.use route registeration
// app.use((req, res, next) => {
//   console.log(req.method, req.path);
//   // this is must at the end of middleware otherwise it will hang
//   // next();
// });

// app.use((req, res, next) => {
//   const methods = ["GET", "POST", "DELETE", "PATCH"];
//   if (methods.includes(req.method)) {
//     res.status(503).send({
//       error: "Site is under maintainance. Please try after sometime.",
//     });
//   } else {
//     next();
//   }
// });

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

// const Task = require("./models/task");
// const User = require("./models/user");

// const main = async () => {
//   // const task = await Task.findById("618a35ceac4b61e66b27c1a9");
//   // await task.populate("owner");
//   // log(task.owner);

//   const user = await User.findById("618a364bac4b61e66b27c1b0");
//   await user.populate("myTasks"); // myTasks is a virtual property defined with mongoose relationship
//   log(user.myTasks);
// };

// main();
