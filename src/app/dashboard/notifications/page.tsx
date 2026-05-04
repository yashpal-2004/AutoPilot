import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function NotificationsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader 
        title="Telegram Notifications" 
        description="Set up instant alerts and daily summaries."
        action={<Button className="rounded-xl">Save Configuration</Button>}
      />

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Bot Token</Label>
              <Input id="token" type="password" placeholder="1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatId">Chat ID</Label>
              <Input id="chatId" placeholder="e.g. 12345678" className="rounded-xl" />
            </div>
          </div>
          
          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <Button variant="outline" className="rounded-xl">Send Test Message</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
