import Comment from "../models/commentModel.js";
import { ErrorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    if (!content || !postId || !userId) {
      return next(new ErrorHandler("All Fields are Required", 400));
    }
    if (userId !== req.user.id) {
      return next(
        new ErrorHandler("You're not Allowed to Create Comment", 400)
      );
    }
    const newComment = new Comment({ content, postId, userId });
    await newComment.save();
    res.status(200).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  console.log(req.params.postId);
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });
    console.log(comments);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(new ErrorHandler("No Comment Found", 400));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(new ErrorHandler("Comment Not Found", 400));
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        new ErrorHandler("You're not Allowed to edit thie Comment", 403)
      );
    }
    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { content: req.body.content },
      { new: true }
    );
    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(new ErrorHandler("Comment Not Found", 404));
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        new ErrorHandler("Youn'r Allowed to Deleted this Comment", 403)
      );
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json({
      success: true,
      message: "Comment has been Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorHandler("You'r not Allowed to Get All Comments"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;
    const comments = await Comment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate({ path: "postId", select: "title" })
      .populate({ path: "userId", select: "username" });
    const totalComments = await Comment.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ comments, totalComments, lastMonthComments });
  } catch (error) {
    next(error);
  }
};
