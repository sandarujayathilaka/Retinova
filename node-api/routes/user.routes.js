const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  refreshToken,
  resetPassword,
} = require("../controllers/user.controller");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/refresh-token", refreshToken);

router.post("/reset-password", resetPassword);

module.exports = router;
