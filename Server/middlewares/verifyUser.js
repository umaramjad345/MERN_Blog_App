import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/error.js";

export const verifyUser = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return next(new ErrorHandler("You're not Authorized", 401));
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
    if (error) {
      return next(new ErrorHandler("Invalid Token", 401));
    }
    req.user = user;
    next();
  });
};
