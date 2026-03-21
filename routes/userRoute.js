import express from "express";
import {
  getAllUsers,
  getUserByToken,
  getProfile,
  updateUser,
  updateEmploymentDetails,
  updatePropertyRequirement,
  deleteUser,
  forgetPassword,
  verifyResetToken,
  updatePassword
} from "../controllers/userController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get("/",  getAllUsers);
router.get("/user", verifyToken, getUserByToken);
router.get("/profile", verifyToken, getProfile);
router.put("/:id",  updateUser);
router.put("/employment/update", verifyToken, updateEmploymentDetails);
router.put("/property-requirement/update", verifyToken, updatePropertyRequirement);
router.delete("/:id",  deleteUser);



router.post("/forget-password", forgetPassword);
router.post("/reset-password", verifyResetToken);
router.post("/update-password", updatePassword);


export default router;
