import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [true, "Please provide email"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Invalid email",
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
      unique: true,
      match: [/^[^A-Za-z]*$/g, "Invalid phone number"],
    },
    username: {
      type: String,
      default: "",
      trim: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true,
    },
    dob: {
      type: Date,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      trim: true,
      minLength: [
        8,
        "The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).",
      ],
    },
    accountType: {
      type: String,
      default: "user",
      enum: {
        values: ["user", "admin"],
        message: "Invalid `{PATH}` (`{VALUE}`)",
      },
    },
    eligibility: {
      type: String,
      enum: {
        values: ["Not-Allowed", "Allowed"],
        message: "Invalid `{PATH}` (`{VALUE}`)",
      },
      default: "Not-Allowed",
    },
  },
  { timestamps: true }
);

// Setup bcryptjs for password hashing
UserSchema.pre("save", async function () {
  let salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Setup document method for password validation
UserSchema.methods.validatePassword = async function (inputPassword) {
  return await bcryptjs.compare(inputPassword, this.password);
};

// Setup jwt for token management
UserSchema.methods.generateToken = function ({ userId, email, fullName }) {
  let token = jwt.sign({ userId, email, fullName }, process.env.JWT_SECRET, {
    issuer: process.env.ISSUER,
    expiresIn: process.env.JWT_EXPIRATION,
  });
  return token;
};

// Validates the JWT to avoid malforms
UserSchema.methods.validateToken = function (token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: process.env.ISSUER,
  });
};

const User = mongoose.model("Users", UserSchema);

export default User;
