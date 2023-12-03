// import fs from "fs";
// import path from "path";
// import morgan from "morgan";
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// const currentModulePath = new URL(import.meta.url).pathname;
// const currentModuleDir = path.dirname(decodeURIComponent(currentModulePath));
console.log(
  "Directory: ",
  path.join(__dirname.replace("middlewares", "logs"), "req.log")
);

const reqLogStream = fs.createWriteStream(
  path.join(__dirname.replace("middlewares", "logs"), "req.log"),
  // path.join(
  //   currentModuleDir.replace("middlewares", "logs").substring(1),
  //   "req.log"
  // ),
  { flags: "a" }
);

const errorLogStream = fs.createWriteStream(
  path.join(__dirname.replace("middlewares", "logs"), "req.log"),
  // path.join(
  //   currentModuleDir.replace("middlewares", "logs").substring(1),
  //   "error.log"
  // ),
  { flags: "a" }
);

// export const morganLogger = morgan("combined", { stream: reqLogStream });
const morganLogger = morgan("combined", { stream: reqLogStream });

// export const errorLogger = morgan("combined", {
//   stream: errorLogStream,
//   skip: (req, res) => res.statusCode < 400,
// });
const errorLogger = morgan("combined", {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400,
});

// export const requestLogger = (req, res, next) => {
//   console.log(`${req.method} => ${req.url} => ${req.body}`);
//   next();
// };
const requestLogger = (req, res, next) => {
  console.log(`${req.method} => ${req.url} => ${req.body}`);
  next();
};

// export default requestLogger;
module.exports = { morganLogger, errorLogger, requestLogger };
