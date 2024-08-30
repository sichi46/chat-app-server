import { Request, Response } from "express";

class AuthenticationController {
  async logIn(req: Request, res: Response) {
    try {
      res.send("Logged In Successfully ");
    } catch (error) {}
  }
}
