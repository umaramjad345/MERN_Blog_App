import bcrypt, { genSalt } from "bcrypt";
import { ErrorHandler } from "../utils/error.js";
import User from "../models/userModel.js";

export const test = (req, res) => {
  res.json({ message: "Server is Working" });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(new ErrorHandler("You're not Allowed to Update this User"));
  }
  if (req.body.password) {
    if (req.body.password.length < 5) {
      return next(new ErrorHandler("Password Must be Atleast 5 Characters"));
    }
    const salt = genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  if (req.body.username) {
    if (req.body.username.length < 3 || req.body.username.length > 20) {
      return next(
        new ErrorHandler("Username must be Between 3 to 20 Characters", 400)
      );
    }
    if (req.body.username.includes(" ")) {
      return next(new ErrorHandler("Username can't Contain Spaces", 400));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(new ErrorHandler("Username Must be Lowercase", 400));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        new ErrorHandler("Username can only Contain Letters and Numbers", 400)
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({ message: "User Updated Successfully", rest });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.id) {
    return next(
      new ErrorHandler("You're not Allowed to delete this User", 400)
    );
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res
      .status(200)
      .json({ success: true, message: "User has been Deleted Successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(new ErrorHandler("User Not Found", 400));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      new ErrorHandler("You're not Allowed to See All the Users", 400)
    );
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;

    let users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    users = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ users, totalUsers, lastMonthUsers });
  } catch (error) {
    next(error);
  }
};
