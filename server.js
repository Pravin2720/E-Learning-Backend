// Load env vars
import { config } from "dotenv";
config({ path: "./config/config.env" });

// configure logger
import Log4js from "log4js";
import getLogger, { log_config, middleware_options } from "./logger/index.js";
Log4js.configure(log_config);

// init app
import express from "express";
const app = express();

// assign middlewares
import * as ruid from "express-ruid";
app.use(ruid.default());

import helmet from "helmet";
app.use(helmet());

import cors_instance from "./cors.js";
app.use(cors_instance);

// app.use(express.raw());
// app.use(express.text());
app.use(express.json({ limit: "50mb", extended: true, parameterLimit: 50000 })); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies

import cookieParser from "cookie-parser";
app.use(cookieParser(process.env.JWT_SECRET));

// init request logs
app.use(Log4js.connectLogger(getLogger("http"), middleware_options));

// enable compression
import compression from "compression";
app.use(compression());

// assign routes to app
import useRoutes from "./routes/index.js";
useRoutes(app);

import { errorHandler } from "./middlewares/index.js";
app.use(errorHandler);

// setup mongodb
import { db_connect } from "./database/connection.js";
import { ordersProcessingTask, paymentsProcessingTask } from "./tasks/index.js";

const PORT = process.env.PORT || 4000;
db_connect().then(
  () => {
    // start server
    app.listen(PORT, process.env.HOST, () => {
      console.log("server running", PORT);
    });

    if (process.env.NODE_ENV === "production") {
      ordersProcessingTask.start();
      paymentsProcessingTask.start();
    }
  },
  (err) => {
    console.log(err);
  },
);
