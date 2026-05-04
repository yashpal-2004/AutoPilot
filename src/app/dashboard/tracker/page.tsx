"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Clock, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplied() {
      try {
        const res = await fetch("/api/jobs?view=applied");
        const data = await res.json();
        setApplications(data.jobs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchApplied();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Applied Jobs" 
          description="A complete history of all applications submitted by the AutoPilot Engine."
        />
        <Badge variant="outline" className="px-3 py-1 bg-white border-slate-200">
          <span className="font-semibold text-slate-900">{applications.length}</span>
          <span className="ml-1 text-slate-500 font-normal">Applications Sent</span>
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Clock className="w-5 h-5 mr-2 animate-spin" /> Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <CheckCircle className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No applications yet</h3>
          <p className="text-slate-500 mt-1 max-w-sm">When the AutoPilot submits a job application for you, it will permanently appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-200 hover:shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-slate-900 text-lg">{job.title}</h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2">Applied</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500">
                  <span className="flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" />
                    {job.companyName}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    {job.location}
                  </span>
                  {job.appliedAt && (
                    <span className="flex items-center text-slate-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                      Applied {new Date(job.appliedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <a 
                href={job.jobUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-xl border-slate-200 text-slate-900 hover:bg-slate-50 w-full md:w-auto"
              >
                View Application <ExternalLink className="w-3.5 h-3.5 ml-2 text-slate-400" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
