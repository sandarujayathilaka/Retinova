const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  refreshToken,
  resetPassword,
  requestPasswordResetLink,
  getUser,
} = require("../controllers/user.controller");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/refresh-token", refreshToken);

router.post("/reset-password", resetPassword);
router.post("/request-password-reset-link", requestPasswordResetLink);

router.get("/user/:id", getUser);

module.exports = router;
