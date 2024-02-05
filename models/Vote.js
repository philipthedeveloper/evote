import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  pollId: {
    type: String,
    required: [true, "Provide Poll Id"],
    trim: true,
  },
  contestantName: {
    type: String,
    required: [true, "Provide Contestant Name"],
    trim: true,
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Provide Voter's Id"],
    trim: true,
  },
});

const Vote = mongoose.model("Votes", VoteSchema);

export default Vote;
