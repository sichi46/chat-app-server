import express from "express";
import cors from "cors";
import morgan from "morgan";
import authenticationRouter from "./authentication/routes";
import messageRouter from "./messages/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/authentication", authenticationRouter);
app.use("/messages", messageRouter);

app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
