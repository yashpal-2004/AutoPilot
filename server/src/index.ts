import "./config.js";
import express from "express";
import cors from "cors";
import { AutoPilotService } from "./services/autopilot.service.js";
import preferencesRoutes from "./routes/preferences.routes.js";
import resumeRoutes from "./routes/resume.routes.js";

const app = express();
console.log("Express app created.");
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AutoPilot Server is running" });
});

// Routes
app.use("/api/preferences", preferencesRoutes);
app.use("/api/resumes", resumeRoutes);

// Initialize Autopilot Scheduler
AutoPilotService.startScheduler();

app.listen(PORT, () => {
  console.log(`🚀 AutoPilot Server running on http://localhost:${PORT}`);
});
