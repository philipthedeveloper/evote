import { Poll, Vote } from "../models/index.js";
import {
  checkEmptyRequestBody,
  sendSuccessResponse,
  throwBadRequestError,
  throwNotFoundError,
  throwUnprocessableEntityError,
} from "../helpers/index.js";

// Create a new vote
export const createVote = async (req, res) => {
  const data = req.body;
  const isBodyEmpty = checkEmptyRequestBody(data);
  if (isBodyEmpty)
    throwBadRequestError("Please provide Poll Id and Contestant Name");
  const { _id } = req.currentUser;
  const alreadyVoted = await Vote.findOne({
    pollId: data.pollId,
    voterId: _id,
  });
  if (alreadyVoted) throwUnprocessableEntityError("You've already voted!");
  const isContestant = await Poll.findOne({
    _id: data.pollId,
    contestants: { $in: [data.contestantName] },
  });
  if (!isContestant)
    throwNotFoundError("Contestant not found in poll or poll id incorrect!");
  data.voterId = _id;
  const newVote = await Vote.create(data);
  return sendSuccessResponse(res, { message: "Voted", vote: newVote });
};

// Get all votes
export const getVotes = async (req, res) => {
  const { pollId, votersId, contestantName } = req.query;
  const queryObject = {};

  if (pollId) queryObject.pollId = pollId;
  if (votersId) queryObject.votersId = votersId;
  if (contestantName) queryObject.contestantName = contestantName;

  const votes = await Vote.find(queryObject).populate([
    {
      path: "pollId",
      model: "Poll",
      select: "post contestants",
    },
    {
      path: "voterId",
      model: "Users",
      select: "fullname eligibility email -_id",
    },
  ]);
  return sendSuccessResponse(res, { votes, nbHits: votes.length });
};

// Get single vote
export const getVote = async (req, res) => {
  const { voteId } = req.params;
  const vote = await Vote.findById(voteId).populate([
    {
      path: "pollId",
      model: "Poll",
      select: "post contestants",
    },
    {
      path: "voterId",
      model: "Users",
      select: "fullname eligibility email -_id",
    },
  ]);
  if (!vote) throwNotFoundError("Resource not found!");
  return sendSuccessResponse(res, { message: "Successful", vote });
};

// Delete vote
export const deleteVote = async (req, res) => {
  const { voteId } = req.params;
  const deletedVote = await Vote.findByIdAndDelete(voteId);
  if (!deletedVote) throwNotFoundError("Resource(vote) not found!");
  return sendSuccessResponse(res, {
    message: "Vote Deleted",
    vote: deletedVote,
  });
};
