const express = require("express");
const Task = require("../models/task");
const log = console.log;

const router = new express.Router();

// ================= TASK ROUTES ====================
router.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  try {
    const createdTask = await task.save();
    res.status(201).send(createdTask);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.get("/tasks/:id", async (req, resp) => {
  const _id = req.params.id;
  log(_id);
  try {
    const task = await Task.findById(_id);
    if (!task) {
      return resp.status(404).send({ error: "Not task found." });
    }
    resp.status(200).send(task);
  } catch (error) {
    resp.status(500).send(error);
  }
});

router.patch("/tasks/:id", async (req, res) => {
  const _id = req.params.id;
  const body = req.body;
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
    const taskToBeUpdated = await Task.findById(_id);
    log(taskToBeUpdated);
    if (!taskToBeUpdated) {
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

router.delete("/tasks/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const deletedTask = await Task.findByIdAndDelete(_id);
    if (!deletedTask) {
      return res.status(404).send({ error: "Task not found." });
    }
    res.status(200).send({ deletedTask });
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
