import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  text?: string;
  className?: string;
}

export function LoadingState({ text = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] p-8", className)}>
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
