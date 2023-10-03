import { getUser, login, register } from "../controllers/authController.js";
import { Router } from "express";
import validateToken from "../middlewares/validate-jwt.js";

// Create a new router
const authRouter = Router();

// Bind routes to controllers
authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/get-user", validateToken, getUser);

// Export the router
export default authRouter;
