"use client";

import { Bell, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon" className="-ml-2 text-slate-500">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Search applications..." 
            className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="text-slate-500 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
      </div>
    </header>
  );
}
