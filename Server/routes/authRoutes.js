import express from "express";
import {
  register,
  logIn,
  logOut,
  google,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", logIn);
router.post("/google", google);
router.post("/logout", logOut);

export default router;
