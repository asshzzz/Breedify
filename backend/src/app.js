import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ====== Middlewares (PEHLE ye aane chahiye) ======
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // ← ADDED
    allowedHeaders: ['Content-Type', 'Authorization'], // ← ADDED
  })
);

// 🔥 YE BOHOT IMPORTANT HAI - Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ====== Routes Import (Middleware ke BAAD) ======
import reportRouter from "./routes/report.routes.js";
import userRouter from "./routes/user.routes.js";
import imageRouter from "./routes/image.routes.js";
import recordRouter from "./routes/record.routes.js";
import predictRoute from './routes/predict.routes.js';

// ====== Routes Declaration ======
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/images", imageRouter);
app.use("/api/v1/records", recordRouter);

// ====== Root Endpoint ======
app.get("/", (req, res) => {
  res.send("🐄 Cattle Classification API is running successfully!");
});

// ======== predict api =========
app.use('/api/breed', predictRoute); 

// ======== setting routes ========

import settingsRoutes from './routes/setting.routes.js';

app.use('/api/v1/settings', settingsRoutes);

// ====== Export ======
export default app ;