import CustomError from "./CustomError.js";
import { StatusCodes } from "http-status-codes";

export default class UnprocessableEntityError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
  }
}

export const createUnprocessableEntityError = (message) =>
  new UnprocessableEntityError(message);
