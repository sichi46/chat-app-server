import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

interface DecodeToken extends JwtPayload {
  userId: string;
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodeToken;
    if (!decoded) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePic: true,
      },
    });
    next();
  } catch (error: any) {}
};

export default protectRoute;
