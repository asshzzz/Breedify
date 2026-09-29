import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Verify JWT Token
export const verifyJWT = async (req, res, next) => {
  try {
    const token = 
      req.cookies?.accessToken || 
      req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const user = await User.findById(decodedToken.id).select("-password -refreshToken");
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid access token" 
      });
    }

    req.user = user;
    next();
    
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid token" 
    });
  }
};