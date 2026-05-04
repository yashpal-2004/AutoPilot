"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, DollarSign, ExternalLink, RefreshCw, Star, Loader2, Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleScrape = async () => {
    try {
      setScraping(true);
      const res = await fetch("/api/jobs/scrape", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        if (data.skippedCount > 0) {
          toast.success(`Fetched ${data.count} new internships! (Skipped ${data.skippedCount} old companies)`);
        } else {
          toast.success(`Successfully fetched ${data.count} new internships!`);
        }
        fetchJobs();
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || "Scraping failed");
    } finally {
      setScraping(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Discovery</h1>
            {!loading && (
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                {jobs.length} Jobs
              </span>
            )}
          </div>
          <p className="text-slate-500">Explore live internships matching your default resume profile.</p>
        </div>
        
        <Button onClick={handleScrape} disabled={scraping} className="rounded-xl shadow-sm">
          {scraping ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {scraping ? "Scanning Internshala..." : "Fetch Latest Jobs"}
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
          <p>Analyzing job matches...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No jobs found yet"
          description="Click 'Fetch Latest Jobs' to run the scraper and find internships on Internshala."
          action={
            <Button onClick={handleScrape} disabled={scraping}>
              {scraping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Fetch Jobs"}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {jobs.map((job) => {
            return (
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
          );
        })}
      </div>
      )}
    </div>
  );
}
