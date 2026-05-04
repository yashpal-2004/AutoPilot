import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, FileText, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ResumesPage() {
  const resumes = [
    { id: 1, name: "Frontend_Resume_v2.pdf", category: "Frontend", skills: ["React", "TypeScript", "Tailwind"], status: "Active", isDefault: true },
    { id: 2, name: "Backend_Node_Resume.pdf", category: "Backend", skills: ["Node.js", "Express", "PostgreSQL"], status: "Active", isDefault: false },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Resume Manager" 
        description="Upload and manage your resumes to tailor applications."
        action={
          <Button className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Upload Resume
          </Button>
        }
      />

      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              {resume.isDefault && (
                <div className="absolute top-6 right-6 flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Default
                </div>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{resume.name}</h3>
                  <p className="text-sm text-slate-500">{resume.category}</p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {resume.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="rounded-lg flex-1">View Details</Button>
                {!resume.isDefault && <Button variant="outline" size="sm" className="rounded-lg flex-1">Set Default</Button>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No resumes uploaded" 
          description="Upload your first resume to start matching with relevant jobs."
          action={<Button className="rounded-xl mt-4">Upload Resume</Button>}
        />
      )}
    </div>
  );
}
