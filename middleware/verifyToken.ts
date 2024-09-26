import { User } from "../model/userModel";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
dotenv.config();

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  const secretkey = process.env.JWT_SECRET;
  if (!secretkey) {
    throw new Error("Secret key not available");
  }
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Unauthorized - no token provided " });
  }
  try {
    const decoded = jwt.verify(token, secretkey);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
      (req as any).userId = (decoded as any).userId;

    next();
  } catch (error) {
    console.log("Error in verifying token-->>", error);
    return res.status(500).json({ success: false, message: "server erro" });
  }
};
