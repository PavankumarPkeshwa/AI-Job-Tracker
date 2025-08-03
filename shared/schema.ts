import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  skills: jsonb("skills").$type<string[]>().default([]),
  experience: text("experience"),
  education: text("education"),
  atsScore: integer("ats_score").default(0),
  strengths: jsonb("strengths").$type<string[]>().default([]),
  weaknesses: jsonb("weaknesses").$type<string[]>().default([]),
  suggestions: text("suggestions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobDescriptions = pgTable("job_descriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  content: text("content").notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>().default([]),
  experienceLevel: text("experience_level"),
  location: text("location"),
  salary: text("salary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  resumeId: varchar("resume_id").notNull().references(() => resumes.id),
  jobDescriptionId: varchar("job_description_id").notNull().references(() => jobDescriptions.id),
  status: text("status").notNull().default("applied"), // applied, interview, offer, rejected
  matchPercentage: integer("match_percentage").default(0),
  appliedAt: timestamp("applied_at").defaultNow(),
  interviewDate: timestamp("interview_date"),
  notes: text("notes"),
});

export const coverLetters = pgTable("cover_letters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").notNull().references(() => applications.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobDescriptionId: varchar("job_description_id").notNull().references(() => jobDescriptions.id),
  questions: jsonb("questions").$type<string[]>().default([]),
  behavioralQuestions: jsonb("behavioral_questions").$type<string[]>().default([]),
  technicalQuestions: jsonb("technical_questions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillGaps = pgTable("skill_gaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  missingSkills: jsonb("missing_skills").$type<string[]>().default([]),
  priority: text("priority").notNull(), // high, medium, low
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  jobDescriptions: many(jobDescriptions),
  applications: many(applications),
  coverLetters: many(coverLetters),
  interviewQuestions: many(interviewQuestions),
  skillGaps: many(skillGaps),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, { fields: [resumes.userId], references: [users.id] }),
  applications: many(applications),
}));

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one, many }) => ({
  user: one(users, { fields: [jobDescriptions.userId], references: [users.id] }),
  applications: many(applications),
  interviewQuestions: many(interviewQuestions),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, { fields: [applications.userId], references: [users.id] }),
  resume: one(resumes, { fields: [applications.resumeId], references: [resumes.id] }),
  jobDescription: one(jobDescriptions, { fields: [applications.jobDescriptionId], references: [jobDescriptions.id] }),
  coverLetters: many(coverLetters),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  user: one(users, { fields: [coverLetters.userId], references: [users.id] }),
  application: one(applications, { fields: [coverLetters.applicationId], references: [applications.id] }),
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one }) => ({
  user: one(users, { fields: [interviewQuestions.userId], references: [users.id] }),
  jobDescription: one(jobDescriptions, { fields: [interviewQuestions.jobDescriptionId], references: [jobDescriptions.id] }),
}));

export const skillGapsRelations = relations(skillGaps, ({ one }) => ({
  user: one(users, { fields: [skillGaps.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });
export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true });
export const insertCoverLetterSchema = createInsertSchema(coverLetters).omit({ id: true, createdAt: true });
export const insertInterviewQuestionsSchema = createInsertSchema(interviewQuestions).omit({ id: true, createdAt: true });
export const insertSkillGapSchema = createInsertSchema(skillGaps).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type CoverLetter = typeof coverLetters.$inferSelect;
export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;
export type InterviewQuestions = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestions = z.infer<typeof insertInterviewQuestionsSchema>;
export type SkillGap = typeof skillGaps.$inferSelect;
export type InsertSkillGap = z.infer<typeof insertSkillGapSchema>;
