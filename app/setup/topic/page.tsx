"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowLeft, Loader2, Code2, Key } from "lucide-react";

export default function TopicSetupPage() {
  const [currentTag, setCurrentTag] = useState("");
  const [showKeyAlert, setShowKeyAlert] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
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

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tags.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          interviewType: "topic", 
          topic: tags.join(", "),
          difficulty,
          includeCodingRound,
          duration
        }),
      });
      const data = await res.json();
      if (data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      }
    } catch (error) {
      console.error(error);
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
            <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-bold tracking-tight mb-4">Topic Interview Setup</h1>
            <p className="font-body-md text-on-surface-variant">Configure the parameters for your technical interview session.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            
            {/* Tag Input */}
            <div className="flex flex-col gap-3">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-bold">Topics & Technologies</label>
              <div className="flex gap-2 h-14">
                <input
                  type="text"
                  placeholder="e.g., React, System Design, Data Structures..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-surface-container h-full px-4 rounded-xl border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-on-surface font-body-sm transition-all"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={handleAddTag} 
                  className="h-full px-6 bg-surface-container-high border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center text-on-surface"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 border border-white/5 rounded-xl bg-surface-container/30">
                {tags.length === 0 && <span className="text-sm text-on-surface-variant/50 italic flex items-center h-full px-2">No topics added yet. Add at least one to continue.</span>}
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary-fixed transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty & Duration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Difficulty Selector */}
              <div className="flex flex-col gap-3">
                <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-bold">Difficulty Level</label>
                <div className="flex p-1 bg-surface-container rounded-xl border border-white/5">
                  {(["Easy", "Medium", "Hard"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-2.5 rounded-lg font-body-sm text-sm font-medium transition-all ${
                        difficulty === lvl 
                          ? 'bg-surface-tint text-on-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                          : 'text-on-surface hover:bg-white/5'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
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
                      className={`flex-1 py-2.5 rounded-lg font-body-sm text-sm font-medium transition-all ${
                        duration === mins 
                          ? 'bg-surface-tint text-on-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                          : 'text-on-surface hover:bg-white/5'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
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
              disabled={tags.length === 0 || loading}
              className={`w-full py-4 rounded-xl font-body-md font-bold transition-all flex items-center justify-center gap-2 mt-4 ${
                tags.length === 0 
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
