import { asyncHandler } from "../middlewares/index.js";
import models from "../models/index.js";
import { sendEmailUpsurge } from "../services/aws_ses.service.js";
import { createNewsLetterText } from "../services/email.templates.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export const listSubscribers = asyncHandler(async (req, res, next) => {
  const subscribers = await models.newsletter_list.find({ unsubscribed: false }).select("-_id -__v").lean();
  res.status(200).json({ items: subscribers });
  next();
});

export const subscribeNewsletter = asyncHandler(async (req, res, next) => {
  const status = await models.newsletter_list.updateOne(
    { email: req.body.email },
    { $set: { unsubscribed: false, updated_at: Date.now() } },
  );

  let entry = null;
  if (status.matchedCount === 0) entry = await models.newsletter_list.create({ email: req.body.email });

  if (!entry) entry = await models.newsletter_list.findOne({ email: req.body.email }).select("-_id -__v").lean();
  
  if (req.headers.origin === process.env.UPSURGE_URL) {
    const email = req.body.email;
    await sendEmailUpsurge([email], "Welcome to Upsurge.club", createNewsLetterText());
  }
  // TODO : Send proper subject, add proper email body in createNewsLetterText, confirm on Source string 

  res.status(200).json({ ...entry });

  next();
});

export const unsubscribeNewsletter = asyncHandler(async (req, res, next) => {
  const status = await models.newsletter_list.updateOne(
    { email: req.body.email },
    { $set: { unsubscribed: true, updated_at: Date.now() } },
  );

  if (status.matchedCount === 0) {
    res.status(200).json({ message: "User has not subscribed ever" });
  } else {
    const user = await models.newsletter_list.findOne({ email: req.body.email }).select("-_id -__v").lean();
    res.status(200).json({ ...user });
  }
  next();
});
