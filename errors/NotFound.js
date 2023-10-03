import CustomError from "./CustomError.js";
import { StatusCodes } from "http-status-codes";

export default class NotFoundError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export const createNotFoundError = (message) => new NotFoundError(message);
