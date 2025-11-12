import express from "express";
import { getDropdownData } from "../controllers/dataController.js";

const router = express.Router();

router.get("/dropdowns", getDropdownData);

export default router;
