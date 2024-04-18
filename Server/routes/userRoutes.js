import express from "express";
import {
  test,
  updateUser,
  deleteUser,
  getUser,
  getUsers,
} from "../controllers/userControllers.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyUser, updateUser);
router.delete("/delete/:userId", verifyUser, deleteUser);
router.get("/getusers", verifyUser, getUsers);
router.get("/:userId", getUser);

export default router;
