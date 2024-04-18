import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import {
  create,
  getPosts,
  deletePost,
  updatePost,
} from "../controllers/postControllers.js";

const router = express.Router();

router.post("/create", verifyUser, create);
router.get("/getposts", getPosts);
router.delete("/deletepost/:postId/:userId", verifyUser, deletePost);
router.put("/updatepost/:postId/:userId", verifyUser, updatePost);

export default router;
