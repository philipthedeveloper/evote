import { StatusCodes } from "http-status-codes";
export const sendSuccessResponse = (res, data = {}, status = StatusCodes.OK) =>
  res.status(status).json({ success: true, status, ...data });

// export const sendErrorResponse = (
//   res,
//   data = {},
//   status = StatusCodes.INTERNAL_SERVER_ERROR
// ) => res.status(status).json({ success: false, status, ...data });
