import jwt from "jsonwebtoken";
import BlacklistLog from "../models/blacklistLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) {
    
    token = req.headers.authorization.split(" ")[1];
    req.token = token;

    const isBlacklistLoged = await BlacklistLog.findOne({ token });
    if (isBlacklistLoged) {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = req.user || {};
    req.user.id = decoded.userId;

    next();
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
});
