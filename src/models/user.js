const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

const log = console.log;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number.");
        }
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid.");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password must not contain keyword password");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// set up virtual prop, not actual data but relnship between user and task, doesn't change document. It is way for mongoose to figure out how these are related
// NOT stored in DB
// Find Tasks where localField is equal to foreignField
userSchema.virtual("myTasks", {
  ref: "Task",
  localField: "_id", // represents the field you want to connect on the userSchema
  foreignField: "owner", //name of the field on the other thing, establishes relationship with Task
});

// only standard functions on methods because "this" context is needed. This is an instance method.
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  // generate token using jwt lib
  const token = jwt.sign(
    { _id: user._id.toString(), email: user.email }, // info to be added in token
    "thisisme", // secret
    { expiresIn: "1 days" } // expiration time
  );

  // concat token to user document. See schema above.
  user.tokens = user.tokens.concat({ token });

  // save to DB
  await user.save();
  return token;
};

// runs on instance of user for each user, remove sensitive data from user responses. Needs to invoked before sending responses.
userSchema.methods.getPublicProfile = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// "this" is not needed on statics so we can use fat arrow fns. This is model method.
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login. User does not exist.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unauthorized.");
  }
  return user;
};

/**
 * Middleware
 * pre runs before save() fn executes.
 * second parameters needs to be standard function and not arrow function
 */
userSchema.pre("save", async function (next) {
  const user = this;

  // password is modified if a user is created or updated, so hash only for those scenarios and skip if password is already hashed.
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  //continue to next middleware
  next();
});

/**
 * Middleware
 * pre runs after remove() fn executes.
 * second parameters needs to be standard function and not arrow function
 */
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const user = this;
    log("Delete pre", user);

    const tasks = await Task.deleteMany({ owner: user._id });
    //continue to next middleware
    next();
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
