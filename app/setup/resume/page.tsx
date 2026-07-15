"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Code2, UploadCloud, X, FileText, Key } from "lucide-react";

export default function ResumeSetupPage() {
  const [role, setRole] = useState("");
  const [showKeyAlert, setShowKeyAlert] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [includeCodingRound, setIncludeCodingRound] = useState(false);
  const [duration, setDuration] = useState<5 | 10 | 30>(10);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const key = localStorage.getItem("ai_interviewer_api_key");
    if (!key) {
      setShowKeyAlert(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("interviewType", "resume");
      formData.append("role", role);
      formData.append("resumeFile", file);
      formData.append("includeCodingRound", includeCodingRound ? "true" : "false");
      formData.append("duration", duration.toString());

      const res = await fetch("/api/interviews", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      } else {
        throw new Error(data.error || "Failed to create interview");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload resume. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container relative">
      {showKeyAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-headline-lg text-2xl font-bold text-on-surface text-center mb-3">API Key Required</h3>
            <p className="font-body-md text-on-surface-variant text-center mb-8">
              You need to configure your BYOK (Bring Your Own Key) settings with OpenAI, Gemini, or Claude before starting an interview.
            </p>
            <div className="flex gap-4 font-body-md">
              <button 
                type="button"
                onClick={() => router.push("/")} 
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-on-surface hover:bg-white/5 transition-colors font-medium"
              >
                Go Back
              </button>
              <button 
                type="button"
                onClick={() => router.push("/settings")} 
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors font-medium shadow-[0_0_15px_rgba(0,219,233,0.2)]"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_15px_rgba(0,219,233,0.1)]">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
          <div className="font-headline-lg text-xl md:text-2xl font-bold text-primary tracking-tighter">
            AURA AI
          </div>
          <button onClick={() => router.push("/")} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-body-sm text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-24 px-4 md:px-10 max-w-7xl mx-auto w-full z-10 relative flex flex-col items-center">
        
        <div className="w-full max-w-2xl bg-surface-container-low/50 backdrop-blur-xl border border-white/5 border-t-white/10 border-b-black/50 border-r-black/50 rounded-2xl p-8 md:p-12">
          
          <div className="text-center mb-10">
            <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-bold tracking-tight mb-4">Resume Interview Setup</h1>
            <p className="font-body-md text-on-surface-variant">Upload your resume to simulate a realistic experience tailored to your background.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            
            {/* Target Role Input */}
            <div className="flex flex-col gap-3">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-bold">Target Role</label>
              <input
                type="text"
                placeholder="e.g., Senior Full-Stack Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-surface-container h-14 px-4 rounded-xl border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-on-surface font-body-sm transition-all"
                required
              />
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col gap-3">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-bold">Resume (PDF)</label>
              
              {!file ? (
                <div 
                  className="w-full border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-surface-container/30 hover:bg-surface-container/50 hover:border-primary/30 transition-all cursor-pointer relative group"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-16 h-16 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <UploadCloud className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-body-md text-on-surface font-medium mb-1 group-hover:text-primary transition-colors">Click to upload or drag and drop</p>
                    <p className="font-body-sm text-on-surface-variant text-sm">PDF (max. 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-surface-container/50 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-on-surface font-medium truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                      <span className="font-data-mono text-xs text-primary mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Duration Selector */}
            <div className="flex flex-col gap-3">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-bold">Duration</label>
              <div className="flex p-1 bg-surface-container rounded-xl border border-white/5">
                {([5, 10, 30] as const).map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`flex-1 py-3 rounded-lg font-body-sm text-sm font-medium transition-all ${
                      duration === mins 
                        ? 'bg-surface-tint text-on-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                        : 'text-on-surface hover:bg-white/5'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Coding Round Toggle */}
            <label className="flex items-start gap-4 p-5 border border-white/10 rounded-xl cursor-pointer hover:bg-surface-container/50 transition-colors bg-surface-container/30 group">
              <div className="mt-1 relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={includeCodingRound}
                  onChange={(e) => setIncludeCodingRound(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-on-surface-variant rounded flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-colors">
                  {includeCodingRound && <X className="w-3 h-3 text-on-primary rotate-45 scale-150" />} 
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-body-md text-on-surface font-semibold">Include Coding Challenge</span>
                  <Code2 className="w-4 h-4 text-primary opacity-80" />
                </div>
                <span className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                  Aura AI will provide an in-browser code editor and evaluate your live coding skills during the interview.
                </span>
              </div>
            </label>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!role.trim() || !file || loading}
              className={`w-full py-4 rounded-xl font-body-md font-bold transition-all flex items-center justify-center gap-2 mt-4 ${
                (!role.trim() || !file) 
                  ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-50'
                  : 'bg-surface-tint text-on-primary-container hover:bg-primary-container shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing Session...
                </>
              ) : (
                "Commence Interview Session"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
