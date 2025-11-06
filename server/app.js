import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import morgan from "morgan";

import {createAllTables} from './utils/createTable.js'

import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./routes/userRoutes.js";
import farmRouter from  "./routes/farmRoutes.js"
import categoryRouter from "./routes/categoryRoutes.js";
import productRouter from "./routes/productRoutes.js"
import orderRouter from "./routes/orderRoutes.js"
import paymentRouter from "./routes/paymentRoutes.js"
import emailConfigRouter from "./routes/emailConfigRoutes.js"

const app = express();

// === Middlewares ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(fileUpload({ 
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}));

// === Routes ===
app.use("/api/v1/users", userRouter);
app.use("/api/v1/farms", farmRouter);
app.use("/api/v1/categories",categoryRouter);
app.use("/api/v1/products",productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/email", emailConfigRouter);
app.use("/api/v1/payments",paymentRouter);

// === Health check route ===
app.get("/", (req, res) => {
  res.send("🌾 AgroConnect Backend is Running...");
});

// === 404 handler - FIXED ===
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

createAllTables();

// === Global error middleware ===
app.use(errorMiddleware);

export default app;