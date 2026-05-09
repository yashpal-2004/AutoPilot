import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Clock, 
  Send, 
  TrendingUp, 
  Zap, 
  ExternalLink,
  Loader2,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeCycle: false,
    matchedJobs: 0,
    lastRun: "Never"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking stats for now, in a real app you'd fetch from /api/stats
    setTimeout(() => {
      setStats({
        totalApplications: 24,
        activeCycle: true,
        matchedJobs: 156,
        lastRun: "2 hours ago"
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleManualScrape = async () => {
    try {
      setLoading(true);
      toast.info("Manual scrape initiated...");
      await axios.post("/api/preferences", { action: "trigger_autopilot" });
      toast.success("Scrape complete! Check logs for new matches.");
      // Refresh stats if needed
    } catch (e) {
      toast.error("Failed to start manual scrape.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSheets = async () => {
    try {
      setLoading(true);
      toast.info("Syncing with Google Sheets...");
      await axios.post("/api/preferences", { action: "sync_sheets" });
      toast.success("Sync complete!");
    } catch (e) {
      toast.error("Sync failed. Check if Google Sheets API is enabled.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Pilot</h1>
          <p className="text-slate-500 mt-1">Here is what's happening with your job search today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSyncSheets}
            className="bg-white text-slate-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Sync Google Sheets
          </button>
          <button 
            onClick={handleManualScrape}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            Trigger Manual Scrape
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Applications" 
          value={stats.totalApplications} 
          icon={Send} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          label="Match Score Found" 
          value="85%" 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          label="Jobs Scanned" 
          value={stats.matchedJobs} 
          icon={CheckCircle} 
          color="bg-amber-50 text-amber-600" 
        />
        <StatCard 
          label="Last Run" 
          value={stats.lastRun} 
          icon={Clock} 
          color="bg-purple-50 text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Applications</h3>
            <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
              View All <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="p-0">
            {/* Mock recent apps list */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b last:border-0 border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                    {i === 1 ? 'G' : i === 2 ? 'M' : 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{i === 1 ? 'Google' : i === 2 ? 'Meta' : 'Stripe'}</h4>
                    <p className="text-xs text-slate-500">Frontend Developer Intern</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">94% Match</p>
                  </div>
                  <span className="text-xs text-slate-400">Applied 2h ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Zap className="w-32 h-32 text-blue-400 fill-blue-400" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">AutoPilot Pro</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AI-driven applications are running in the background. We tailor every pitch to your unique skills.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
                <span className="text-sm font-medium">Llama 3.3-70B Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
                <span className="text-sm font-medium">Smart Scoring Enabled</span>
              </div>
            </div>
          </div>
          <button className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl shadow-xl shadow-blue-900/50 transition-all relative z-10">
            Upgrade Capacity
          </button>
        </div>
      </div>
    </div>
  );
}
