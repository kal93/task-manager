const jwt = require("jsonwebtoken");
const user = require("../models/user");

const authMiddleWare = async (req, res, next) => {
  try {
    const token = req.header("authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(token, "thisisme");
    console.log(decodedToken);
    const u = await user.findOne({
      _id: decodedToken._id,
      "tokens.token": token,
    });
    if (!u) {
      throw new Error(" User does not exist.");
    }
    // append user to avoid fetching user again later on
    req.token = token;
    req.user = u;
    next();
  } catch (error) {
    res.status(401).send({ e: "Invalid Token", error });
  }
};

module.exports = authMiddleWare;
