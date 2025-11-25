import { JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authorize = async (req, res, next) => {
  try {
    let token = null;

    // 1. Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // No token → unauthorized
    if (!token) {
      if (req.accepts("html")) {
        return res.redirect("/login.html");
      }
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return req.accepts("html")
        ? res.redirect("/login.html")
        : res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return req.accepts("html")
      ? res.redirect("/login.html")
      : res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

export default authorize;
