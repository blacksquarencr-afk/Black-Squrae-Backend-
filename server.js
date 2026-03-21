import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";



// Import routes
import router from "./routes/authRoute.js";
import addRouter from "./routes/addRoute.js";
import getRoute from "./routes/getRoutes.js";
import listPropertyRoute from "./routes/list-property-route.js";
import recentRoute from "./routes/recentRoute.js";
import saveRoute from "./routes/saveRoute.js";
import editRoutes from "./routes/editProfileRoute.js";
import serviceRoutes from "./routes/serviceRoute.js";
import boughtRoute from "./routes/boughtRoute.js";
import chatRouter from "./routes/chatRoute.js";
import sellRoute from "./routes/sellRoute.js";
import rentRoute from "./routes/rentRoute.js";
import revenueRoute from "./routes/revenueRoute.js";
import userRoute from "./routes/userRoute.js";
import changePasswordRoute from "./routes/changePasswordRoute.js";
import adminAuthRoute from "./routes/adminAuthRoute.js";
import paymentRoute from "./routes/paymentRoute.js"
import inquiryRoute from "./routes/inquiryRoute.js";
import reminderRoute from "./routes/reminderRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import adminNotificationRoute from "./routes/adminNotificationRoute.js";
import "./cron/reminderCron.js"; // ✅ FCM notifications enabled
import fcmRoute from "./routes/fcmRoute.js";
import updateNotificationRoute from "./routes/updateNotificationRoute.js";
import contactRoute from "./routes/contactRoute.js";
import roleRoute from "./routes/roleRoute.js";
import employeeRoute from "./routes/employeeRoute.js";
import adminRoleRoute from "./routes/adminRoleRoute.js";
import adminEmployeeRoute from "./routes/adminEmployeeRoute.js";
import clientAssignmentRoute from "./routes/clientAssignmentRoute.js";
import employeeDashboardRoute from "./routes/employeeDashboardRoute.js";
import employeeReportRoute from "./routes/employeeReportRoute.js";
import adminLeadAssignmentRoute from "./routes/adminLeadAssignmentRoute.js";
import employeeLeadRoute from "./routes/employeeLeadRoute.js";
import adminUserLeadAssignmentRoute from "./routes/adminUserLeadAssignmentRoute.js";
import employeeUserLeadRoute from "./routes/employeeUserLeadRoute.js";
// import testReminderRoute from "./routes/testReminderRoute.js"; // Disabled test reminders
import followUpRoute from "./routes/followUpRoute.js";
import alertRoute from "./routes/alertRoute.js";
import uspCategoryRoute from "./routes/uspCategoryRoute.js";
import uspEmployeeRoute from "./routes/uspEmployeeRoute.js";
import adminReminderRoute from "./routes/adminReminderRoute.js";
import enquiryRoute from "./routes/enquiryRoute.js";
import blogRoute from "./routes/blogRoute.js";
import dashboardBannerRoute from "./routes/dashboardBannerRoute.js";
import youtubeVideoRoute from "./routes/youtubeVideoRoute.js";
import chatbotQARoute from "./routes/chatbotQARoute.js";
import propertyInsightsRoute from "./routes/propertyInsightsRoutes.js";
import feedbackRoute from "./routes/feedbackRoute.js";
import builderRoute from "./routes/builderRoute.js";
import careerApplicationRoute from "./routes/careerApplicationRoute.js";
import employeeCareerApplicationRoute from "./routes/employeeCareerApplicationRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import propertyLeadRoute from "./routes/propertyLeadRoutes.js";
import servicesRoutes from "./routes/serviceRoutes.js";
import bookPropertyRoutes from "./routes/bookPropertyRoutes.js";
import paintingRoutes from "./routes/paintingRoutes.js";
import dataIntelligenceRoutes from "./routes/dataIntelligenceRoutes.js";
import rentReceiptRoutes from "./routes/rentReceiptRoutes.js";
import joinBlackSquareRoutes from "./routes/joinBlackSquareRoutes.js";
import propertyManagementRoutes from "./routes/propertyManagementRoutes.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoute from "./routes/productRoute.js";
import imageUploadRoute from "./routes/imageUploadRoute.js";
import siteVisitRoute from "./routes/siteVisitRoute.js";


// Load environment variables
dotenv.config();

const app = express();

//  Socket.io Setup (MUST be before middleware)
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

//  Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for now to resolve CORS issues
    // In production, we should whitelist specific domains
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Auth-Token', 'Cache-Control', 'Pragma', 'Expires']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(
  session({
    secret: "your-secret-key", // move to .env later
    resave: false,
    saveUninitialized: false,
  })
);

