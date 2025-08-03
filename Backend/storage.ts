import { 
  type User, 
  type InsertUser, 
  type Resume, 
  type InsertResume,
  type JobDescription,
  type InsertJobDescription,
  type Application,
  type InsertApplication,
  type CoverLetter,
  type InsertCoverLetter,
  type InterviewQuestions,
  type InsertInterviewQuestions,
  type SkillGap,
  type InsertSkillGap,
  users,
  resumes,
  jobDescriptions,
  applications,
  coverLetters,
  interviewQuestions,
  skillGaps
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume methods
  createResume(resume: InsertResume): Promise<Resume>;
  getResumesByUserId(userId: string): Promise<Resume[]>;
  getResumeById(id: string): Promise<Resume | undefined>;
  updateResume(id: string, resume: Partial<Resume>): Promise<Resume | undefined>;
  
  // Job description methods
  createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription>;
  getJobDescriptionsByUserId(userId: string): Promise<JobDescription[]>;
  getJobDescriptionById(id: string): Promise<JobDescription | undefined>;
  
  // Application methods
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByUserId(userId: string): Promise<Application[]>;
  getApplicationById(id: string): Promise<Application | undefined>;
  updateApplicationStatus(id: string, status: string): Promise<Application | undefined>;
  
  // Cover letter methods
  createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  getCoverLettersByUserId(userId: string): Promise<CoverLetter[]>;
  getCoverLetterByApplicationId(applicationId: string): Promise<CoverLetter | undefined>;
  
  // Interview questions methods
  createInterviewQuestions(questions: InsertInterviewQuestions): Promise<InterviewQuestions>;
  getInterviewQuestionsByJobId(jobDescriptionId: string): Promise<InterviewQuestions | undefined>;
  
  // Skill gap methods
  createSkillGap(skillGap: InsertSkillGap): Promise<SkillGap>;
  getSkillGapsByUserId(userId: string): Promise<SkillGap[]>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    activeApplications: number;
    interviews: number;
    offers: number;
    avgAtsScore: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values([resume]).returning();
    return newResume;
  }

  async getResumesByUserId(userId: string): Promise<Resume[]> {
    return await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
  }

  async getResumeById(id: string): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || undefined;
  }

  async updateResume(id: string, resume: Partial<Resume>): Promise<Resume | undefined> {
    const [updatedResume] = await db.update(resumes).set(resume).where(eq(resumes.id, id)).returning();
    return updatedResume || undefined;
  }

  async createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription> {
    const [newJob] = await db.insert(jobDescriptions).values([jobDescription]).returning();
    return newJob;
  }

  async getJobDescriptionsByUserId(userId: string): Promise<JobDescription[]> {
    return await db.select().from(jobDescriptions).where(eq(jobDescriptions.userId, userId)).orderBy(desc(jobDescriptions.createdAt));
  }

  async getJobDescriptionById(id: string): Promise<JobDescription | undefined> {
    const [job] = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, id));
    return job || undefined;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getApplicationsByUserId(userId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.appliedAt));
  }

  async getApplicationById(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const [updatedApplication] = await db.update(applications).set({ status }).where(eq(applications.id, id)).returning();
    return updatedApplication || undefined;
  }

  async createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const [newCoverLetter] = await db.insert(coverLetters).values(coverLetter).returning();
    return newCoverLetter;
  }

  async getCoverLettersByUserId(userId: string): Promise<CoverLetter[]> {
    return await db.select().from(coverLetters).where(eq(coverLetters.userId, userId)).orderBy(desc(coverLetters.createdAt));
  }

  async getCoverLetterByApplicationId(applicationId: string): Promise<CoverLetter | undefined> {
    const [coverLetter] = await db.select().from(coverLetters).where(eq(coverLetters.applicationId, applicationId));
    return coverLetter || undefined;
  }

  async createInterviewQuestions(questions: InsertInterviewQuestions): Promise<InterviewQuestions> {
    const [newQuestions] = await db.insert(interviewQuestions).values([questions]).returning();
    return newQuestions;
  }

  async getInterviewQuestionsByJobId(jobDescriptionId: string): Promise<InterviewQuestions | undefined> {
    const [questions] = await db.select().from(interviewQuestions).where(eq(interviewQuestions.jobDescriptionId, jobDescriptionId));
    return questions || undefined;
  }

  async createSkillGap(skillGap: InsertSkillGap): Promise<SkillGap> {
    const [newSkillGap] = await db.insert(skillGaps).values([skillGap]).returning();
    return newSkillGap;
  }

  async getSkillGapsByUserId(userId: string): Promise<SkillGap[]> {
    return await db.select().from(skillGaps).where(eq(skillGaps.userId, userId)).orderBy(desc(skillGaps.createdAt));
  }

  async getDashboardStats(userId: string): Promise<{
    activeApplications: number;
    interviews: number;
    offers: number;
    avgAtsScore: number;
  }> {
    const userApplications = await db.select().from(applications).where(eq(applications.userId, userId));
    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, userId));
    
    const activeApplications = userApplications.filter(app => app.status === 'applied' || app.status === 'interview').length;
    const interviews = userApplications.filter(app => app.status === 'interview').length;
    const offers = userApplications.filter(app => app.status === 'offer').length;
    const avgAtsScore = userResumes.length > 0 
      ? Math.round(userResumes.reduce((sum, resume) => sum + (resume.atsScore || 0), 0) / userResumes.length)
      : 0;

    return {
      activeApplications,
      interviews,
      offers,
      avgAtsScore
    };
  }
}

export const storage = new DatabaseStorage();
