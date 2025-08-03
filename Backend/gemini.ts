import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ResumeAnalysis {
  skills: string[];
  experience: string;
  education: string;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
}

export interface JobMatchAnalysis {
  matchPercentage: number;
  skillsMatch: string;
  experienceMatch: string;
  educationMatch: boolean;
  missingSkills: string[];
  jobDescriptionId?: string;
}

export interface InterviewQuestions {
  general: string[];
  technical: string[];
  behavioral: string[];
}

export interface SkillGapAnalysis {
  missingSkills: string[];
  priority: string;
  recommendations: string;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  try {
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) and resume analyzer. 
Analyze the provided resume and extract key information. Provide a comprehensive analysis including:
- Skills (programming languages, frameworks, tools)
- Experience summary
- Education details
- ATS score (0-100 based on keyword density, formatting, and relevance)
- Strengths (skills and experiences that stand out)
- Weaknesses (missing keywords or areas for improvement)
- Suggestions for improvement

Respond with JSON in this exact format:
{
  "skills": ["skill1", "skill2"],
  "experience": "brief summary",
  "education": "education details",
  "atsScore": number,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": "detailed suggestions"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            skills: { type: "array", items: { type: "string" } },
            experience: { type: "string" },
            education: { type: "string" },
            atsScore: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            suggestions: { type: "string" }
          },
          required: ["skills", "experience", "education", "atsScore", "strengths", "weaknesses", "suggestions"]
        }
      },
      contents: resumeText
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Resume analysis error:", error);
    throw new Error(`Failed to analyze resume: ${error}`);
  }
}

export async function analyzeJobMatch(
  resumeText: string, 
  jobDescription: string, 
  jobTitle: string
): Promise<JobMatchAnalysis> {
  try {
    const systemPrompt = `You are an expert job matching analyst. Compare the provided resume with the job description and analyze how well they match.

Calculate:
- Overall match percentage (0-100)
- Skills match ratio (e.g., "15/18")
- Experience level match (e.g., "4/5")
- Education requirements match (boolean)
- Missing skills that are required for the job

Respond with JSON in this exact format:
{
  "matchPercentage": number,
  "skillsMatch": "x/y",
  "experienceMatch": "x/y", 
  "educationMatch": boolean,
  "missingSkills": ["skill1", "skill2"]
}`;

    const prompt = `Job Title: ${jobTitle}

Resume:
${resumeText}

Job Description:
${jobDescription}

Analyze the match between this resume and job description.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matchPercentage: { type: "number" },
            skillsMatch: { type: "string" },
            experienceMatch: { type: "string" },
            educationMatch: { type: "boolean" },
            missingSkills: { type: "array", items: { type: "string" } }
          },
          required: ["matchPercentage", "skillsMatch", "experienceMatch", "educationMatch", "missingSkills"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Job match analysis error:", error);
    throw new Error(`Failed to analyze job match: ${error}`);
  }
}

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<string> {
  try {
    const prompt = `Create a professional, personalized cover letter based on the following information:

Job Title: ${jobTitle}
Company: ${company}
Resume: ${resumeText}
Job Description: ${jobDescription}

Requirements:
- Professional tone and format
- Highlight relevant experience from the resume
- Address specific requirements mentioned in the job description
- Show enthusiasm for the role and company
- Include proper opening and closing
- Keep it concise but impactful (3-4 paragraphs)
- Use the applicant's actual experience and skills from the resume

Write a complete cover letter that would impress hiring managers.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt
    });

    return response.text || "Failed to generate cover letter";
  } catch (error) {
    console.error("Cover letter generation error:", error);
    throw new Error(`Failed to generate cover letter: ${error}`);
  }
}

export async function generateInterviewQuestions(
  jobDescription: string,
  jobTitle: string
): Promise<InterviewQuestions> {
  try {
    const systemPrompt = `You are an expert interviewer and HR professional. Generate relevant interview questions based on the job description and title.

Create three categories of questions:
- General questions (5-7 questions about the role and company fit)
- Technical questions (5-7 questions specific to the technical requirements)
- Behavioral questions (5-7 STAR method questions)

Respond with JSON in this exact format:
{
  "general": ["question1", "question2"],
  "technical": ["tech question1", "tech question2"],
  "behavioral": ["behavioral question1", "behavioral question2"]
}`;

    const prompt = `Job Title: ${jobTitle}
Job Description: ${jobDescription}

Generate comprehensive interview questions for this position.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            general: { type: "array", items: { type: "string" } },
            technical: { type: "array", items: { type: "string" } },
            behavioral: { type: "array", items: { type: "string" } }
          },
          required: ["general", "technical", "behavioral"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Interview questions generation error:", error);
    throw new Error(`Failed to generate interview questions: ${error}`);
  }
}

export async function analyzeSkillGap(
  resumeText: string,
  jobDescription: string
): Promise<SkillGapAnalysis> {
  try {
    const systemPrompt = `You are a career development expert. Analyze the gap between the candidate's current skills (from resume) and the job requirements.

Identify:
- Missing skills that are required or preferred for the job
- Priority level (high, medium, low) based on how critical these skills are
- Specific recommendations for acquiring these skills

Respond with JSON in this exact format:
{
  "missingSkills": ["skill1", "skill2"],
  "priority": "high|medium|low",
  "recommendations": "detailed recommendations"
}`;

    const prompt = `Candidate Resume:
${resumeText}

Job Requirements:
${jobDescription}

Analyze the skill gap and provide learning recommendations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            missingSkills: { type: "array", items: { type: "string" } },
            priority: { type: "string" },
            recommendations: { type: "string" }
          },
          required: ["missingSkills", "priority", "recommendations"]
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    throw new Error(`Failed to analyze skill gap: ${error}`);
  }
}
