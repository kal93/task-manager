const express = require("express");
const User = require("../models/user");
const log = console.log;

const router = new express.Router();

// =============== USER ROUTES =====================

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const addedUser = await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user: addedUser, token });
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
    res.send({ user, token });
  } catch (error) {
    res.status(401).send({ error });
  }
});

router.get("/users", async (req, res) => {
  try {
    // fetch all users using mongoose. Empty object queries for all the users.
    const users = await User.find({});
    res.status(200).send(users);
  } catch (e) {
    res.status(500).send("Err..");
  }
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send({ error: "User not found." });
    } else {
      res.status(200).send(user);
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/users/:id", async (req, res) => {
  const _id = req.params.id;
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
    const userToBeUpdated = await User.findById(_id);
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

router.delete("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(_id);
    log(deletedUser);
    if (!deletedUser) {
      return res.status(404).send({ error: " User not found." });
    }
    res.send(deletedUser);
  } catch (error) {
    res.status(500).status(error);
  }
});

module.exports = router;
