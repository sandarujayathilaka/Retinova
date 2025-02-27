const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  refreshToken,
} = require("../controllers/user.controller");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/refresh-token", refreshToken);

module.exports = router;
