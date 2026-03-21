import express from "express";
import {
  addQA,
  getAllQA,
  getQAById,
  updateQA,
  deleteQA,
  askChatbot,
  getCategories,
  getPopularQuestionsRoute,
  captureChatbotLead,
} from "../controllers/chatbotQAController.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import { verifyEmployeeToken, checkPermission } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ====================== PUBLIC ROUTES ======================
// Chatbot endpoint - anyone can ask questions
router.post("/ask", askChatbot);

// Chatbot endpoint - capture lead after number verification
router.post("/capture-lead", captureChatbotLead);

// Get categories and popular questions
router.get("/categories", getCategories);
router.get("/popular", getPopularQuestionsRoute);

// ====================== ADMIN ROUTES ======================
router.post("/admin/add", verifyAdminToken, addQA);
router.get("/admin/all", verifyAdminToken, getAllQA);
router.get("/admin/:id", verifyAdminToken, getQAById);
router.put("/admin/update/:id", verifyAdminToken, updateQA);
router.delete("/admin/delete/:id", verifyAdminToken, deleteQA);

// ====================== EMPLOYEE ROUTES (Role-based) ======================
router.post("/add", verifyEmployeeToken, checkPermission('chatbot-management', 'create'), addQA);
router.get("/all", verifyEmployeeToken, checkPermission('chatbot-management', 'read'), getAllQA);
router.get("/:id", verifyEmployeeToken, checkPermission('chatbot-management', 'read'), getQAById);
router.put("/update/:id", verifyEmployeeToken, checkPermission('chatbot-management', 'update'), updateQA);
router.delete("/delete/:id", verifyEmployeeToken, checkPermission('chatbot-management', 'delete'), deleteQA);

export default router;
