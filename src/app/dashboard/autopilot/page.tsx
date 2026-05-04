import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

export default function AutopilotPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader 
        title="Autopilot" 
        description="Configure automated application behavior."
        action={<Button className="rounded-xl">Save Settings</Button>}
      />

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-4 items-start text-amber-800">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Safety First Guarantee</p>
          <p>Autopilot will never bypass CAPTCHA, OTP, or platform protections. It automatically pauses when unusual questions or login challenges appear.</p>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="limit">Daily Application Target</Label>
              <Input id="limit" type="number" defaultValue="10" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Schedule Time</Label>
              <Input id="time" type="time" defaultValue="09:00" className="rounded-xl" />
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Enable Autopilot</p>
              <p className="text-sm text-slate-500">Run automation daily at the scheduled time.</p>
            </div>
            <Button variant="outline" className="rounded-xl">Turn On</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
