import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dbConnection } from "./dbConnection/dbConnection.js";
import { errorMiddleware } from "./utils/error.js";
import authRoutes from "./routes/authRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
dotenv.config({ path: "./config/config.env" });
const Port = process.env.PORT || 3000;

dbConnection();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.listen(Port, (error) => {
  try {
    console.log(`Server is Running on http://localhost:${Port}`);
  } catch (error) {
    console.log("Server Couldn't be Started");
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/user", userRoutes);

app.use(errorMiddleware);
