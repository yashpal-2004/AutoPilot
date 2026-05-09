import { Router } from "express";
import prisma from "../db.js";
import { ResumeService } from "../services/resume.service.js";
import fileUpload from "express-fileupload";

const router = Router();

// Middleware for file uploads
router.use(fileUpload());

// GET all resumes
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(401).json({ error: "User not found" });

    const resumes = await ResumeService.getResumes(user.id);
    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload resume
router.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const user = await prisma.user.findFirst();
    if (!user) return res.status(401).json({ error: "User not found" });

    const resume = await ResumeService.uploadAndParse(file.data, file.name, user.id);
    res.status(201).json(resume);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update resume (set default, etc.)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = await prisma.user.findFirst();
    if (!user) return res.status(401).json({ error: "User not found" });

    let result;
    if (data.isDefault) {
      result = await ResumeService.setDefaultResume(user.id, id);
    } else {
      result = await ResumeService.updateResume(user.id, id, data);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE resume
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findFirst();
    if (!user) return res.status(401).json({ error: "User not found" });

    await ResumeService.deleteResume(user.id, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
