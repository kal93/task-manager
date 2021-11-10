const express = require("express");
const Task = require("../models/task");
const User = require("../models/user");
const authMiddleWare = require("../middlewares/auth");
const chalk = require("chalk");
const log = console.log;

const router = new express.Router();

// ================= TASK ROUTES ====================
router.post("/tasks", authMiddleWare, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    const createdTask = await task.save();
    res.status(201).send(createdTask);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET tasks?completed=true
// tasks?limit=10&skip
// tasks?sortBy=createdAt:asc
router.get("/tasks", authMiddleWare, async (req, res) => {
  const user = req.user;
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
  }
  try {
    log(chalk.bold.blueBright(`Accessing all tasks for ${user.name}`));
    const tasks = await user.populate({
      path: "myTasks",
      match,
      options: {
        limit: parseInt(req.query.limit), // page size
        // skip: parseInt(req.query.page), // skip starts at 0, see below calculation for better understanding
        skip: parseInt(req.query.limit) * (parseInt(req.query.page) - 1), // skip is the number of records to skip
        sort: sort,
        // {
        //   completed: 1, // 1 is ascending, -1 is descending
        // },
      },
    });
    res.send(tasks.myTasks);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.get("/tasks/:id", authMiddleWare, async (req, resp) => {
  const _id = req.params.id;
  const userId = req.user._id;
  log(chalk.bold.blueBright(`Accessing tasks for ${req.user.name}`));
  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: userId });
    if (!task) {
      return resp.status(404).send({ error: "No task found." });
    }
    resp.status(200).send(task);
  } catch (error) {
    resp.status(500).send(error);
  }
});

router.patch("/tasks/:id", authMiddleWare, async (req, res) => {
  const _id = req.params.id;
  const body = req.body;
  const userId = req.user._id;
  const updates = Object.keys(body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdateOperation = updates.every((u) => {
    return allowedUpdates.includes(u);
  });

  if (!isValidUpdateOperation) {
    return res.status(400).send({ error: "Invalid update." });
  }
  try {
    // const updatedTask = await Task.findByIdAndUpdate(_id, body, {
    //   new: true,
    //   runValidators: true,
    // });
    const taskToBeUpdated = await Task.findOne({ _id, owner: userId });
    // const taskToBeUpdated = await Task.findById(_id);
    log(
      chalk.bold.blueBright(
        `Updating task ${taskToBeUpdated} for ${req.user.name}`
      )
    );
    if (!taskToBeUpdated) {
      log(
        chalk.bold.yellowBright(
          `No task found for id ${_id} belonging to ${req.user.name}`
        )
      );
      return res.status(404).send({ error: "Task not found." });
    }
    updates.forEach((key) => {
      taskToBeUpdated[key] = body[key];
    });
    const updatedTask = await taskToBeUpdated.save();
    log(updatedTask);
    res.status(200).send(updatedTask);
  } catch (error) {
    log(error);
    res.status(400).send(error);
  }
});

router.delete("/tasks/:id", authMiddleWare, async (req, res) => {
  const _id = req.params.id;
  const userId = req.user._id;
  try {
    const deletedTask = await Task.findOneAndDelete({ _id, owner: userId });
    log(
      chalk.bold.blueBright(`Deleting task ${deletedTask} for ${req.user.name}`)
    );
    if (!deletedTask) {
      log(
        chalk.bold.yellowBright(
          `No task found for id ${_id} belonging to ${req.user.name}`
        )
      );
      return res.status(404).send({ error: "Task not found." });
    }
    res.status(200).send({ deletedTask });
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
