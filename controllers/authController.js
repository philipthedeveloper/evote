import { User, Otp } from "../models/index.js";
import { StatusCodes } from "http-status-codes";
import {
  createBadRequestError,
  createUnauthorizedError,
  createUnprocessableEntityError,
} from "../errors/index.js";
import _ from "lodash";
import {
  sendSuccessResponse,
  throwRequestError,
  checkEmptyRequestBody,
  throwBadRequestError,
  throwUnauthorizedError,
  throwUnprocessableEntityError,
  throwNotFoundError,
} from "../helpers/index.js";
import sendEmail from "../helpers/email-sender.js";
import * as ERROR_TYPES from "../helpers/errorTypes.js";

const login = async function (req, res) {
  const data = req.body;
  const isBodyEmpty = checkEmptyRequestBody(data);
  if (isBodyEmpty || !data.email || !data.password)
    // throwRequestError(ERROR_TYPES.BAD_REQUEST, "Email and Password required");
    throwBadRequestError("Email and Password required");

  const user = await User.findOne({ email: data.email });
  if (!user)
    // throwRequestError(ERROR_TYPES.UNAUTHORIZED, "Invalid Email or Password");
    throwUnauthorizedError("Invalid Email or Password");
  // Validate the password using the document method (validatePassword)
  /**
   * @function
   * @argument password @type String
   * @returns @type Boolean
   */
  const isValidPassword = await user.validatePassword(data.password);
  if (!isValidPassword)
    //  throwRequestError(ERROR_TYPES.UNAUTHORIZED, "Invalid Email or Password");
    throwUnauthorizedError("Invalid Email or Password");
  // Generate jwt for valid email and password
  const userWithoutPassword = _.omit(user.toObject(), "password");
  userWithoutPassword.userId = userWithoutPassword._id;
  const { userId, email, fullname } = userWithoutPassword;
  const accessToken = user.generateToken({ userId, email, fullname });
  return sendSuccessResponse(res, {
    message: "Login successful",
    user: userWithoutPassword,
    accessToken,
  });
};

const register = async function (req, res) {
  const data = req.body;
  const isBodyEmpty = checkEmptyRequestBody(data);
  if (isBodyEmpty)
    throwRequestError(ERROR_TYPES.BAD_REQUEST, "Provide all fields");
  const newUser = await User.create(data);
  const userWithoutPassword = _.omit(newUser.toObject(), "password");
  userWithoutPassword.userId = userWithoutPassword._id;
  const { userId, email, fullname } = userWithoutPassword;
  const accessToken = newUser.generateToken({ userId, email, fullname });
  return sendSuccessResponse(
    res,
    {
      message: "Account created successfully",
      user: userWithoutPassword,
      accessToken,
    },
    StatusCodes.CREATED
  );
};

const getUser = async (req, res) => {
  if (req.currentUser) {
    const userWithoutPassword = _.omit(req.currentUser.toObject(), "password");
    userWithoutPassword.userId = userWithoutPassword._id;
    return sendSuccessResponse(res, {
      message: "Successful",
      user: userWithoutPassword,
    });
  }
  // throwRequestError(ERROR_TYPES.UNAUTHORIZED, "User not authenticated");
  throwUnauthorizedError("User not authenticated");
};

const emailVerification = async (req, res) => {
  const { email } = req.currentUser;
  if (req.currentUser.eligibility === "Allowed")
    // throwRequestError(
    //   ERROR_TYPES.UNPROCESSABLE_ENTITY,
    //   "Account already verified"
    // );
    throwUnprocessableEntityError("Accout already verified");
  const user = await User.findOne({
    email: { $regex: email, $options: "i" },
  });
  // if (!user) throwRequestError(ERROR_TYPES.UNAUTHORIZED, "Unauthorized User");
  if (!user) throwUnauthorizedError("Unauthorized User");
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
  return sendSuccessResponse(res, {
    message: "A verification code has been sent to your email.",
  });
};

