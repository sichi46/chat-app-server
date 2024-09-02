import jwt, { JwtPayload } from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import httpStatus from "http-status";

interface DecodedToken extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
      };
    }
  }
}

const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (!decoded) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, fullName: true, profilePic: true },
    });

    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "User not found" });
    }

    req.user = user;

    next();
  } catch (error: any) {
    console.log("Error in protectRoute middleware", error.message);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

export default protectRoute;
