import jwt from "jsonwebtoken";
import { createUnauthorizedError } from "../errors/index.js";
import { User } from "../models/index.js";

// This middleware is used to validate the token on incoming request
const validateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Ensure the authorization property is present in req headers
  if (!authHeader || !authHeader.startsWith("Bearer "))
    throw createUnauthorizedError("Token not provided");
  // Extract the token from the authorization header
  const token = authHeader.split(" ")[1];
  // Verify the token with jwt
  let valid = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: process.env.ISSUER,
  });
  if (!valid) throw createUnauthorizedError("Malformed Token");
  // Pick the userId and email from the decoded token
  const { userId, email } = valid;
  // Check if user with such credential exists in the database
  const currentUser = await User.findOne({ _id: userId, email });
  if (!currentUser) throw createUnauthorizedError("User not authorized");
  req.currentUser = currentUser;
  next();
};
export default validateToken;
