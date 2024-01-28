import mongoose from "mongoose";
import { UserSchema } from "./User.js";

const PollSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Types.ObjectId,
      ref: "Election",
      required: [true, "Please provide election Id"],
    },
    electionName: {
      type: String,
      required: [true, "Please provide election name"],
      trim: true,
    },
    post: {
      type: String,
      required: [true, "Position not specified"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a short description for this poll"],
      trim: true,
    },
    contestants: {
      type: [String],
      required: [true, "Must provide contestants"],
      default: undefined,
    },
  },
  { timestamps: true }
);

const Poll = mongoose.model("Poll", PollSchema);
export default Poll;
