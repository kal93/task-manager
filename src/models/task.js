const mongoose = require("mongoose");
const log = console.log;

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      required: false,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

taskSchema.pre("save", async function (next) {
  const task = this;
  log(task, "Before task save");

  // continue to next middleware, otherwise it will hang here
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
