import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = "Something went wrong", description = "An error occurred while loading the data.", onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-100 bg-red-50/50 min-h-[400px]", className)}>
      <div className="mb-4 text-red-500 bg-white p-4 rounded-full shadow-sm border border-red-100">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950 tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="rounded-xl">
          Try Again
        </Button>
      )}
    </div>
  );
}
