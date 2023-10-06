import { Router } from "express";
import {
  createElection,
  deleteElection,
  getElection,
  getElections,
  updateElection,
} from "../controllers/index.js";

const electionRouter = Router();

electionRouter.route("/").get(getElections).post(createElection);
electionRouter
  .route("/:electionId")
  .get(getElection)
  .patch(updateElection)
  .delete(deleteElection);

export default electionRouter;
