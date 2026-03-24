import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("❌ Error:", err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

export class AppError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}
