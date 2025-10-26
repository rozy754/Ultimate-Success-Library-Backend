import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import env from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import paymentRoutes from "./modules/payment/route";
import subscriptionRoutes from "./modules/subscription/route";
import feedbackRoutes from "./modules/feedback/feedback.routes";
import adminRoutes from "./modules/admin/admin.routes";
import whatsappRoutes from "./modules/whatsapp/route";

export const app = express();

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// ✅ Mount admin routes
app.use("/api/admin", adminRoutes);

app.get("/", (_req, res) => {
  res.send("Welcome to the API 🚀");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// Register your central error handler AFTER all routes.
app.use(errorHandler);

// Basic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  })
})

export default app;