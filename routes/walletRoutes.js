import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getBalance } from "../controllers/walletController.js";

const router = express.Router();

// The Guard (authenticateToken) stands BEFORE the Controller (getBalance)
router.get("/balance",authenticateToken, getBalance);

export default router;
