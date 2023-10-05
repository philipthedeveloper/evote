import {
  getUser,
  login,
  register,
  emailVerification,
  verifyOTP,
} from "../controllers/authController.js";
import { Router } from "express";
import validateToken from "../middlewares/validate-jwt.js";

// Create a new router
const authRouter = Router();

// Bind routes to controllers
authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/get-user", validateToken, getUser);
authRouter.post("/email-verification", validateToken, emailVerification);
authRouter.post("/verify-otp", validateToken, verifyOTP);

// Export the router
export default authRouter;
