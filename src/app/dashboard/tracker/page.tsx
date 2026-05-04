import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

export default function TrackerPage() {
  const applications = [
    { id: 1, company: "TechCorp Inc.", role: "Frontend Developer Intern", date: "2026-05-04", status: "Applied" },
    { id: 2, company: "CloudWorks", role: "Fullstack Intern", date: "2026-05-03", status: "Seen" },
    { id: 3, company: "AI Startup", role: "React Intern", date: "2026-05-01", status: "Replied" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Application Tracker" 
        description="Monitor the status of your submitted applications."
      />

      <div className="grid gap-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 text-lg">{app.role}</h3>
              <p className="text-sm text-slate-500">{app.company} &bull; Applied on {app.date}</p>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm rounded-full bg-slate-50 border-slate-200 text-slate-600">
              {app.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
