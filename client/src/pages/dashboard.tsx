import { useState } from "react";
import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import ResumeAnalysis from "@/components/resume-analysis";
import JobAnalysis from "@/components/job-analysis";
import CoverLetterGenerator from "@/components/cover-letter-generator";
import JobTracker from "@/components/job-tracker";

export default function Dashboard() {
  const [currentUserId] = useState("temp-user"); // In a real app, get from auth
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome to your AI Job Tracker
          </h1>
          <p className="text-lg text-slate-600">Streamline your job search with intelligent automation</p>
        </div>
        
        <DashboardStats userId={currentUserId} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ResumeAnalysis 
              userId={currentUserId} 
              onResumeSelect={setSelectedResumeId}
            />
            
            <JobAnalysis 
              userId={currentUserId}
              selectedResumeId={selectedResumeId}
              onJobSelect={setSelectedJobId}
            />
            
            <CoverLetterGenerator 
              userId={currentUserId}
              resumeId={selectedResumeId}
              jobId={selectedJobId}
            />
          </div>
          
          <div>
            <JobTracker 
              userId={currentUserId}
              selectedResumeId={selectedResumeId}
              selectedJobId={selectedJobId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
