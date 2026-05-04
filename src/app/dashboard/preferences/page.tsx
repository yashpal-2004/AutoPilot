import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function PreferencesPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader 
        title="Preferences" 
        description="Configure your job search targets and limits."
        action={<Button className="rounded-xl">Save Changes</Button>}
      />

      <div className="space-y-6">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg border-b border-slate-100 pb-4">Targeting</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="roles">Target Roles (comma separated)</Label>
                <Input id="roles" defaultValue="Frontend Developer Intern, React Intern" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locations">Locations</Label>
                <Input id="locations" defaultValue="Remote, Bangalore, Delhi" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stipend">Minimum Stipend (₹)</Label>
                <Input id="stipend" type="number" defaultValue="5000" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="score">Minimum Match Score (0-100)</Label>
                <Input id="score" type="number" defaultValue="80" className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg border-b border-slate-100 pb-4">Safety & Avoidance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="keywords">Blocked Keywords</Label>
                <Input id="keywords" defaultValue="unpaid, field sales, security deposit" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companies">Blocked Companies</Label>
                <Input id="companies" placeholder="Company A, Company B" className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
