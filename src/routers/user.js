const express = require("express");
const chalk = require("chalk");
const User = require("../models/user");
const Task = require("../models/task");
const authMiddleWare = require("../middlewares/auth");
const log = console.log;

const router = new express.Router();

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

module.exports = router;
