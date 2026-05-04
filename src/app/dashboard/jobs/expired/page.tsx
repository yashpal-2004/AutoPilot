"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Search, MapPin, DollarSign, ExternalLink, Calendar, Loader2, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import Link from "next/link";

export default function ExpiredJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpiredJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs?status=expired");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch expired jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiredJobs();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Past Deadlines" 
        description="Internships that are no longer accepting applications."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-slate-400" />
          <p>Loading past deadlines...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No expired jobs"
          description="None of your fetched internships have expired yet. Good job staying on top of it!"
          action={
            <Link href="/dashboard/jobs">
              <Button>View Active Jobs</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm relative opacity-75 grayscale-[0.5]">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-600 mb-1 line-through">{job.title}</h3>
                  <div className="text-slate-500 font-medium text-sm mb-3">{job.companyName}</div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      {job.stipend}
                    </div>
                    {job.deadline && (
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-200 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        Expired on {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-4">
                <a 
                  href={job.jobUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-not-allowed"
                >
                  View Original Listing <ExternalLink className="w-3.5 h-3.5" />
                </a>
                
                <Button disabled variant="outline" className="rounded-xl shadow-sm bg-slate-100 text-slate-400">
                  Applications Closed
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
