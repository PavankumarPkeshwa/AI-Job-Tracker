import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, CloudUpload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ResumeAnalysisProps {
  userId: string;
  onResumeSelect: (resumeId: string) => void;
}

export default function ResumeAnalysis({ userId, onResumeSelect }: ResumeAnalysisProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['/api/resumes', userId],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', userId);
      
      const response = await apiRequest('POST', '/api/resumes/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard', userId] });
      onResumeSelect(data.id);
      toast({
        title: "Resume uploaded successfully",
        description: `ATS Score: ${data.atsScore}/100`,
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload and analyze resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/pdf' && !file.type.includes('document')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const latestResume = resumes && Array.isArray(resumes) && resumes.length > 0 ? resumes[0] : null;

  return (
    <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900">🚀 Resume Analysis</CardTitle>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Resume'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          <CloudUpload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-900 mb-2">Drag and drop your resume here</p>
          <p className="text-sm text-slate-600 mb-4">or click to browse files (PDF, DOC, DOCX)</p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </div>

        {/* Analysis Results */}
        {latestResume && (
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">ATS Compatibility Score</h3>
              <span className="text-2xl font-bold text-emerald-600">{latestResume.atsScore}/100</span>
            </div>
            
            <Progress value={latestResume.atsScore} className="mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Strengths</h4>
                <div className="space-y-1">
                  {latestResume.strengths?.map((strength: string, index: number) => (
                    <Badge key={index} className="bg-emerald-100 text-emerald-800 mr-1 mb-1">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Missing Keywords</h4>
                <div className="space-y-1">
                  {latestResume.weaknesses?.map((weakness: string, index: number) => (
                    <Badge key={index} className="bg-red-100 text-red-800 mr-1 mb-1">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {latestResume.suggestions && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
                <p className="text-sm text-blue-800">{latestResume.suggestions}</p>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="bg-slate-50 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded mb-4"></div>
            <div className="h-2 bg-slate-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
