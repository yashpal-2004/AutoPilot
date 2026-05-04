import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">ApplyPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-xl">Open Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-950 mb-6">
            Automate your applications <br className="hidden md:block"/> with AI.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
            Upload resumes, set daily targets, and let ApplyPilot prepare and submit relevant applications safely. Never miss an opportunity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-xl h-12 px-8 text-base group">
                Start Applying Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-xl h-12 px-8 text-base">
              See How it Works
            </Button>
          </div>
        </section>

        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Discovery</h3>
                <p className="text-slate-500">Automatically find relevant jobs based on your skills, preferences, and minimum match score.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Tailored Answers</h3>
                <p className="text-slate-500">Generate truthful, accurate application answers strictly based on your uploaded resume.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Safe Autopilot</h3>
                <p className="text-slate-500">Built-in protections against spam, captchas, and unusual questions to keep your account safe.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ApplyPilot. All rights reserved.</p>
      </footer>
    </div>
  );
}
