import crypto from "crypto";

export function randomText() {
  return crypto.randomBytes(64).toString("hex");
}
