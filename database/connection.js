import mongoose from "mongoose";
// import { config } from "dotenv";

// // Load env vars
// config({ path: "./config/config.env" });

export function db_connect() {
  let dbOptions = { appname: "ValuationaryBackend" };
  let dbUri = `${process.env.DB_PROTOCOL}://${process.env.DB_HOST}/${process.env.DB_NAME}`;

  if (process.env.NODE_ENV === "production") {
    // dbOptions = prodConfig;
    dbUri = `${process.env.DB_PROTOCOL}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
  }

  return mongoose.connect(dbUri, dbOptions);
}
