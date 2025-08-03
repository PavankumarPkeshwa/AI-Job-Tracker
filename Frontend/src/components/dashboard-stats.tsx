import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { FileText, TrendingUp, Calendar, Trophy } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export default function DashboardStats({ userId }: DashboardStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard', userId],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-16 bg-slate-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = {
    activeApplications: stats?.activeApplications || 0,
    avgAtsScore: stats?.avgAtsScore || 0,
    interviews: stats?.interviews || 0,
    offers: stats?.offers || 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-700">Active Applications</p>
            <p className="text-3xl font-bold text-blue-900">{statsData.activeApplications}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-emerald-700">ATS Score</p>
            <p className="text-3xl font-bold text-emerald-900">{statsData.avgAtsScore}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-amber-700">Interviews</p>
            <p className="text-3xl font-bold text-amber-900">{statsData.interviews}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-purple-700">Offers</p>
            <p className="text-3xl font-bold text-purple-900">{statsData.offers}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
