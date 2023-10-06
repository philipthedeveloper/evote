import Election from "../models/Election.js";
import {
  sendSuccessResponse,
  throwRequestError,
  checkEmptyRequestBody,
} from "../helpers/index.js";
import { StatusCodes } from "http-status-codes";
import * as ERROR_TYPES from "../helpers/errorTypes.js";

export const getElections = async (req, res) => {
  const elections = await Election.find({});
  return sendSuccessResponse(res, { elections, nbHtis: elections.length });
};

export const getElection = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.findById(electionId);
  if (!election)
    throwRequestError(ERROR_TYPES.NOT_FOUND, `Resource not found!`);
  return sendSuccessResponse(res, { election });
};

export const createElection = async (req, res) => {
  const isBodyEmpty = checkEmptyRequestBody(req.body);
  if (isBodyEmpty)
    throwRequestError(ERROR_TYPES.BAD_REQUEST, "Please provide all fields");
  const election = await Election.create(req.body);
  return sendSuccessResponse(
    res,
    { election, message: "New election added" },
    StatusCodes.CREATED
  );
};

export const updateElection = async (req, res) => {
  const { electionId } = req.params;
  const isBodyEmpty = checkEmptyRequestBody(req.body);
  if (isBodyEmpty)
    throwRequestError(
      ERROR_TYPES.UNPROCESSABLE_ENTITY,
      "No update data provided"
    );
  const election = await Election.findByIdAndUpdate(electionId, req.body);
  if (!election)
    throwRequestError(
      ERROR_TYPES.NOT_FOUND,
      "Resource to be updated not found!"
    );
  return sendSuccessResponse(res, { election, message: "Update successful" });
};

export const deleteElection = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.findByIdAndDelete(electionId);
  if (!election)
    throwRequestError(
      ERROR_TYPES.NOT_FOUND,
      "Resource to be delete not found!"
    );
  return sendSuccessResponse(res, { election, message: "Delete successful" });
};
