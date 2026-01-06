import express, { Router } from "express";
import { registerUser, loginUser } from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

export default router;
