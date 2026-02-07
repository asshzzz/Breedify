import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Verify JWT Token (Renamed: verifyToken → verifyJWT)
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

// Check Admin Role
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "User not authenticated" 
    });
  }

  const adminRoles = ["administrator", "admin", "super_admin"];
  
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Admin privileges required." 
    });
  }

  next();
};

// Check Field Officer Role
export const isFieldOfficer = (req, res, next) => {
  const allowedRoles = ["field_officer", "administrator", "admin"];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Field officer privileges required." 
    });
  }

  next();
};