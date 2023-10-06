import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema(
  {
    electionName: {
      type: String,
      required: [true, "Please provide election name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a short description of the election"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Election = mongoose.model("Election", ElectionSchema);
export default Election;
