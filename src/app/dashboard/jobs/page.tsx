import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function JobsPage() {
  const jobs = [
    { id: 1, company: "TechCorp Inc.", role: "Frontend Developer Intern", location: "Remote", stipend: "₹10,000/mo", score: 92, status: "Ready" },
    { id: 2, company: "DataFlow Labs", role: "React Intern", location: "Bangalore", stipend: "₹15,000/mo", score: 88, status: "Skipped" },
    { id: 3, company: "Innovate AI", role: "Software Engineer Intern", location: "Remote", stipend: "₹8,000/mo", score: 85, status: "Ready" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Job Matches" 
        description="Discover and review relevant internships based on your profile."
        action={
          <Button className="rounded-xl">
            <Search className="w-4 h-4 mr-2" />
            Discover Jobs
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Stipend</TableHead>
              <TableHead className="font-semibold text-center">Score</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium text-slate-900">{job.company}</TableCell>
                <TableCell>{job.role}</TableCell>
                <TableCell className="text-slate-500">{job.location}</TableCell>
                <TableCell className="text-slate-500">{job.stipend}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={job.score >= 90 ? "default" : "secondary"} className="rounded-md">
                    {job.score}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="rounded-lg">View</Button>
                    {job.status === "Ready" && (
                      <Button size="sm" className="rounded-lg">Prepare</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
