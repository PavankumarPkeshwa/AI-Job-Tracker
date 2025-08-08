import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeResume, analyzeJobMatch, generateCoverLetter, generateInterviewQuestions, analyzeSkillGap } from "./gemini";
import { insertResumeSchema, insertJobDescriptionSchema, insertApplicationSchema, type InsertApplication } from "@shared/schema";
import multer from "multer";
import * as fs from "fs";
import { z } from "zod";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Resume endpoints
  app.post("/api/resumes/upload", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const userId = req.body.userId || "temp-user"; // In a real app, get from session

      // Analyze resume with AI
      const analysis = await analyzeResume(fileContent);
      
      const resumeData = {
        userId,
        filename: req.file.originalname,
        content: fileContent,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        atsScore: analysis.atsScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions
      };

      const resume = await storage.createResume(resumeData);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(resume);
    } catch (error) {
      console.error("Resume upload error:", error);
      res.status(500).json({ message: "Failed to process resume" });
    }
  });

  app.get("/api/resumes/:userId", async (req, res) => {
    try {
      const resumes = await storage.getResumesByUserId(req.params.userId);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  // Job description endpoints
  app.post("/api/job-descriptions", async (req, res) => {
    try {
      const jobData = insertJobDescriptionSchema.parse(req.body);
      const jobDescription = await storage.createJobDescription(jobData);
      res.json(jobDescription);
    } catch (error) {
      res.status(400).json({ message: "Invalid job description data" });
    }
  });

  app.get("/api/job-descriptions/:userId", async (req, res) => {
    try {
      const jobs = await storage.getJobDescriptionsByUserId(req.params.userId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job descriptions" });
    }
  });

  // Job matching endpoint
  app.post("/api/job-match", async (req, res) => {
    try {
      const { resumeId, jobDescriptionId } = req.body;
      
      const resume = await storage.getResumeById(resumeId);
      const jobDescription = await storage.getJobDescriptionById(jobDescriptionId);
      
      if (!resume || !jobDescription) {
        return res.status(404).json({ message: "Resume or job description not found" });
      }

      const matchAnalysis = await analyzeJobMatch(resume.content, jobDescription.content, jobDescription.title);
      res.json(matchAnalysis);
    } catch (error) {
      console.error("Job match error:", error);
      res.status(500).json({ message: "Failed to analyze job match" });
    }
  });

  // Application endpoints
  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.get("/api/applications/:userId", async (req, res) => {
    try {
      const applications = await storage.getApplicationsByUserId(req.params.userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch("/api/applications/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const application = await storage.updateApplicationStatus(req.params.id, status);
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Cover letter generation
  app.post("/api/cover-letters/generate", async (req, res) => {
    try {
      const { resumeId, jobDescriptionId, userId } = req.body;
      
      const resume = await storage.getResumeById(resumeId);
      const jobDescription = await storage.getJobDescriptionById(jobDescriptionId);
      
      if (!resume || !jobDescription) {
        return res.status(404).json({ message: "Resume or job description not found" });
      }

      const coverLetterContent = await generateCoverLetter(
        resume.content, 
        jobDescription.content, 
        jobDescription.title, 
        jobDescription.company
      );

      // Create application first if it doesn't exist
      const application = await storage.createApplication({
        userId,
        resumeId,
        jobDescriptionId,
        status: "draft",
        matchPercentage: 0
      });

      const coverLetter = await storage.createCoverLetter({
        userId,
        applicationId: application.id,
        content: coverLetterContent
      });

      res.json(coverLetter);
    } catch (error) {
      console.error("Cover letter generation error:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  // Interview questions generation
  app.post("/api/interview-questions/generate", async (req, res) => {
    try {
      const { jobDescriptionId, userId } = req.body;
      
      const jobDescription = await storage.getJobDescriptionById(jobDescriptionId);
      if (!jobDescription) {
        return res.status(404).json({ message: "Job description not found" });
      }

      const questions = await generateInterviewQuestions(jobDescription.content, jobDescription.title);
      
      const interviewQuestions = await storage.createInterviewQuestions({
        userId,
        jobDescriptionId,
        questions: questions.general,
        behavioralQuestions: questions.behavioral,
        technicalQuestions: questions.technical
      });

      res.json(interviewQuestions);
    } catch (error) {
      console.error("Interview questions generation error:", error);
      res.status(500).json({ message: "Failed to generate interview questions" });
    }
  });

  // Skill gap analysis
  app.post("/api/skill-gap/analyze", async (req, res) => {
    try {
      const { resumeId, jobDescriptionId, userId } = req.body;
      
      const resume = await storage.getResumeById(resumeId);
      const jobDescription = await storage.getJobDescriptionById(jobDescriptionId);
      
      if (!resume || !jobDescription) {
        return res.status(404).json({ message: "Resume or job description not found" });
      }

      const skillGapAnalysis = await analyzeSkillGap(resume.content, jobDescription.content);
      
      const skillGap = await storage.createSkillGap({
        userId,
        missingSkills: skillGapAnalysis.missingSkills,
        priority: skillGapAnalysis.priority,
        recommendations: skillGapAnalysis.recommendations
      });

      res.json(skillGap);
    } catch (error) {
      console.error("Skill gap analysis error:", error);
      res.status(500).json({ message: "Failed to analyze skill gap" });
    }
  });

  // Auto-apply for job
  app.post('/api/auto-apply', async (req, res) => {
    try {
      const { userId, jobDescriptionId, resumeId } = req.body;

      const jobDesc = await storage.getJobDescriptionById(jobDescriptionId);
      const resume = await storage.getResumeById(resumeId);

      if (!jobDesc || !resume) {
        return res.status(404).json({ message: 'Job description or resume not found' });
      }

      // Create application record
      const applicationData: InsertApplication = {
        userId,
        jobDescriptionId,
        resumeId,
        status: 'applied',
        notes: 'Auto-applied via AI Job Tracker'
      };

      const application = await storage.createApplication(applicationData);

      res.json({ 
        application,
        message: 'Successfully auto-applied to position'
      });
    } catch (error) {
      console.error('Auto-apply error:', error);
      res.status(500).json({ message: 'Failed to auto-apply' });
    }
  });

  // Bulk auto-apply with intelligent matching
  app.post('/api/bulk-auto-apply', async (req, res) => {
    try {
      const { userId, resumeId, matchThreshold = 75 } = req.body;

      const resume = await storage.getResumeById(resumeId);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      // Get all job descriptions for the user  
      const jobDescriptions = await storage.getJobDescriptionsByUserId(userId);
      const applications = [];
      const skipped = [];

      for (const jobDesc of jobDescriptions) {
        try {
          // Check if already applied
          const existingApplications = await storage.getApplicationsByUserId(userId);
          const alreadyApplied = existingApplications.some((app: any) => 
            app.jobDescriptionId === jobDesc.id && app.resumeId === resumeId
          );
          
          if (alreadyApplied) {
            skipped.push({ jobDesc, reason: 'Already applied' });
            continue;
          }

          // Analyze job-resume match
          const matchResult = await analyzeJobMatch(resume.content, jobDesc.content, jobDesc.title);
          
          if (matchResult.matchPercentage >= matchThreshold) {
            // Auto-apply if match threshold is met
            const applicationData: InsertApplication = {
              userId,
              jobDescriptionId: jobDesc.id,
              resumeId,
              status: 'applied',
              notes: `Auto-applied via bulk process (${matchResult.matchPercentage}% match)`
            };

            const application = await storage.createApplication(applicationData);
            applications.push({ application, matchPercentage: matchResult.matchPercentage });
          } else {
            skipped.push({ 
              jobDesc, 
              reason: `Low match score (${matchResult.matchPercentage}% < ${matchThreshold}%)` 
            });
          }
        } catch (error) {
          console.error(`Error processing job ${jobDesc.id}:`, error);
          skipped.push({ jobDesc, reason: 'Processing error' });
        }
      }

      res.json({
        applied: applications.length,
        skipped: skipped.length,
        applications,
        skippedDetails: skipped,
        message: `Bulk auto-apply completed: ${applications.length} applications submitted`
      });
    } catch (error) {
      console.error('Bulk auto-apply error:', error);
      res.status(500).json({ message: 'Failed to execute bulk auto-apply' });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
