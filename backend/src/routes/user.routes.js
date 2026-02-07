import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/user.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";  // ✅ verifyToken → verifyJWT

const router = Router();

// ====== Public Routes ======
router.post("/register", registerUser);
router.post("/login", loginUser);

// ====== Protected Routes (Login Required) ======
router.post("/logout", verifyJWT, logoutUser);              // ✅ Changed
router.get("/profile", verifyJWT, getUserProfile);          // ✅ Changed

// ====== Admin Only Routes ======
router.get("/all", verifyJWT, isAdmin, getAllUsers);        // ✅ Changed
router.get("/:id", verifyJWT, isAdmin, getUserById);        // ✅ Changed
router.put("/:id", verifyJWT, isAdmin, updateUser);         // ✅ Changed
router.delete("/:id", verifyJWT, isAdmin, deleteUser);      // ✅ Changed

export default router;