import { PageHeader } from "@/components/ui/page-header";

export default function RepliesPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Replies" 
        description="Track responses from companies."
      />
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">No replies received yet.</p>
      </div>
    </div>
  );
}
