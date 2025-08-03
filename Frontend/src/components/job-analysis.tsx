import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, NotebookPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface JobAnalysisProps {
  userId: string;
  selectedResumeId: string | null;
  onJobSelect: (jobId: string) => void;
}

export default function JobAnalysis({ userId, selectedResumeId, onJobSelect }: JobAnalysisProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [matchResult, setMatchResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest('POST', '/api/job-descriptions', jobData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-descriptions', userId] });
      onJobSelect(data.id);
      if (selectedResumeId) {
        analyzeMatch(selectedResumeId, data.id);
      }
    },
  });

  const matchMutation = useMutation({
    mutationFn: async ({ resumeId, jobDescriptionId }: { resumeId: string; jobDescriptionId: string }) => {
      const response = await apiRequest('POST', '/api/job-match', { resumeId, jobDescriptionId });
      return response.json();
    },
    onSuccess: (data) => {
      setMatchResult(data);
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze job match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async ({ resumeId, jobDescriptionId }: { resumeId: string; jobDescriptionId: string }) => {
      const response = await apiRequest('POST', '/api/applications', {
        userId,
        resumeId,
        jobDescriptionId,
        status: "applied",
        matchPercentage: matchResult?.matchPercentage || 0
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard', userId] });
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      });
    },
  });

  const handleAddJob = () => {
    if (!jobTitle || !company || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate({
      userId,
      title: jobTitle,
      company,
      content: jobDescription,
      requiredSkills: [],
      experienceLevel: "",
      location: "",
      salary: ""
    });
  };

  const analyzeMatch = (resumeId: string, jobId: string) => {
    matchMutation.mutate({ resumeId, jobDescriptionId: jobId });
  };

  const handleAutoApply = () => {
    if (!selectedResumeId || !matchResult?.jobDescriptionId) {
      toast({
        title: "Cannot apply",
        description: "Please select a resume and analyze a job first.",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate({
      resumeId: selectedResumeId,
      jobDescriptionId: matchResult.jobDescriptionId
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900">🎯 Job Description Analysis</CardTitle>
          <Button 
            onClick={handleAddJob}
            disabled={createJobMutation.isPending}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job Description
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Job Input Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Full Stack Developer"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., TechCorp Inc."
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for AI analysis..."
              className="h-32"
            />
          </div>
          
          <Button 
            onClick={handleAddJob}
            disabled={createJobMutation.isPending || !selectedResumeId}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Search className="w-4 h-4 mr-2" />
            {createJobMutation.isPending ? 'Analyzing...' : 'Analyze Match'}
          </Button>
        </div>

        {/* Match Results */}
        {matchResult && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">✨ Resume-Job Match Analysis</h3>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {matchResult.matchPercentage}%
                </span>
                <span className="text-sm text-slate-600">Match</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white/70 rounded-xl border border-emerald-200 shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">{matchResult.skillsMatch}</div>
                <div className="text-sm text-emerald-700 font-medium">Skills Match</div>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-xl border border-amber-200 shadow-sm">
                <div className="text-2xl font-bold text-amber-600">{matchResult.experienceMatch}</div>
                <div className="text-sm text-amber-700 font-medium">Experience Level</div>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-xl border border-purple-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{matchResult.educationMatch ? 'Yes' : 'No'}</div>
                <div className="text-sm text-purple-700 font-medium">Education Req.</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={() => {/* Generate cover letter logic will be handled by parent */}}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Cover Letter
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
                onClick={handleAutoApply}
                disabled={applyMutation.isPending}
              >
                <NotebookPen className="w-4 h-4 mr-2" />
                {applyMutation.isPending ? 'Applying...' : '🚀 Auto Apply'}
              </Button>
            </div>
          </div>
        )}

        {matchMutation.isPending && (
          <div className="bg-slate-50 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-slate-200 rounded"></div>
              <div className="h-16 bg-slate-200 rounded"></div>
              <div className="h-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
