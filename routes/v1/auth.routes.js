import { Router } from "express";
import { authenticate } from "../../middlewares/index.js";
import {
  generateJWT,
  generateSpayeeJWT,
  generateThinkificJWT,
  googleAuth,
  invalidateJWT,
  logIn,
  passwordReset,
  passwordResetInit,
  passwordSet,
  refreshJWT,
  signUp,
} from "../../controllers/index.js";
import {
  validateCredential,
  validateGoogleAuth,
  validateLogIn,
  validatePasswordReset,
  validatePasswordResetInit,
  validateSignUp,
} from "../../validators/index.js";

const router = Router();

// public actions
router.post("/signup", validateSignUp, signUp);
router.post("/login", validateLogIn, logIn, generateJWT);
router.post("/google", validateGoogleAuth, googleAuth, generateJWT);
router.post("/refresh", refreshJWT, generateJWT);
router.post("/thinkific", authenticate, generateThinkificJWT);
router.post("/sso", authenticate, generateSpayeeJWT);
router.post("/logout", invalidateJWT);
router.post("/passwordReset", validatePasswordResetInit, passwordResetInit);
router.put("/passwordReset", validatePasswordReset, passwordReset);
router.put("/credential", validateCredential, passwordSet);

export default router;
