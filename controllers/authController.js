import { User, Otp } from "../models/index.js";
import { StatusCodes } from "http-status-codes";
import {
  createBadRequestError,
  createUnauthorizedError,
  createUnprocessableEntityError,
} from "../errors/index.js";
import _ from "lodash";
import sendEmail from "../helpers/email-sender.js";

const login = async function (req, res) {
  const data = req.body;
  const numOfKeys = Object.keys(data).length;
  if (numOfKeys === 0 || !data.email || !data.password)
    throw createBadRequestError("Email and Password required");

  const user = await User.findOne({ email: data.email });
  if (!user) throw createUnauthorizedError("Invalid Email or Password");
  // Validate the password using the document method (validatePassword)
  /**
   * @function
   * @argument password @type String
   * @returns @type Boolean
   */
  const isValidPassword = await user.validatePassword(data.password);
  if (!isValidPassword)
    throw createUnauthorizedError("Invalid Email or Password");
  // Generate jwt for valid email and password
  const userWithoutPassword = _.omit(user.toObject(), "password");
  userWithoutPassword.userId = userWithoutPassword._id;
  const { userId, email, fullname } = userWithoutPassword;
  const accessToken = user.generateToken({ userId, email, fullname });
  return res.status(StatusCodes.OK).json({
    success: true,
    status: StatusCodes.OK,
    message: "Login successful",
    user: userWithoutPassword,
    accessToken,
  });
};

const register = async function (req, res) {
  const data = req.body;
  const numOfKeys = Object.keys(data).length;
  if (numOfKeys === 0) throw createBadRequestError("Provide all fields");
  const newUser = await User.create(data);
  const userWithoutPassword = _.omit(newUser.toObject(), "password");
  userWithoutPassword.userId = userWithoutPassword._id;
  const { userId, email, fullname } = userWithoutPassword;
  const accessToken = newUser.generateToken({ userId, email, fullname });
  return res.status(StatusCodes.CREATED).json({
    success: true,
    status: StatusCodes.CREATED,
    message: "Account created successfully",
    user: userWithoutPassword,
    accessToken,
  });
};

const getUser = async (req, res) => {
  if (req.currentUser) {
    const userWithoutPassword = _.omit(req.currentUser.toObject(), "password");
    userWithoutPassword.userId = userWithoutPassword._id;
    return res.status(StatusCodes.OK).json({
      success: true,
      status: StatusCodes.OK,
      message: "Successful",
      user: userWithoutPassword,
    });
  }
  throw createUnauthorizedError("User not authenticated");
};

const emailVerification = async (req, res) => {
  const { email } = req.currentUser;
  if (req.currentUser.eligibility === "Allowed")
    throw createUnprocessableEntityError("Account already verified");
  const user = await User.findOne({
    email: { $regex: email, $options: "i" },
  });
  if (!user) throw createUnauthorizedError("Unauthorized User");
  const otpCode = Math.floor(Math.random() * 900000) + 100000;
  const expiresIn = new Date().getTime() + 300 * 1000;
  const newOtpDoc = { email, otpCode: otpCode.toString(), expiresIn };
  const alreadyExist = await Otp.findOne({ email });
  if (alreadyExist) {
    alreadyExist.$set("otpCode", otpCode.toString());
    await alreadyExist.save();
  } else {
    const otp = await Otp.create(newOtpDoc);
  }
  await sendEmail({ otpCode, email });
  res.status(StatusCodes.OK).json({
    success: true,
    status: StatusCodes.OK,
    msg: "A verification code has been sent.",
  });
};

const verifyOTP = async (req, res) => {
  const { email } = req.currentUser;
  if (!email) throw createUnauthorizedError("Unauthorized user");
  if (req.currentUser.eligibility === "Allowed")
    throw createUnprocessableEntityError("Account already verified");
  const { otp } = req.body;
  if (!otp) throw createBadRequestError("Must provide verification code");
  if (otp.length < 6) throw createUnprocessableEntityError("Invalid token");
  const token = await Otp.findOne({ email });
  if (!token)
    throw createUnprocessableEntityError(
      "Verification failed. Please try again"
    );
  const { otpCode, expiresIn, tries } = token;
  const timeDifference = expiresIn - new Date().getTime();
  if (timeDifference < 0) {
    await Otp.findOneAndDelete({ email });
    throw createBadRequestError(
      "Token already expired. Please request a new one"
    );
  }
  const otpIsValid = otp === otpCode;
  if (!otpIsValid) {
    if (tries < 2) {
      await token.$inc("tries", 1);
      await token.save();
      throw createUnprocessableEntityError("Invalid token");
    }
    await Otp.findOneAndDelete({ email });
    throw createUnprocessableEntityError(
      "Invalid Token. Maximum tries exceed. Please request a new token."
    );
  }
  await Otp.findOneAndDelete({ email });
  await req.currentUser.$set("eligibility", "Allowed");
  await req.currentUser.save();
  return res.status(StatusCodes.OK).json({
    msg: "Verification successful",
    success: true,
    status: StatusCodes.OK,
  });
};

export { login, register, getUser, emailVerification, verifyOTP };
