import { Request, Response } from "express";
import httpStatus from "http-status";
import bycrypt from "bcrypt";
import { prisma } from "../config/db";
import generateToken from "../utils/generate-token";

class AuthenticationController {
  async signUp(req: Request, res: Response) {
    try {
      const { fullName, username, password, confirmPassword, gender } =
        req.body;
      if (!fullName || !username || !password || !confirmPassword || !gender) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: "Please fill in all fields" });
      }
      if (password !== confirmPassword) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: "Passwords do not match" });
      }
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (user) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: "Username already exists" });
      }

      const salt = await bycrypt.genSalt(10);
      const hashedPassword = await bycrypt.hash(password, salt);

      const boyProfilePic =
        "https://avatar.iran.liara.run/public/boy?username=${username}";
      const girlProfilePic =
        "https://avatar.iran.liara.run/public/girl?username=${username}";

      const newUser = await prisma.user.create({
        data: {
          fullName,
          username,
          password: hashedPassword,
          gender,
          profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
        },
      });
      if (newUser) {
        // generate new token in a sec
        generateToken(newUser.id, res);

        return res.status(httpStatus.CREATED).json({
          id: newUser.id,
          fullName: newUser.fullName,
          username: newUser.username,
          boyProfilePic: newUser.profilePic,
        });
      } else {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: "Invalid user Data" });
      }
    } catch (error: any) {
      console.log("Error in signup controller", error.message);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: "Invalid user credentials" });
      }

      const isPasswordCorrect = await bycrypt.compare(password, user?.password);
      if (!isPasswordCorrect) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: "Invalid credentials" });
      }

      generateToken(user.id, res);
      return res.status(httpStatus.OK).json({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        profilePic: user.profilePic,
      });
    } catch (error: any) {
      console.log("Error in the signup controller", error.message);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.cookie("jwt", "", { maxAge: 0 });
      return res
        .status(httpStatus.OK)
        .json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.log("Error in logout controller", error.message);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  }
  async getMe(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (!user) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: "User not found" });
      }
      return res.status(httpStatus.OK).json({
        id: user.id,
        fullname: user.fullName,
        username: user.username,
        profilePic: user.profilePic,
      });
    } catch (error: any) {
      console.log("Error in the getMe controller", error.message);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  }
}

export const authenticationController = new AuthenticationController();
