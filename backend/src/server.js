// ============================================================
// server.js — IngredientSafe entry point
// ============================================================

import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

import authRoutes   from "./routes/auth.js";
import userRoutes   from "./routes/user.js";
import petRoutes    from "./routes/pets.js";
import scanRoutes   from "./routes/scans.js";
import hazardRoutes from "./routes/hazards.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" }));

// ── Public (no auth) ──────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", service: "IngredientSafe", ts: new Date().toISOString() });
});
app.use("/api/hazards", hazardRoutes);

// ── Clerk auth on all /api routes ─────────
app.use("/api", clerkMiddleware());
app.use("/api/auth",  authRoutes);
app.use("/api/user",  userRoutes);
app.use("/api/pets",  petRoutes);
app.use("/api/scan",  scanRoutes);

// ── Global error handler ──────────────────
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message ?? "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IngredientSafe running on port ${PORT}`);
});