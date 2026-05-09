import { useState, useEffect } from "react";
import { 
  Target, 
  ShieldCheck, 
  Zap, 
  Send, 
  BellRing, 
  RefreshCw,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Settings2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Preferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Preferences State
  const [prefs, setPrefs] = useState({
    targetRoles: "",
    locations: "",
    skills: "",
    minStipend: "10000",
    minMatchScore: "80",
    avoidKeywords: "",
    blockedCompanies: "",
    remoteOnly: false,
    avoidUnpaid: true,
    autopilotEnabled: false
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
        const res = await axios.get("/api/preferences");
        const { preferences, telegram } = res.data;
        if (preferences) {
          setPrefs({
            targetRoles: (preferences.targetRolesJson || []).join(", "),
            locations: (preferences.locationsJson || []).join(", "),
            skills: (preferences.skillsJson || []).join(", "),
            minStipend: preferences.minStipend?.toString() || "10000",
            minMatchScore: preferences.minMatchScore?.toString() || "80",
            avoidKeywords: (preferences.avoidKeywordsJson || []).join(", "),
            blockedCompanies: (preferences.blockedCompaniesJson || []).join(", "),
            remoteOnly: preferences.remoteOnly,
            avoidUnpaid: preferences.avoidUnpaid,
            autopilotEnabled: preferences.autopilotEnabled
          });
          setTg(prev => ({ ...prev, hasConfig: telegram.hasToken }));
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
      
      await axios.post("/api/preferences", payload);
      toast.success("Preferences saved successfully");
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
      await axios.post("/api/preferences", {
        action: "save_telegram",
        telegram: { botToken: tg.botToken, chatId: tg.chatId }
      });
      toast.success("Telegram bot configured!");
      setTg(prev => ({ ...prev, botToken: "", chatId: "", hasConfig: true }));
    } catch (e) {
      toast.error("Failed to save Telegram config");
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    try {
      setTesting(true);
      await axios.post("/api/preferences", { action: "test_telegram" });
      toast.success("Test message sent!");
    } catch (e) {
      toast.error("Test failed. Check your config.");
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerAutopilot = async () => {
    try {
      toast.info("Triggering background cycle...");
      await axios.post("/api/preferences", { action: "trigger_autopilot" });
      toast.success("Cycle started in the background!");
    } catch (e) {
      toast.error("Failed to trigger cycle");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mr-3" /> Fetching your preferences...
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1">Configure your targeting and notification channels.</p>
        </div>
        <button 
          onClick={handleSavePrefs} 
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Job Targeting</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Scraper Config</span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Target Roles</label>
                <input 
                  value={prefs.targetRoles} 
                  onChange={e => setPrefs({...prefs, targetRoles: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g. Frontend Developer, React Intern"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Preferred Skills</label>
                <input 
                  value={prefs.skills} 
                  onChange={e => setPrefs({...prefs, skills: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g. React, TypeScript, Node.js"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Min Stipend (₹)</label>
                <input 
                  type="number"
                  value={prefs.minStipend} 
                  onChange={e => setPrefs({...prefs, minStipend: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Min Match Score (%)</label>
                <input 
                  type="number"
                  value={prefs.minMatchScore} 
                  onChange={e => setPrefs({...prefs, minMatchScore: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900">Safety & Filters</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Block Keywords</label>
                <input 
                  value={prefs.avoidKeywords} 
                  onChange={e => setPrefs({...prefs, avoidKeywords: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g. unpaid, registration fee"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Blocked Companies</label>
                <input 
                  value={prefs.blockedCompanies} 
                  onChange={e => setPrefs({...prefs, blockedCompanies: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="e.g. Scammers Inc."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <h3 className="font-bold">AutoPilot</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Engine Control</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={prefs.autopilotEnabled} 
                  onChange={e => setPrefs({...prefs, autopilotEnabled: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-12 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">
              When enabled, AutoPilot scans for jobs every 6 hours and applies autonomously to matches above your threshold.
            </p>
            <button 
              onClick={handleTriggerAutopilot}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Trigger Now
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-slate-900">Telegram Bot</h3>
              </div>
              {tg.hasConfig ? (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              ) : (
                <span className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              )}
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Bot Token</label>
                  <button onClick={() => setTg({...tg, showToken: !tg.showToken})} className="text-slate-300 hover:text-slate-500">
                    {tg.showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={tg.showToken ? "text" : "password"}
                    value={tg.botToken} 
                    onChange={e => setTg({...tg, botToken: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 outline-none"
                    placeholder={tg.hasConfig ? "••••••••••••••••••••" : "Enter Bot Token"} 
                  />
                  <Lock className="absolute right-4 top-3.5 w-4 h-4 text-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Chat ID</label>
                <input 
                  value={tg.chatId} 
                  onChange={e => setTg({...tg, chatId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 outline-none"
                  placeholder={tg.hasConfig ? "•••••••••" : "Enter Chat ID"} 
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveTelegram} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-2xl transition-all">
                  Save Bot
                </button>
                {tg.hasConfig && (
                  <button onClick={handleTestTelegram} disabled={testing} className="flex-1 border border-slate-200 hover:bg-slate-50 font-bold py-3 rounded-2xl flex items-center justify-center gap-2">
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4 text-blue-600" />}
                    Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
