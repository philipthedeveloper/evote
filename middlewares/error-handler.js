import { StatusCodes, ReasonPhrases } from "http-status-codes";
import CustomError from "../errors/CustomError.js";
import { createConflictError } from "../errors/Conflict.js";

const errorHandler = (err, req, res, next) => {
  let errorObject = {};
  console.log(err);
  if (err instanceof CustomError) {
    errorObject.status = err.statusCode;
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
  let status = errorObject?.status || StatusCodes.INTERNAL_SERVER_ERROR;
  return res.status(status).json({
    success: false,
    status,
    message: errorObject?.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};

export default errorHandler;
