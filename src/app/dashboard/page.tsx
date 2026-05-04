import { PageHeader } from "@/components/ui/page-header";
import { StatusCard } from "@/components/ui/status-card";
import { Button } from "@/components/ui/button";
import { Play, Send, CheckCircle, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard Overview" 
        description="Welcome back! Here's what's happening with your applications today."
        action={
          <Button className="rounded-xl">
            <Play className="w-4 h-4 mr-2" />
            Start Autopilot
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard 
          title="Today's Target" 
          value="8 / 10" 
          description="2 remaining" 
          icon={<Send className="w-4 h-4" />} 
        />
        <StatusCard 
          title="Total Applied" 
          value="142" 
          description="+12 this week" 
          icon={<CheckCircle className="w-4 h-4" />} 
        />
        <StatusCard 
          title="Replies Received" 
          value="18" 
          description="12% response rate" 
          icon={<Send className="w-4 h-4" />} 
        />
        <StatusCard 
          title="Pending Review" 
          value="4" 
          description="Needs manual approval" 
          icon={<Clock className="w-4 h-4" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">Frontend Developer Intern</span>
                  <span className="text-sm text-slate-500">TechCorp Inc.</span>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Applied
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Autopilot Status</h3>
          <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Play className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-900 mb-1">Ready to run</p>
            <p className="text-sm text-slate-500">Next scheduled run at 09:00 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
