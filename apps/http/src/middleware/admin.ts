import "dotenv/config"
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  const token = header?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized !" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN!) as {
      role: string;
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Unauthorized", error });
    return;
  }
};
