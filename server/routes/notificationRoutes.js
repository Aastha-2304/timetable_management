import express from "express";
import {
  createNotification,
  getNotifications,
  deleteNotification,
} from "../controllers/notificationController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createNotification); // create new
router.get("/", getNotifications); // get all
router.delete("/:id", deleteNotification); // delete one

export default router;
