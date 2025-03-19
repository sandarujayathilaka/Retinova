const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  refreshToken,
  resetPassword,
  requestPasswordResetLink,
  getUser,
  addAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleUserStatus,
  getAllUsers,
  getUserProfile,
} = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/refresh-token", refreshToken);

router.post("/reset-password", resetPassword);
router.post("/request-password-reset-link", requestPasswordResetLink);

router.get("/user/:id", getUser);

router.post("/admins", requireAuth([ROLES.ADMIN]), addAdmin);
router.get("/admins", requireAuth([ROLES.ADMIN]), getAdmins);
router.get("/admins/:id", requireAuth([ROLES.ADMIN]), getAdminById);
router.put("/admins/:id", requireAuth([ROLES.ADMIN]), updateAdmin);
router.delete("/admins/:id", requireAuth([ROLES.ADMIN]), deleteAdmin);

router.get("/users", requireAuth([ROLES.ADMIN]), getAllUsers);
router.patch("/users/:id/status", requireAuth([ROLES.ADMIN]), toggleUserStatus);

router.get("/me", requireAuth([ROLES.PATIENT, ROLES.DOCTOR]), getUserProfile);

module.exports = router;
