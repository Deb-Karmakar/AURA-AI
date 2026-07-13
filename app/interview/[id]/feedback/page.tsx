"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle, Code2, MessageSquare, BrainCircuit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interview, setInterview] = useState<any>(null);
  const [candidateName, setCandidateName] = useState<string>("Candidate");

  useEffect(() => {
    let isMounted = true;
    
    const evaluateInterview = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (isMounted && session?.user?.name) {
          setCandidateName(session.user.name);
        }

        const provider = localStorage.getItem("ai_interviewer_provider") || "google";
        const apiKey = localStorage.getItem("ai_interviewer_api_key") || "";

        if (!apiKey) {
          setError("API Key missing. Cannot evaluate interview.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/interviews/${id}/evaluate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-ai-provider": provider,
            "x-api-key": apiKey,
          },
        });

        const data = await res.json();
        
        if (!isMounted) return;

        if (!res.ok) {
          // It could be the insufficient data error
          setError(data.error || "Failed to evaluate interview");
          setInterview(data.interview || null);
        } else {
          setInterview(data);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Something went wrong.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    evaluateInterview();

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>
          <h1 className="font-display-lg text-3xl font-bold tracking-tight text-on-surface">Evaluating Interview...</h1>
          <p className="font-label-caps text-xs tracking-widest text-primary animate-pulse uppercase">Aura is analyzing your transcript</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_15px_rgba(0,219,233,0.1)]">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
          <div className="font-headline-lg text-xl md:text-2xl font-bold text-primary tracking-tighter">
            AURA AI
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-body-sm text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-24 px-4 md:px-10 max-w-7xl mx-auto w-full z-10 relative flex flex-col gap-12">
        {error && !interview?.score ? (
          <div className="bg-error-container/20 border border-error/20 rounded-2xl p-12 flex flex-col items-center text-center backdrop-blur-md">
            <AlertCircle className="w-16 h-16 text-error mb-4" />
            <h2 className="font-headline-lg text-3xl font-bold mb-2 text-on-surface">Evaluation Skipped</h2>
            <p className="font-body-md text-on-surface-variant max-w-md">{error}</p>
            <button 
              onClick={() => router.push("/")}
              className="mt-8 px-8 py-3 rounded-xl bg-surface-container-high border border-white/10 text-on-surface font-medium hover:bg-surface-bright transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex flex-col gap-2">
              <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface tracking-tight font-bold">Interview Analysis Report</h1>
              <p className="font-data-mono text-xs md:text-sm text-on-surface-variant uppercase">
                Session ID: <span className="text-primary-fixed-dim">#{id.slice(-6).toUpperCase()}</span> • Candidate: {candidateName}
              </p>
            </header>

            {/* Bento Grid Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Hero Score Card */}
              <div className="lg:col-span-4 bg-surface-container-low/50 backdrop-blur-xl border border-white/5 border-t-white/10 border-b-black/50 border-r-black/50 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 className="font-label-caps text-xs text-on-surface-variant mb-6 uppercase tracking-widest w-full text-left">Overall Match Score</h2>
                
                {/* Circular Progress SVG */}
                <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="45" stroke="#1c1b1b" strokeWidth="8"></circle>
                    <circle 
                      className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all duration-1000 ease-out" 
                      cx="50" cy="50" fill="none" r="45" stroke="#00f0ff" strokeWidth="8"
                      strokeDasharray="283" 
                      strokeDashoffset={283 - (283 * (interview.score || 0)) / 100}
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-display-lg text-6xl text-primary text-glow leading-none drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">{interview.score || 0}</span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant mt-1">/ 100</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-primary-container/10 px-4 py-2 rounded-full border border-primary-container/20">
                  <CheckCircle2 className="w-4 h-4 text-primary-container" />
                  <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest font-bold">
                    {interview.score >= 80 ? 'High Viability' : interview.score >= 60 ? 'Moderate Viability' : 'Low Viability'}
                  </span>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="lg:col-span-8 bg-surface-container-low/50 backdrop-blur-xl border border-white/5 border-t-white/10 border-b-black/50 border-r-black/50 rounded-2xl p-8 flex flex-col gap-6">
                <h2 className="font-headline-lg text-2xl text-on-surface border-b border-white/5 pb-4 font-semibold">Performance Summary</h2>
                <div className="flex-grow font-body-md text-on-surface-variant leading-relaxed">
                  {interview.overallFeedback || "No overall feedback provided."}
                </div>
              </div>
            </div>

            {/* Detailed Q&A Breakdown */}
            {interview.detailedFeedback && interview.detailedFeedback.length > 0 && (
              <section className="flex flex-col gap-6 w-full mt-8">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <h2 className="font-headline-lg text-3xl text-on-surface font-semibold">Detailed Transcript Analysis</h2>
                  <span className="font-label-caps text-[10px] text-surface-tint uppercase tracking-widest hidden md:block border border-surface-tint/30 bg-surface-tint/10 px-3 py-1 rounded">AI Model Evaluation active</span>
                </div>
                
                <div className="flex flex-col gap-6">
                  {interview.detailedFeedback.map((fb: any, idx: number) => (
                    <div key={idx} className="bg-surface-container-low/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border-l-4 border-l-surface-tint border-y border-r border-white/5 flex flex-col gap-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-surface-tint/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-surface-tint/10 transition-colors"></div>
                      
                      <div className="flex flex-col gap-2 relative z-10">
                        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Question {(idx + 1).toString().padStart(2, '0')}</span>
                        <h3 className="font-body-md text-lg md:text-xl text-on-surface font-semibold">{fb.question}</h3>
                      </div>
                      
                      <div className="bg-surface-container-low/80 p-5 rounded-xl border border-white/5 relative z-10">
                        <span className="font-label-caps text-[10px] text-outline uppercase tracking-widest font-bold block mb-3">Candidate Response Summary</span>
                        <p className="font-body-sm text-sm text-on-surface/80 italic leading-relaxed whitespace-pre-wrap">"{fb.answer}"</p>
                      </div>
                      
                      <div className="bg-primary-container/10 p-5 rounded-xl border border-primary-container/20 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <BrainCircuit className="w-4 h-4 text-surface-tint" />
                          <span className="font-label-caps text-[10px] text-surface-tint uppercase tracking-widest font-bold">AURA AI Assessment</span>
                        </div>
                        <p className="font-body-sm text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                          {fb.improvement}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-end items-center gap-4 mt-8 pt-8 border-t border-white/5">
              <button 
                onClick={() => router.push("/setup/topic")}
                className="w-full md:w-auto px-6 py-3 rounded-xl border border-outline-variant text-on-surface font-body-sm text-sm hover:bg-surface-container-high transition-colors font-medium"
              >
                Schedule Retake
              </button>
              <button 
                onClick={() => router.push("/")}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-surface-tint text-on-primary-container font-body-sm text-sm font-bold hover:bg-primary-container transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
              >
                Back to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-background border-t border-white/5 relative z-10 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10 max-w-7xl mx-auto gap-6">
          <div className="font-headline-lg text-xl font-bold text-primary">AURA AI</div>
          <div className="font-body-sm text-sm text-on-surface-variant text-center md:text-left">
            © 2024 AURA AI recruitment. Precision driven.
          </div>
          <div className="flex gap-6 font-body-sm text-sm">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
