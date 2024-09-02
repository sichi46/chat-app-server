import { Router } from "express";
import { messageController } from "./controller";
import protectRoute from "../middleware/protect-route";

const messageRouter = Router();

messageRouter.get(
  "/conversation",
  protectRoute,
  messageController.getUsersForSideBar
);
messageRouter.get("/:id", protectRoute, messageController.getMessages);
messageRouter.post("/send/:id", protectRoute, messageController.sendMessage);

export default messageRouter;