const verifyOTP = async (req, res) => {
  const { email } = req.currentUser;
  // if (!email) throwRequestError(ERROR_TYPES.UNAUTHORIZED, "Unauthorized user");
  if (!email) throwUnauthorizedError("Unauthorized user");
  if (req.currentUser.eligibility === "Allowed")
    // throwRequestError(
    //   ERROR_TYPES.UNPROCESSABLE_ENTITY,
    //   "Account already verified"
    // );
    throwUnprocessableEntityError("Account already verified");
  const { otp } = req.body;
  if (!otp)
    // throwRequestError(
    //   ERROR_TYPES.BAD_REQUEST,
    //   "Must provide verification code"
    // );
    throwBadRequestError("Must provide verification code");
  if (otp.length < 6)
    // throwRequestError(ERROR_TYPES.UNPROCESSABLE_ENTITY, "Invalid token");
    throwBadRequestError(
      "Incorrect token length. Please provide a valid 6-character OTP"
    );
  const token = await Otp.findOne({ email });
  if (!token)
    // throwRequestError(
    //   ERROR_TYPES.UNPROCESSABLE_ENTITY,
    //   "Verification failed. Please try again"
    // );
    throwUnauthorizedError("Invalid token or expired.");
  const { otpCode, expiresIn, tries } = token;
  const timeDifference = expiresIn - new Date().getTime();
  if (timeDifference < 0) {
    await Otp.findOneAndDelete({ email });
    // throwRequestError(
    //   ERROR_TYPES.BAD_REQUEST,
    //   "Token already expired. Please request a new one"
    // );
    throwUnauthorizedError("Token expired. Please request a new one");
  }
  const otpIsValid = otp === otpCode;
  if (!otpIsValid) {
    if (tries < 2) {
      await token.$inc("tries", 1);
      await token.save();
      // throwRequestError(ERROR_TYPES.UNPROCESSABLE_ENTITY, "Invalid token");
      throwUnauthorizedError("Invalid token");
    }
    await Otp.findOneAndDelete({ email });
    // throwRequestError(
    //   ERROR_TYPES.UNPROCESSABLE_ENTITY,
    //   "Invalid Token. Maximum tries exceed. Please request a new token."
    // );
    throwUnauthorizedError(
      "Invalid Token. Maximum tries exceeded. Please request a new token."
    );
  }
  await Otp.findOneAndDelete({ email });
  await req.currentUser.$set("eligibility", "Allowed");
  await req.currentUser.save();
  return sendSuccessResponse(res, { message: "Verification successful" });
};

const revokeUserEligibility = async (req, res) => {
  if (req.currentUser) {
    if (req.currentUser.accountType !== "admin") {
      throwUnauthorizedError("Unauthorized user.");
    }
    const isBodyEmpty = checkEmptyRequestBody(req.body);
    if (isBodyEmpty) throwBadRequestError("Please provide req body");
    const { userId, email } = req.body;
    if (!userId && !email)
      throwBadRequestError("PLease provide user id or email");

    let finder = {};
    if (userId) {
      finder._id = userId;
    }
    if (email) {
      finder.email = email;
    }
    let user = await User.findOneAndUpdate(
      finder,
      { eligibility: "Not-Allowed" },
      { new: true }
    );

    if (!user) throwNotFoundError("User not found.");
    const userWithoutPassword = _.omit(user.toObject(), "password");
    userWithoutPassword.userId = userWithoutPassword._id;
    return sendSuccessResponse(res, {
      message: "Successful",
      user: userWithoutPassword,
    });
  }
  // throwRequestError(ERROR_TYPES.UNAUTHORIZED, "User not authenticated");
  throwUnauthorizedError("User not authenticated");
};

const removeAccount = async (req, res) => {
  if (req.currentUser) {
    if (req.currentUser.accountType !== "admin") {
      throwUnauthorizedError("Unauthorized user.");
    }
    const isBodyEmpty = checkEmptyRequestBody(req.body);
    if (isBodyEmpty) throwBadRequestError("Please provide req body");
    const { userId, email } = req.body;
    if (!userId && !email)
      throwBadRequestError("PLease provide user id or email");

    let finder = {};
    if (userId) {
      finder._id = userId;
    }
    if (email) {
      finder.email = email;
    }

    let user = await User.findOneAndDelete(finder);

    if (!user) throwNotFoundError("User not found.");
    const userWithoutPassword = _.omit(user.toObject(), "password");
    userWithoutPassword.userId = userWithoutPassword._id;
    return sendSuccessResponse(res, {
      message: "Account removed successfully.",
      user: userWithoutPassword,
    });
  }
  // throwRequestError(ERROR_TYPES.UNAUTHORIZED, "User not authenticated");
  throwUnauthorizedError("User not authenticated");
};
export {
  login,
  register,
  getUser,
  emailVerification,
  verifyOTP,
  revokeUserEligibility,
  removeAccount,
};
