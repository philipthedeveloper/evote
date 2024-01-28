import { Router } from "express";
import {
  createPoll,
  deletePoll,
  getPoll,
  getPolls,
  updatePoll,
} from "../controllers/index.js";

const pollRouter = Router();

pollRouter.route("/").get(getPolls).post(createPoll);
pollRouter.route("/:pollId").get(getPoll).patch(updatePoll).delete(deletePoll);

export default pollRouter;
