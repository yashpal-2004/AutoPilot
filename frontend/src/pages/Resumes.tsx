import { useState, useEffect } from "react";
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Plus,
  ShieldCheck,
  BrainCircuit
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Resumes() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await axios.get("/api/resumes");
      setResumes(res.data);
    } catch (e) {
      toast.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      toast.info("Uploading and parsing resume with AI...");
      await axios.post("/api/resumes/upload", formData);
      toast.success("Resume processed successfully!");
      fetchResumes();
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await axios.patch(`/api/resumes/${id}`, { isDefault: true });
      toast.success("Default resume updated");
      fetchResumes();
    } catch (e) {
      toast.error("Failed to update default");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axios.delete(`/api/resumes/${id}`);
      toast.success("Resume deleted");
      fetchResumes();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mr-3" /> Analyzing your resumes...
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resumes</h1>
          <p className="text-slate-500 mt-1">Manage multiple versions of your profile for different roles.</p>
        </div>
        <div className="relative">
          <input 
            type="file" 
            id="resume-upload" 
            className="hidden" 
            accept=".pdf,.docx" 
            onChange={handleUpload}
            disabled={uploading}
          />
          <label 
            htmlFor="resume-upload"
            className={`cursor-pointer bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {uploading ? "Parsing..." : "Upload New"}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {resumes.map((resume) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white rounded-3xl border ${resume.isDefault ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'} shadow-sm overflow-hidden flex flex-col`}
            >
              <div className="p-8 pb-4">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${resume.isDefault ? 'bg-blue-600' : 'bg-slate-100'} flex items-center justify-center`}>
                    <FileText className={`w-6 h-6 ${resume.isDefault ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  {resume.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Default</span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg truncate mb-1">{resume.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3" /> {resume.roleCategory || 'Software Engineer'}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {(resume.skillsJson || []).slice(0, 4).map((skill: string) => (
                    <span key={skill} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                  {resume.skillsJson?.length > 4 && (
                    <span className="text-[10px] font-bold text-slate-400 px-2 py-1">+{resume.skillsJson.length - 4} more</span>
                  )}
                </div>
              </div>

              <div className="mt-auto px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {!resume.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(resume.id)}
                    className="text-sm font-bold text-blue-600 hover:underline"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {resumes.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
            <Upload className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Resumes Uploaded</h3>
          <p className="text-slate-500 max-w-sm mb-8">
            Upload your resume to start matching with jobs. Our AI will automatically extract your skills.
          </p>
          <label 
            htmlFor="resume-upload"
            className="cursor-pointer bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Upload Your First Resume
          </label>
        </div>
      )}
    </div>
  );
}
