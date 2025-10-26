import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden - Admin access required",
    });
  }

  next();
};