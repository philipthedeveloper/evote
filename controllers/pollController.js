import { Poll } from "../models/index.js";
import {
  sendSuccessResponse,
  checkEmptyRequestBody,
  throwNotFoundError,
  throwBadRequestError,
  throwUnprocessableEntityError,
} from "../helpers/index.js";
import { StatusCodes } from "http-status-codes";

export const getPolls = async (req, res) => {
  const polls = await Poll.find({});
  return sendSuccessResponse(res, { polls, nbHits: polls.length });
};

export const getPoll = async (req, res) => {
  const { pollId } = req.params;
  const poll = await Poll.findById(pollId);
  if (!poll) throwNotFoundError("Resource not found!");
  return sendSuccessResponse(res, { poll });
};

export const createPoll = async (req, res) => {
  const isBodyEmpty = checkEmptyRequestBody(req.body);
  if (isBodyEmpty) throwBadRequestError("Please provide all fields.");
  const contestants = req.body?.contestants;
  if (!contestants || !Array.isArray(contestants) || contestants.length === 0)
    throwBadRequestError("Please provide contestants");
  const poll = await Poll.create(req.body);
  return sendSuccessResponse(
    res,
    { poll, message: "New poll added" },
    StatusCodes.CREATED
  );
};

export const updatePoll = async (req, res) => {
  const { pollId } = req.params;
  const isBodyEmpty = checkEmptyRequestBody(req.body);
  if (isBodyEmpty) throwUnprocessableEntityError("No update data provided");
  const poll = await Poll.findByIdAndUpdate(pollId, req.body, {
    new: true,
  });
  if (!poll) throwNotFoundError("Resource to be updated not found!");
  return sendSuccessResponse(res, { poll, message: "Update successful" });
};

export const deletePoll = async (req, res) => {
  const { pollId } = req.params;
  const poll = await Poll.findByIdAndDelete(pollId);
  if (!poll) throwNotFoundError("Resource to be deleted not found!");
  return sendSuccessResponse(res, { poll, message: "Delete successful" });
};
