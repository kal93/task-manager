require("../db/mongoose");
const User = require("../models/user");

// User.findByIdAndUpdate("6182683a7f80ada8e4caaea4", { age: 27 })
//   .then((res) => {
//     console.log(res);
//     return User.countDocuments({ age: 27 });
//   })
//   .then((r) => {
//     console.log(r, "No of documents with age 28");
//   })
//   .catch((e) => {
//     console.log("Error!", e);
//   });

const updateAgeAndCount = async (id, age) => {
  const user = await User.findByIdAndUpdate(id, {
    age: age,
  });
  const count = await User.countDocuments({ age: age });
  return { user, count };
};

updateAgeAndCount("61837a351f47e63bb12d5b9c", 27)
  .then((resp) => {
    console.log(resp);
  })
  .catch((e) => console.log(e));
