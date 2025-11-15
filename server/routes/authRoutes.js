const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const {
  getMe,
  updateProfile,
  logout,
  googleCallback,
  googleFailure,
  completeProfile,
  updatePublicKey,
  getPublicKey,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  completeProfileValidation,
  validate,
} = require("../middleware/validation");

// Google OAuth routes (Primary authentication method)
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: false,
  }),
  googleCallback
);

router.get("/google/failure", googleFailure);

// Profile completion route (after Google OAuth)
router.put(
  "/complete-profile",
  protect,
  completeProfileValidation,
  validate,
  completeProfile
);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/logout", protect, logout);

// E2EE public key routes
router.put("/public-key", protect, updatePublicKey);
router.get("/public-key/:userId", protect, getPublicKey);

module.exports = router;
