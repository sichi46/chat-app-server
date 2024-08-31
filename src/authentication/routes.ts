import { Router } from "express";
import { authenticationController } from "./controller";

const authenticationRouter = Router();

authenticationRouter.get("me", protectRoute, authenticationController.getMe);
authenticationRouter.post("/signup", authenticationController.signUp);
authenticationRouter.post("/login", authenticationController.login);
authenticationRouter.post("/logout", authenticationController.logout);

export default authenticationRouter;
