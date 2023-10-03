import { ReasonPhrases } from "http-status-codes";
import { createMethodNotAllowedError } from "../errors/index.js";

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
];
const methodChecker = (req, res, next) => {
  if (!ALLOWED_METHODS.includes(req.method.toUpperCase()))
    throw createMethodNotAllowedError(ReasonPhrases.METHOD_NOT_ALLOWED);
  next();
};

export default methodChecker;
