import { Router } from "express";
import {
  createVote,
  deleteVote,
  getVote,
  getVotes,
} from "../controllers/index.js";

const voteRouter = Router();

voteRouter.route("/").get(getVotes).post(createVote);
voteRouter.route("/:voteId").get(getVote).delete(deleteVote);

export default voteRouter;
