import { Router } from "express";
import { 
  registerUser, 
  loginUser,
  googleLogin,
  logoutUser,
  getUserProfile,
  updateUser
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ====== Public Routes ======
router.post("/google", googleLogin);
router.post("/register", registerUser);
router.post("/login", loginUser);

// ====== Protected Routes (Login Required) ======
router.post("/logout", verifyJWT, logoutUser);
router.get("/profile", verifyJWT, getUserProfile);
router.put("/profile", verifyJWT, updateUser);

export default router;