import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 min-h-[400px]", className)}>
      <div className="mb-4 text-slate-400 bg-white p-4 rounded-full shadow-sm border border-slate-100">
        {icon || <FileQuestion className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-950 tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
