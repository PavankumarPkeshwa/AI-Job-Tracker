import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Search, 
  UserCheck, 
  BarChart3, 
  Plus,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface JobTrackerProps {
  userId: string;
  selectedResumeId: string | null;
  selectedJobId: string | null;
}

export default function JobTracker({ userId, selectedResumeId, selectedJobId }: JobTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/applications', userId],
  });

  const { data: skillGaps = [] } = useQuery({
    queryKey: ['/api/skill-gaps', userId],
  });

  const applicationsList = Array.isArray(applications) ? applications : [];
  const skillGapsList = Array.isArray(skillGaps) ? skillGaps : [];

  const generateQuestionsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedJobId) throw new Error("No job selected");
      
      const response = await apiRequest('POST', '/api/interview-questions/generate', {
        userId,
        jobDescriptionId: selectedJobId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview questions generated",
        description: "Personalized interview questions are ready for your preparation.",
      });
    },
  });

  const analyzeSkillGapMutation = useMutation({
    mutationFn: async () => {
      if (!selectedResumeId || !selectedJobId) {
        throw new Error("Resume and job required");
      }
      
      const response = await apiRequest('POST', '/api/skill-gap/analyze', {
        userId,
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skill-gaps', userId] });
      toast({
        title: "Skill gap analysis complete",
        description: "Review your skill gaps and learning recommendations.",
      });
    },
  });

  const bulkApplyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/bulk-auto-apply', {
        userId,
        resumeId: selectedResumeId,
        matchThreshold: 75
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications', userId] });
      toast({
        title: "Bulk Auto-Apply Completed",
        description: `Successfully applied to ${data.applied} positions. ${data.skipped} jobs were skipped.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to execute bulk auto-apply. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleBulkAutoApply = () => {
    if (!selectedResumeId) {
      toast({
        title: "Resume Required",
        description: "Please select a resume first.",
        variant: "destructive",
      });
      return;
    }
    bulkApplyMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-amber-100 text-amber-800';
      case 'offer': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg" 
              size="lg"
              onClick={handleBulkAutoApply}
              disabled={!selectedResumeId || bulkApplyMutation.isPending}
            >
              <Rocket className="w-4 h-4 mr-2" />
              {bulkApplyMutation.isPending ? 'Processing...' : '🚀 Bulk Auto-Apply'}
            </Button>
            
            <Button 
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg" 
              size="lg"
              onClick={() => {
                toast({
                  title: "🔍 AI Job Search",
                  description: "Smart job discovery will scan multiple platforms to find roles matching your profile.",
                });
              }}
            >
              <Search className="w-4 h-4 mr-2" />
              🔍 Find Matching Jobs
            </Button>
            
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg" 
              size="lg"
              onClick={() => generateQuestionsMutation.mutate()}
              disabled={!selectedJobId || generateQuestionsMutation.isPending}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {generateQuestionsMutation.isPending ? 'Generating...' : '🎯 Interview Prep'}
            </Button>
            
            <Button 
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg" 
              size="lg"
              onClick={() => analyzeSkillGapMutation.mutate()}
              disabled={!selectedResumeId || !selectedJobId || analyzeSkillGapMutation.isPending}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {analyzeSkillGapMutation.isPending ? 'Analyzing...' : '📊 Skill Gap Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">📋 Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applicationsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))
            ) : applicationsList.length > 0 ? (
              applicationsList.slice(0, 5).map((application: any) => (
                <div key={application.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{application.jobDescription?.title || 'Job Title'}</h3>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{application.jobDescription?.company || 'Company'}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                    <span>{application.matchPercentage}% match</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No applications yet</p>
                <p className="text-sm text-slate-500">Start by uploading a resume and analyzing job descriptions</p>
              </div>
            )}
            
            {applicationsList.length > 5 && (
              <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
                View All Applications →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Preparation */}
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">🎯 Interview Preparation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Technical Questions</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div>• Explain React hooks and their benefits</div>
                <div>• How do you optimize React app performance?</div>
                <div>• Describe microservices architecture</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Behavioral Questions</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div>• Tell me about a challenging project you led</div>
                <div>• How do you handle tight deadlines?</div>
                <div>• Describe a time you mentored a colleague</div>
              </div>
            </div>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => generateQuestionsMutation.mutate()}
              disabled={!selectedJobId || generateQuestionsMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              {generateQuestionsMutation.isPending ? 'Generating...' : 'Generate More Questions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">📊 Skill Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGapsList.length > 0 ? (
              skillGapsList.slice(0, 3).map((gap: any) => (
                <div key={gap.id}>
                  {gap.missingSkills?.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{skill}</span>
                      <Badge className={getPriorityColor(gap.priority)}>
                        {gap.priority} Priority
                      </Badge>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Docker & Containers</span>
                  <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">AWS/Cloud Platforms</span>
                  <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">GraphQL</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Low Priority</Badge>
                </div>
              </div>
            )}

            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                toast({
                  title: "Learning paths feature",
                  description: "This will show personalized learning recommendations.",
                });
              }}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              View Learning Paths
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
