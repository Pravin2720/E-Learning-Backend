import getLogger from "../logger/index.js";

const logger = getLogger("healthcheckerhttp");

export async function healthCheckResponder(req, res) {
  logger.info("Healthy");
  return res.status(200).json({ message: "Success" });
}
