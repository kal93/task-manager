require("../db/mongoose");
const Task = require("../models/task");

// Task.findByIdAndDelete("6182c24b34cef43909628d15")
//   .then((res) => {
//     console.log(res);
//     return Task.countDocuments({ completed: false });
//   })
//   .then((r) => {
//     console.log("No of incomplete tasks %d", r);
//   })
//   .catch((e) => {
//     console.log("Error!", e);
//   });

const deleteTaskByIdAndCount = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  const count = await Task.countDocuments({ completed: false });
  return {
    deletedTask: task,
    inCompleteTaskCount: count,
  };
};

deleteTaskByIdAndCount("6182bfbad62616c91cd2ecf8")
  .then((resp) => {
    console.log("Result...", resp);
  })
  .catch((e) => {
    console.log("Error", e);
  });
