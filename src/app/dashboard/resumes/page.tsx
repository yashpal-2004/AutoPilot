"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, FileText, CheckCircle2, Loader2, Trash2, Pencil } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (e) {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      toast.success("Resume uploaded and parsed successfully");
      setDialogOpen(false);
      setFile(null);
      fetchResumes();
    } catch (e: any) {
      toast.error(e.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const handleEditOpen = (resume: any) => {
    setEditingResume(resume);
    setEditName(resume.name || "");
    setEditRole(resume.roleCategory || "");
    setEditSkills(Array.isArray(resume.skillsJson) ? resume.skillsJson.join(", ") : "");
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResume) return;
    
    setSavingEdit(true);
    try {
      const skillsArray = editSkills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch(`/api/resumes/${editingResume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          roleCategory: editRole,
          skillsJson: skillsArray
        })
      });

      if (!res.ok) throw new Error("Failed to update");
      toast.success("Resume updated successfully");
      setEditDialogOpen(false);
      fetchResumes();
    } catch (e: any) {
      toast.error(e.message || "Failed to update resume");
    } finally {
      setSavingEdit(false);
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true })
      });
      if (res.ok) {
        toast.success("Default resume updated");
        fetchResumes();
      }
    } catch (e) {
      toast.error("Failed to update default resume");
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Resume deleted");
        fetchResumes();
      }
    } catch (e) {
      toast.error("Failed to delete resume");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Resume Manager" 
        description="Upload and manage your resumes to tailor applications."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button className="rounded-xl" />}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Resume
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload New Resume</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 mt-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="resume">Resume Document (PDF/DOCX)</Label>
                  <Input 
                    id="resume" 
                    type="file" 
                    accept=".pdf,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={!file || uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Upload & Parse"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group">
              <div className="absolute top-6 right-6 flex items-center gap-2">
                {resume.isDefault && (
                  <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Default
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button 
                    onClick={() => handleEditOpen(resume)}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                    title="Edit Details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!resume.isDefault && (
                    <button 
                      onClick={() => deleteResume(resume.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 mb-4 mt-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 truncate max-w-[200px]">{resume.name}</h3>
                  <p className="text-sm text-slate-500">{resume.roleCategory || "General Resume"}</p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {Array.isArray(resume.skillsJson) && resume.skillsJson.length > 0 ? resume.skillsJson.map((skill: string) => (
                  <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    {skill}
                  </span>
                )) : (
                  <span className="text-sm text-slate-400 italic">No specific skills detected</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="rounded-lg flex-1" onClick={() => window.open(resume.originalFileUrl, '_blank')}>View File</Button>
                {!resume.isDefault && (
                  <Button variant="outline" size="sm" className="rounded-lg flex-1" onClick={() => setAsDefault(resume.id)}>
                    Set Default
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No resumes uploaded" 
          description="Upload your first resume to start matching with relevant jobs."
          action={
            <Button className="rounded-xl mt-4" onClick={() => setDialogOpen(true)}>Upload Resume</Button>
          }
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Resume Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="editName">Resume Name</Label>
              <Input 
                id="editName" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Frontend_Resume.pdf"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="editRole">Role Category</Label>
              <Input 
                id="editRole" 
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="editSkills">Skills (comma separated)</Label>
              <Input 
                id="editSkills" 
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="React, TypeScript, Tailwind"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={savingEdit}>
              {savingEdit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
