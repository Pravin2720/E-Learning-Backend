import { Router } from "express";
import { paymentFollowUpAction, orderFollowUpAction } from "../../controllers/index.js";

const router = Router();

// public actions
router.get("/ofa", orderFollowUpAction);
router.get("/pca", paymentFollowUpAction);

export default router;
