import { Briefcase, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Job Tracker
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#dashboard" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">Dashboard</a>
              <a href="#resume" className="text-slate-600 hover:text-purple-600 transition-colors">Resume</a>
              <a href="#jobs" className="text-slate-600 hover:text-purple-600 transition-colors">Jobs</a>
              <a href="#interviews" className="text-slate-600 hover:text-purple-600 transition-colors">Interviews</a>
              <a href="#analytics" className="text-slate-600 hover:text-purple-600 transition-colors">Analytics</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hover:bg-purple-50">
              <Bell className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-sm font-medium text-slate-900 hidden sm:block">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