//  MongoDB Connection  
const connectDB = async () => {
  try {
    if (!process.env.MONGO_CONN) {
      throw new Error(" MONGO_CONN not found in .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_CONN);

    console.log(" MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Stop server if DB fails
  }
};

connectDB();

// Attach socket.io instance to req
app.use((req, res, next) => {
  req.io = io;
  next();
});



//  API Routes
app.use("/auth", router);
app.use("/property", addRouter);
app.use("/api/property", addRouter);
app.use("/api/properties", addRouter); // Mount here too for endpoints like /api/properties/add
app.use("/api/properties", sellRoute);
app.use("/api/properties", recentRoute);
app.use("/api/properties", saveRoute);
app.use("/api/services", serviceRoutes);
app.use("/api/properties", boughtRoute);
app.use("/api/chat", chatRouter);
app.use("/api/users", editRoutes);
app.use("/api/properties", rentRoute);
app.use("/api/properties", revenueRoute);
app.use("/api/properties", getRoute);
app.use("/api/users", userRoute);
app.use("/api", changePasswordRoute);
app.use("/admin", adminAuthRoute);
app.use("/api", listPropertyRoute);
console.log('✅ List Property routes mounted at /api');
console.log('✅ Available endpoints:');
console.log('   GET  /api/list-property/localities (public)');
console.log('   GET  /api/list-property (auth required)');
console.log('   POST /api/list-property (auth required)');
app.use("/api/payment", paymentRoute);
//  Serve Uploaded Files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use("/api/inquiry", inquiryRoute);

app.use("/api/reminder", reminderRoute);
app.use("/api/notification", notificationRoute);
app.use("/admin/notifications", adminNotificationRoute);
app.use("/api", fcmRoute);
app.use("/application", updateNotificationRoute)
app.use("/api/contact", contactRoute);
app.use("/api/roles", roleRoute);
app.use("/api/employees", employeeRoute);
app.use("/admin/roles", adminRoleRoute);
app.use("/admin/employees", adminEmployeeRoute);
app.use("/api/clients", clientAssignmentRoute);
app.use("/admin/leads", adminLeadAssignmentRoute);
app.use("/employee/leads", employeeLeadRoute);
app.use("/admin/user-leads", adminUserLeadAssignmentRoute);
app.use("/employee/user-leads", employeeUserLeadRoute);
app.use("/employee/reminders", reminderRoute);
app.use("/employee/follow-ups", followUpRoute);
app.use("/employee/dashboard", employeeDashboardRoute);
app.use("/api/employee-reports", employeeReportRoute);
app.use("/admin/employee-reports", employeeReportRoute);
// app.use("/test", testReminderRoute); // Disabled test reminders
app.use("/api/follow-ups", followUpRoute);
app.use("/api/followup", followUpRoute); // Added singular route for compatibility
app.use("/api/alerts", alertRoute);
app.use("/api/usp-categories", uspCategoryRoute);
app.use("/api/usp-employees", uspEmployeeRoute);
app.use("/admin/reminders", adminReminderRoute);
app.use("/api/enquiries", enquiryRoute);
app.use("/api/enquiry", enquiryRoute); // Alias for backward compatibility
app.use("/api/blogs", blogRoute);
app.use("/api/dashboard-banner", dashboardBannerRoute);
app.use("/api/youtube-videos", youtubeVideoRoute);
app.use("/api/chatbot", chatbotQARoute);
app.use("/api/property-insights", propertyInsightsRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/builders", builderRoute);
app.use("/api/careers", careerApplicationRoute);
app.use("/employee/career-applications", employeeCareerApplicationRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/property-lead", propertyLeadRoute);
app.use("/api/services", servicesRoutes);
app.use("/api/book-property", bookPropertyRoutes);
app.use('/api/painting', paintingRoutes);
app.use('/api/data-intelligence', dataIntelligenceRoutes);
app.use("/api/rent-receipts", rentReceiptRoutes);
app.use("/api/join-blacksquare", joinBlackSquareRoutes);
app.use("/api/property-management", propertyManagementRoutes);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/upload", imageUploadRoute);
app.use("/api/site-visits", siteVisitRoute);

// Test PUT endpoint to verify method is working
app.put("/api/test-put", (req, res) => {
  res.json({ 
    success: true, 
    message: "PUT method is working at server level",
    body: req.body 
  });
});

//  Socket.io Events
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.chatId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

//  Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

export { io };
