import { StatusCodes, ReasonPhrases } from "http-status-codes";
import CustomError from "../errors/CustomError.js";
import { createConflictError } from "../errors/Conflict.js";
import { errorLogger } from "./req-logger.js";
import { saveToErrorDetails } from "../helpers/index.js";

const errorHandler = (err, req, res, next) => {
  let errorObject = {};
  console.log(err);

  process.env.NODE_ENV === "development" &&
    (() => {
      saveToErrorDetails(err);

      errorLogger(req, res, (error) => {
        if (error) {
          console.log("Error logging failed: ", error);
        }
      });
    })();

  if (err instanceof CustomError) {
    errorObject.status = err?.statusCode;
    errorObject.message = err.message;
  }
  if (err && err.name === "ValidationError") {
    errorObject.status = StatusCodes.BAD_REQUEST;
    errorObject.message = err.message;
  }
  if (err && err.code === 11000) {
    let message = Object.keys(err.keyValue).join(", ");
    let newConflictError = createConflictError(`${message} already exist`);
    errorObject.status = newConflictError.statusCode;
    errorObject.message = newConflictError.message;
  }
  if (
    err &&
    (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
  ) {
    errorObject.message = err.message;
    errorObject.status = StatusCodes.UNAUTHORIZED;
  }

  if (
    err &&
    (err.type === "entity.parse.failed" || err.name === "SyntaxError")
  ) {
    errorObject.status = err?.statusCode || err?.status;
    errorObject.message = "JSON"
      ? "Invalid JSON format in the request body. Please ensure there are no trailing commas."
      : "Syntax Error: Invalid data format.";
  }
  let status = errorObject?.status || StatusCodes.INTERNAL_SERVER_ERROR;

  return res.status(status).json({
    success: false,
    status,
    message: errorObject?.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

export default errorHandler;
