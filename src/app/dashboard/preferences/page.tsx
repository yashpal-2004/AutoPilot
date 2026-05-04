"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Send, 
  ShieldCheck, 
  Settings2, 
  Target, 
  BellRing, 
  Loader2, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Preferences State
  const [prefs, setPrefs] = useState({
    targetRoles: "",
    locations: "",
    skills: "",
    minStipend: "5000",
    minMatchScore: "80",
    avoidKeywords: "unpaid, field sales",
    blockedCompanies: "",
    remoteOnly: false,
    avoidUnpaid: true
  });

  // Telegram State
  const [tg, setTg] = useState({
    botToken: "",
    chatId: "",
    hasConfig: false,
    showToken: false
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/preferences");
        const data = await res.json();
        if (data.success && data.preferences) {
          const p = data.preferences;
          setPrefs({
            targetRoles: (p.targetRolesJson as string[] || []).join(", "),
            locations: (p.locationsJson as string[] || []).join(", "),
            skills: (p.skillsJson as string[] || []).join(", "),
            minStipend: p.minStipend?.toString() || "5000",
            minMatchScore: p.minMatchScore?.toString() || "80",
            avoidKeywords: (p.avoidKeywordsJson as string[] || []).join(", "),
            blockedCompanies: (p.blockedCompaniesJson as string[] || []).join(", "),
            remoteOnly: p.remoteOnly,
            avoidUnpaid: p.avoidUnpaid
          });
          setTg(prev => ({ ...prev, hasConfig: data.telegram.hasToken }));
        }
      } catch (e) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSavePrefs = async () => {
    try {
      setSaving(true);
      const payload = {
        action: "save_preferences",
        preferences: {
          ...prefs,
          targetRoles: prefs.targetRoles.split(",").map(s => s.trim()).filter(Boolean),
          locations: prefs.locations.split(",").map(s => s.trim()).filter(Boolean),
          skills: prefs.skills.split(",").map(s => s.trim()).filter(Boolean),
          avoidKeywords: prefs.avoidKeywords.split(",").map(s => s.trim()).filter(Boolean),
          blockedCompanies: prefs.blockedCompanies.split(",").map(s => s.trim()).filter(Boolean),
        }
      };
      
      const res = await fetch("/api/preferences", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      if ((await res.json()).success) {
        toast.success("Preferences saved successfully");
      }
    } catch (e) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTelegram = async () => {
    if (!tg.botToken || !tg.chatId) {
      toast.error("Bot Token and Chat ID are required");
      return;
    }
    
    try {
      setSaving(true);
      const res = await fetch("/api/preferences", {
        method: "POST",
        body: JSON.stringify({
          action: "save_telegram",
          telegram: { botToken: tg.botToken, chatId: tg.chatId }
        })
      });
      
      if ((await res.json()).success) {
        toast.success("Telegram bot configured!");
        setTg(prev => ({ ...prev, botToken: "", chatId: "", hasConfig: true }));
      }
    } catch (e) {
      toast.error("Failed to save Telegram config");
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    try {
      setTesting(true);
      const res = await fetch("/api/preferences", {
        method: "POST",
        body: JSON.stringify({ action: "test_telegram" })
      });
      if ((await res.json()).success) {
        toast.success("Test message sent!");
      }
    } catch (e) {
      toast.error("Test failed. Check your config.");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading your profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      <PageHeader 
        title="Settings & Preferences" 
        description="Fine-tune your AutoPilot and secure your notification channels."
        action={
          <Button onClick={handleSavePrefs} disabled={saving} className="rounded-xl px-8 shadow-lg shadow-blue-100">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings2 className="w-4 h-4 mr-2" />}
            Save All Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Job Targeting</h3>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-100">Intelligent Scraper</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Roles</Label>
                  <Input 
                    value={prefs.targetRoles} 
                    onChange={e => setPrefs({...prefs, targetRoles: e.target.value})}
                    placeholder="e.g. Frontend Developer, React Intern" 
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white" 
                  />
                  <p className="text-[11px] text-slate-400">Comma separated titles to match against.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills</Label>
                  <Input 
                    value={prefs.skills} 
                    onChange={e => setPrefs({...prefs, skills: e.target.value})}
                    placeholder="e.g. React, Node.js, Python" 
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white" 
                  />
                  <p className="text-[11px] text-slate-400">Used to calculate your Match Score.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Min Stipend (₹)</Label>
                  <Input 
                    type="number"
                    value={prefs.minStipend} 
                    onChange={e => setPrefs({...prefs, minStipend: e.target.value})}
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Min Match Score (%)</Label>
                  <Input 
                    type="number"
                    value={prefs.minMatchScore} 
                    onChange={e => setPrefs({...prefs, minMatchScore: e.target.value})}
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900">Safety & Filters</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Block Keywords</Label>
                  <Input 
                    value={prefs.avoidKeywords} 
                    onChange={e => setPrefs({...prefs, avoidKeywords: e.target.value})}
                    placeholder="e.g. unpaid, registration fee" 
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Block Companies</Label>
                  <Input 
                    value={prefs.blockedCompanies} 
                    onChange={e => setPrefs({...prefs, blockedCompanies: e.target.value})}
                    placeholder="e.g. Scammers Inc." 
                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold">Telegram Bot</h3>
              </div>
              {tg.hasConfig ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
              ) : (
                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Setup Needed</Badge>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bot Token</Label>
                    <button onClick={() => setTg({...tg, showToken: !tg.showToken})} className="text-slate-400 hover:text-slate-600">
                      {tg.showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input 
                      type={tg.showToken ? "text" : "password"}
                      value={tg.botToken} 
                      onChange={e => setTg({...tg, botToken: e.target.value})}
                      placeholder={tg.hasConfig ? "••••••••••••••••••••" : "Enter Bot Token"} 
                      className="rounded-xl bg-slate-50 pr-10" 
                    />
                    <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-300" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Chat ID</Label>
                  <Input 
                    value={tg.chatId} 
                    onChange={e => setTg({...tg, chatId: e.target.value})}
                    placeholder={tg.hasConfig ? "•••••••••" : "Enter Chat ID"} 
                    className="rounded-xl bg-slate-50" 
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <Button onClick={handleSaveTelegram} disabled={saving} variant="secondary" className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border-none">
                    Save Bot
                  </Button>
                  {tg.hasConfig && (
                    <Button onClick={handleTestTelegram} disabled={testing} variant="outline" className="flex-1 rounded-xl border-slate-200">
                      {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4 mr-2 text-blue-600" />}
                      Test
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
                <h4 className="text-sm font-bold text-blue-900">Setup Guide</h4>
                <ol className="text-[11px] text-blue-700 space-y-1 list-decimal ml-4">
                  <li>Message <b>@BotFather</b> to create a bot.</li>
                  <li>Get the <b>API Token</b> and paste above.</li>
                  <li>Message your bot and visit <b>@userinfobot</b> to find your <b>Chat ID</b>.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

