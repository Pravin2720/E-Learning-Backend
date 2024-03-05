import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import {
  addChapter,
  editChapter,
  getChapter,
  listChapters,
  removeChapters,
  removeChapter,
} from "../../controllers/index.js";
import { validateChapter } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

// public actions
router.get("/", listChapters);
router.get("/:id", getChapter);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateChapter, addChapter);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateChapter, editChapter);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateChapter, removeChapters);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateChapter, removeChapter);

export default router;
