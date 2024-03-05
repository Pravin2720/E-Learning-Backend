import { Router } from "express";
import { webhookReceive, paymentSuccess } from "../../controllers/index.js";
import { validateWebhook, validateCallback } from "../../validators/index.js";

const router = Router();

// public actions
router.post("/webhook", validateWebhook, webhookReceive);
router.post("/callback", validateCallback, paymentSuccess);

export default router;
