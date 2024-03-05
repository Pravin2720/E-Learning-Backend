import { config } from "dotenv";
import cors from "cors";

// Load env vars
config({ path: "./config/config.env" });

const whitelist = JSON.parse(process.env.ALLOWED_ORIGINS) || [];
console.log("ALLOWED_ORIGINS", whitelist);
const cors_options = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`${origin} Not allowed by CORS`));
    }
  },
  credentials: true,
  exposedHeaders: ["authorization", "reauthorization"],
};

console.log("cors_options", cors_options);
const cors_instance = cors(cors_options);

export default cors_instance;
