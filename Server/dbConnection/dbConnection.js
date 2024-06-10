import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((res) => {
      console.log("Database Connection Successful");
    })
    .catch((error) => {
      console.log("Database Connection Failed");
    });

  mongoose.connection.on("disconnected", () => {
    console.log("Database Disconnected");
  });
  mongoose.connection.on("error", (error) => {
    console.log(error);
    console.log("Database Connection Error");
  });
  mongoose.connection.on("disconnected", () => {
    console.log("Database Connected Again");
  });

  process.on("SIGINT", () => {
    mongoose.connection.close();
    console.log("Database Connection Closed due to Application Termination");
    process.exit(0);
  });
};
