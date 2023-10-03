import CustomError from "./CustomError.js";
import { StatusCodes } from "http-status-codes";

export default class UnauthorizedError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export const createUnauthorizedError = (message) =>
  new UnauthorizedError(message);
