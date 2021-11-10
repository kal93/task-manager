const express = require("express");
const chalk = require("chalk");
const multer = require("multer");
const User = require("../models/user");
const Task = require("../models/task");
const authMiddleWare = require("../middlewares/auth");
const log = console.log;

const router = new express.Router();

// configure multer for uploading images and set up destination directory for storage
const fileUpload = multer({
  limits: {
    fileSize: 1000000, // in bytes 1MB = 1000000 Bytes
  },
  fileFilter(req, file, callback) {
    const fileName = file.originalname;
    if (!fileName.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error("Unsupported file type."));
    }
    callback(undefined, true);
  },
});

// =============== USER ROUTES =====================

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const addedUser = await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user: addedUser.getPublicProfile(), token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    // this function will live on user instance and NOT ON USER collection i.e not "User." but "user."
    const token = await user.generateAuthToken();
    res.send({ user: user.getPublicProfile(), token });
  } catch (error) {
    res.status(401).send({ error });
  }
});

router.post("/users/logout", authMiddleWare, async (req, res) => {
  try {
    // remove the token to be logged out from tokens array.
    req.user.tokens = req.user.tokens.filter((t) => {
      return t.token !== req.token;
    });
    await req.user.save();
    res.status(200).send({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post("/users/logOutAll", authMiddleWare, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res
      .status(200)
      .send({ message: "Logged out from all sessions successfully." });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.get("/users/me", authMiddleWare, async (req, res) => {
  // log(req.user);
  res.send({
    me: req.user.getPublicProfile(),
  });
});

// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send({ error: "User not found." });
//     } else {
//       res.status(200).send(user);
//     }
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

router.patch("/users/me", authMiddleWare, async (req, res) => {
  // req.user is added by authMiddleWare
  const _id = req.user._id;
  const body = req.body;
  const updates = Object.keys(body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidUpdateOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidUpdateOperation) {
    return res.status(400).send({ error: "Invalid Update." });
  }
  try {
    const userToBeUpdated = await User.findById(_id); // this can be avoided if we used req.user appended by the authMiddleWare
    log(userToBeUpdated);
    if (!userToBeUpdated) {
      return res.status(404).send({ error: "User not found." });
    }
    updates.forEach((update) => {
      return (userToBeUpdated[update] = body[update]);
    });
    const patchedUser = await userToBeUpdated.save();
    // const patchedUser = await User.findByIdAndUpdate(_id, body, {
    //   new: true,
    //   runValidators: true,
    // });
    res.status(200).send(patchedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", authMiddleWare, async (req, res) => {
  const _id = req.user._id;
  try {
    log(chalk.bold.blueBright(`Deleting user ${req.user.name}`));
    // const deletedTasks = await Task.deleteMany({ owner: req.user._id });
    const deletedUser = await req.user.deleteOne();

    if (!deletedUser) {
      log(chalk.bold.yellowBright(`${req.user.name} does not exist.`));
      return res.status(404).send({ error: " User not found." });
    }
    res.send({ deletedUser });
  } catch (error) {
    log(error);
    res.status(500).send({ error });
  }
});

router.post(
  "/users/me/avatar",
  authMiddleWare,
  fileUpload.single("avatar"),
  async (req, res) => {
    // req.file is added by multer
    req.user.avatar = req.file.buffer;
    await req.user.save(); // save fn is from mongoose
    res.sendStatus(200);
  },
  // below callback gets triggered when a middlerware throws an error, in this case multer is the middleware.
  // works for any express middleware and not specific to multer
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", authMiddleWare, async (req, res) => {
  const user = req.user;
  try {
    user.avatar = undefined;
    await user.save(); // save fn is from mongoose
    res.status(200).send({ message: "Avatar deleted successfully." });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
