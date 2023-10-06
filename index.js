import "express-async-errors";
import express from "express";
import dotenv from "dotenv";
import {
  requestLogger,
  methodChecker,
  routeNotFound,
  errorHandler,
  validateToken,
} from "./middlewares/index.js";
import connectDB from "./connection/mongodb.js";
import { authRouter, electionRouter } from "./routes/index.js";
import cors from "cors";

// Configure the app to be able to read env variables
dotenv.config({ path: ".env" });

// Create a new express app
const app = express();

// Read env variables with the global process.env
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV;
const IPV4_ADDRESS = process.env.IPV4_ADDRESS;
const HOSTNAME = NODE_ENV === "development" ? IPV4_ADDRESS : null;

// Set up middlewares for the app
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.137.1:5173",
      process.env.CORS_ORIGIN,
    ],
    credentials: true,
  })
);
app.use(methodChecker); // Checks if the incoming request method is supported
app.use(express.urlencoded({ extended: true })); // Parse urlencoded data in request body
app.use(express.json({})); // Parse json data in request body
app.use(requestLogger); // Log any incoming request to the console

// Set up routing handlers
app.use("/auth", authRouter);
app.use("/election", validateToken, electionRouter);

// All route that are not handled from the top will be handled here
app.all("*", routeNotFound); // Returns a 404 response for such routes
app.use(errorHandler); // Handles all error in the app

// Starts the app
const startExpressApp = () =>
  app.listen(PORT, HOSTNAME, () => {
    console.log(`App started on http://${HOSTNAME}:${PORT}`);
  });

// Connect to the database then start the app
connectDB(startExpressApp);
