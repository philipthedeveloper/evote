import fs from "fs";
import { ReasonPhrases, getReasonPhrase } from "http-status-codes";
import path from "path";
import { promisify } from "util";

const asyncWriteFile = promisify(fs.writeFile);

const currentModulePath = new URL(import.meta.url).pathname;
const currentModuleDir = path.dirname(decodeURIComponent(currentModulePath));

const logStream = path.join(
  currentModuleDir.replace("helpers", "logs").substring(1),
  "error-log-details.log"
);

export const saveToErrorDetails = async (error) => {
  let formattedError = {
    stack: error?.stack,
    name: error?.name,
    type:
      error?.type || getReasonPhrase(error?.statusCode || error?.status || 500),
    message: error?.message,
    status: error?.status,
    statusCode: error?.statusCode,
  };

  try {
    let done = asyncWriteFile(
      logStream,
      JSON.stringify(formattedError, null, 2),
      {
        encoding: "utf-8",
        flag: "a",
      }
    );
    return done;
  } catch (error) {
    console.log("Error writing to log: ", error);
  }
};
