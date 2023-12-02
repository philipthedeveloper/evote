import {
  createBadRequestError,
  createConflictError,
  createMethodNotAllowedError,
  createNotFoundError,
  createUnauthorizedError,
  createUnprocessableEntityError,
} from "../errors/index.js";
import CustomError from "../errors/CustomError.js";
import * as ERROR_TYPE from "./errorTypes.js";
import { ReasonPhrases } from "http-status-codes";

export const throwRequestError = (errorType, message) => {
  switch (errorType) {
    case ERROR_TYPE.BAD_REQUEST:
      throw createBadRequestError(message);
    case ERROR_TYPE.CONFLICT:
      throw createConflictError(message);
    case ERROR_TYPE.METHOD_NOT_ALLOWED:
      throw createMethodNotAllowedError(message);
    case ERROR_TYPE.NOT_FOUND:
      throw createNotFoundError(message);
    case ERROR_TYPE.UNAUTHORIZED:
      throw createUnauthorizedError(message);
    case ERROR_TYPE.UNPROCESSABLE_ENTITY:
      throw createUnprocessableEntityError(message);
    default:
      throw new CustomError(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
};

export const throwBadRequestError = (message) => {
  throw createBadRequestError(message);
};

export const throwConflictError = (message) => {
  throw createConflictError(message);
};

export const throwMethodNotAllowedError = (message) => {
  throw createMethodNotAllowedError(message);
};

export const throwNotFoundError = (message) => {
  throw createNotFoundError(message);
};

export const throwUnauthorizedError = (message) => {
  throw createUnauthorizedError(message);
};

export const throwUnprocessableEntityError = (message) => {
  throw createUnprocessableEntityError(message);
};

export const throwServerError = (message) => {
  throw new CustomError(ReasonPhrases.INTERNAL_SERVER_ERROR);
};
