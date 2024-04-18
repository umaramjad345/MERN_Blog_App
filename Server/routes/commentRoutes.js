import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import {
  createComment,
  getPostComments,
  likeComment,
  editComment,
  deleteComment,
  getComments,
} from "../controllers/commentControllers.js";

const router = express.Router();

router.post("/create", verifyUser, createComment);
router.get("/getPostComments/:postId", getPostComments);
router.put("/likeComment/:commentId", verifyUser, likeComment);
router.put("/editComment/:commentId", verifyUser, editComment);
router.delete("/deleteComment/:commentId", verifyUser, deleteComment);
router.get("/getcomments", verifyUser, getComments);

export default router;
