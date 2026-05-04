"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, ExternalLink, Calendar, Loader2, ClipboardList, Star } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import Link from "next/link";

export default function HistoryJobsPage() {
  const [groupedJobs, setGroupedJobs] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchHistoryJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs?view=history");
      const data = await res.json();
      if (data.success) {
        // Group by Date and Session Time
        const groups: Record<string, any[]> = {};
        data.jobs.forEach((job: any) => {
          const date = new Date(job.createdAt);
          const dateString = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          // Group sessions by rounding to nearest 10 minutes to group bulk scrapes together
          const minutes = date.getMinutes();
          const roundedMinutes = Math.floor(minutes / 10) * 10;
          date.setMinutes(roundedMinutes);
          const timeString = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          
          const groupKey = `${dateString} - Session: ${timeString}`;
          if (!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push(job);
        });
        setGroupedJobs(groups);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch job history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryJobs();
  }, []);

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const groupKeys = Object.keys(groupedJobs);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="All Jobs History" 
        description="A complete archive of every internship you have fetched, grouped by scraping session."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
          <p>Loading scraping history...</p>
        </div>
      ) : groupKeys.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8" />}
          title="No scraping history"
          description="You haven't scraped any internships yet."
          action={
            <Link href="/dashboard/jobs">
              <Button>Go to Job Discovery</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-12">
          {groupKeys.map((sessionKey) => (
            <div key={sessionKey} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{sessionKey}</h2>
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {groupedJobs[sessionKey].length} Jobs
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {groupedJobs[sessionKey].map((job) => (
                  <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
                        <div className="text-blue-600 font-medium text-sm mb-3">{job.companyName}</div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            {job.stipend}
                          </div>
                          {job.deadline ? (
                            <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                              <Calendar className="w-4 h-4" />
                              Apply by {new Date(job.deadline).toLocaleDateString()}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                              <Calendar className="w-4 h-4" />
                              Rolling Deadline
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border ${getMatchColor(job.matchScore)}`}>
                        <span className="text-xs font-semibold uppercase tracking-wider mb-0.5">Match</span>
                        <span className="text-xl font-bold">{job.matchScore}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                      <a 
                        href={job.jobUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        View on Internshala <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      
                      <Button className="rounded-xl shadow-sm bg-slate-900 hover:bg-slate-800">
                        <Star className="w-4 h-4 mr-2" />
                        Auto-Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
