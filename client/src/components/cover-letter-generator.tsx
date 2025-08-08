import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CoverLetterGeneratorProps {
  userId: string;
  resumeId: string | null;
  jobId: string | null;
}

export default function CoverLetterGenerator({ userId, resumeId, jobId }: CoverLetterGeneratorProps) {
  const [coverLetter, setCoverLetter] = useState<string>("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!resumeId || !jobId) {
        throw new Error("Resume and job description required");
      }
      
      const response = await apiRequest('POST', '/api/cover-letters/generate', {
        userId,
        resumeId,
        jobDescriptionId: jobId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCoverLetter(data.content);
      toast({
        title: "Cover letter generated",
        description: "Your personalized cover letter is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!resumeId || !jobId) {
      toast({
        title: "Missing requirements",
        description: "Please upload a resume and analyze a job description first.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900">📝 AI Cover Letter Generator</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !resumeId || !jobId}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
              {generateMutation.isPending ? 'Generating...' : 'Generate'}
            </Button>
            <Button 
              onClick={handleDownload}
              disabled={!coverLetter}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {coverLetter ? (
          <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-blue-600">
            <div className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
              {coverLetter}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg p-6 text-center">
            <p className="text-slate-600 mb-4">
              {!resumeId || !jobId 
                ? "Upload a resume and analyze a job description to generate a personalized cover letter."
                : "Click 'Generate' to create a personalized cover letter based on your resume and the job description."
              }
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !resumeId || !jobId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
              {generateMutation.isPending ? 'Generating...' : 'Generate Cover Letter'}
            </Button>
          </div>
        )}

        {generateMutation.isPending && (
          <div className="bg-slate-50 rounded-lg p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
