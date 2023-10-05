import mongoose from "mongoose";

const ResetOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Must provide current email"],
      trim: true,
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    otpCode: {
      type: String,
      required: [true, "Must provide otp code"],
    },
    expiresIn: {
      type: Number,
      required: [true, "Must provide expiration date"],
    },
    tries: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", ResetOTPSchema);
export default Otp;
