import User from "../models/userModel.js";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/error.js";

export const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(new ErrorHandler("All Fields are Required", 400));
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("User is Already Registered", 400));
    }
    const salt = await genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET_KEY
    );
    const { password: userPassword, ...rest } = user._doc;
    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .json({ message: "User Registered Successfully", rest });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("All Fields are Required", 400));
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User Not Found", 400));
    }
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return next(new ErrorHandler("Incorrect Password"));
    }
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET_KEY
    );

    const { password: hashedPassword, ...rest } = user._doc;

    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .json({ message: "User Logged In Successfully", rest });
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req, res) => {
  try {
    res
      .clearCookie("accessToken")
      .status(200)
      .json({ message: "User Logged Out Successfully" });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { name, email, googlePhotoUrl } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET_KEY
      );

      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("accessToken", token, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .json({
          message: "Login Successful",
          rest,
          token,
        });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const salt = await genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET_KEY
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("accessToken", token, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .json({ message: "User has been Logged In Sucessfully", rest, token });
    }
  } catch (error) {
    // return res.status(400).json({ error });
    next(error);
  }
};
