"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Code2, Send, Timer, LogOut, Video, Activity, Download, Bot, User, PhoneOff } from "lucide-react";
import Editor from "@monaco-editor/react";

const ExpandableMessage = ({ text, isCode }: { text: string; isCode?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  if (isCode) {
    const lines = text.split('\n');
    const isLongCode = lines.length > 10 || text.length > 300;
    const displayText = (expanded || !isLongCode) ? text : lines.slice(0, 5).join('\n') + '\n...';
    
    return (
      <div className="text-sm w-full">
        <pre className="p-4 bg-background/50 rounded-xl overflow-x-auto font-data-mono text-[11px] border border-white/5 shadow-inner">
          <code>{displayText}</code>
        </pre>
        {isLongCode && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-primary mt-2 text-[11px] font-semibold hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="font-body-sm text-body-sm leading-relaxed w-full">
      <p className="whitespace-pre-wrap">
        {expanded || !isLong ? text : `${text.slice(0, 200)}...`}
      </p>
      {isLong && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-primary mt-2 text-[11px] font-semibold hover:underline inline-block"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; isCode?: boolean }[]>([]);
  
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode] = useState("// Write your solution here...\n");
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  // Initial Data Fetch & Greeting
  useEffect(() => {
    let isMounted = true;
    
    const initData = async () => {
      try {
        // Fetch Interview Data for Timer
        const intRes = await fetch(`/api/interviews/${id}`);
        
        if (intRes.ok) {
          const interviewData = await intRes.json();
          
          const duration = interviewData.duration || 10; // fallback to 10 mins
          const createdAtTime = interviewData.createdAt ? new Date(interviewData.createdAt).getTime() : Date.now();
          
          const durationMs = duration * 60 * 1000;
          const endTime = createdAtTime + durationMs;
          const now = Date.now();
          const remainingSecs = Math.max(0, Math.floor((endTime - now) / 1000));
          
          setTimeLeft(remainingSecs);
        } else {
          console.error("Failed to fetch interview:", await intRes.text());
          setTimeLeft(10 * 60); // fallback to 10 mins if error
        }

        // Greeting
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (!isMounted) return;

        const userName = session?.user?.name || "Candidate";
        const greeting = `Hello ${userName}, welcome to the interview. Please start the mic and respond with "I am ready" to start the interview.`;

        setMessages([{ role: "ai", text: greeting }]);

        const utterance = new SpeechSynthesisUtterance(greeting);
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };

    const timeout = setTimeout(() => { initData(); }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      window.speechSynthesis.cancel();
    };
  }, [id]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      endInterview();
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft]);

  const endInterview = () => {
    stopRecording();
    stopAudio();
    router.push(`/interview/${id}/feedback`);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
  };

  const startRecording = () => {
    stopAudio();
    setInterimText("");

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }
      setInterimText(currentInterim);
    };

    recognition.onend = async () => {
      setIsRecording(false);
      setInterimText("");
      if (finalTranscript.trim()) {
        await processText(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable (e.g. Monaco editor)
      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName?.toUpperCase();
        if (tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable) {
          return;
        }
        if (typeof active.className === "string" && active.className.toLowerCase().includes("monaco")) {
          return;
        }
      }
      
      if ((e.code === "Space" || e.key === " ") && !e.repeat) {
        e.preventDefault(); // Prevent page scroll
        if (!isProcessing) {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isRecording, isProcessing]);

  const submitCode = async () => {
    setShowCodeEditor(false);
    const codeSubmission = `[User submitted code]:\n\`\`\`javascript\n${code}\n\`\`\``;
    
    setMessages((prev) => [
      ...prev,
      { role: "user", text: code, isCode: true },
    ]);

    await processText(codeSubmission, true);
  };

  const processText = async (text: string, isCodeSubmission = false) => {
    setIsProcessing(true);
    try {
      const provider = localStorage.getItem("ai_interviewer_provider") || "google";
      const apiKey = localStorage.getItem("ai_interviewer_api_key") || "";

      if (!apiKey) {
        alert("Please configure your API key in Settings first.");
        setIsProcessing(false);
        return;
      }

      const response = await fetch(`/api/interviews/${id}/process-voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-provider": provider,
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to process text");
      }

      const data = await response.json();
      const userText = data.userText;
      const aiText = data.aiText;
      const requiresCoding = data.requiresCoding;

      if (aiText) {
        const utterance = new SpeechSynthesisUtterance(aiText);
        window.speechSynthesis.speak(utterance);
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        if (!isCodeSubmission && userText) {
          newMessages.push({ role: "user", text: userText });
        }
        if (aiText) {
          newMessages.push({ role: "ai", text: aiText });
        }
        return newMessages;
      });

      if (requiresCoding) {
        setShowCodeEditor(true);
      }

    } catch (error) {
      console.error("Processing error:", error);
      alert("There was an error processing your response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Interview Header */}
      <header className="h-20 flex-shrink-0 border-b border-white/5 bg-surface-container-low px-4 md:px-6 flex items-center justify-between z-10">
        {/* Brand & Status */}
        <div className="flex items-center gap-6">
          <div className="font-headline-lg text-xl md:text-2xl text-primary tracking-tighter font-bold">
            AURA AI
          </div>
          <div className="hidden md:block h-6 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></div>
            <span className="font-label-caps text-[10px] md:text-xs text-error tracking-widest uppercase font-medium">Session Live</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-on-surface-variant font-data-mono text-sm ml-4">
            <Timer className="w-4 h-4" />
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="md:hidden flex items-center gap-2 text-on-surface-variant font-data-mono text-xs mr-2">
            <Timer className="w-4 h-4" />
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </div>
          
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-primary text-on-primary animate-pulse shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-surface-container-high hover:bg-white/10 text-on-surface border border-white/5'}`}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>
          
          <button 
            onClick={endInterview}
            className="px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 transition-colors font-body-sm text-sm font-medium flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden md:inline">End Interview</span>
          </button>
        </div>
      </header>

      {/* Main Interview Canvas */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 min-h-0">
        
        {/* Left Column: Video/Code & Real-time Processing */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 min-w-0 h-[40vh] md:h-auto">
          {/* Main Visualizer or Code Editor */}
          {showCodeEditor ? (
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_30px_-5px_rgba(0,240,255,0.15)] bg-surface-container-highest">
              <div className="bg-surface-container-low px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-medium font-body-sm">
                  <Code2 className="w-4 h-4" /> Code Challenge
                </div>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              </div>
              <div className="bg-surface-container-low p-3 flex justify-end border-t border-white/5">
                <button 
                  onClick={submitCode}
                  className="px-6 py-2 bg-primary text-on-primary rounded-xl font-medium flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors"
                >
                  <Send className="w-4 h-4" /> Submit Code
                </button>
              </div>
            </div>
          ) : (
            <div className={`flex-1 relative rounded-2xl overflow-hidden bg-surface-container-highest border flex items-center justify-center shadow-[inset_0px_0px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ${isRecording ? 'border-primary/50 shadow-[0_0_30px_rgba(0,240,255,0.15)]' : isProcessing ? 'border-secondary/50 shadow-[0_0_30px_rgba(209,188,255,0.1)]' : 'border-white/5'}`}>
              
              {/* Atmospheric background */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none z-0"></div>
              
              {/* Status Display */}
              <div className="relative z-10 flex flex-col items-center gap-6">
                {isProcessing ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                      <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                    </div>
                    <p className="font-label-caps text-sm tracking-widest text-primary animate-pulse uppercase">Aura is thinking...</p>
                  </>
                ) : isRecording ? (
                  <>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse"></div>
                      <Mic className="w-8 h-8 text-primary relative z-10" />
                    </div>
                    <p className="font-label-caps text-sm tracking-widest text-primary animate-pulse uppercase">Listening...</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border border-white/10 opacity-70">
                      <Mic className="w-8 h-8 text-on-surface-variant" />
                    </div>
                    <p className="font-body-sm text-on-surface-variant">Click the mic or press Space to answer</p>
                  </>
                )}
              </div>

              {/* AI Name / Status Badge */}
              <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/5 flex items-center gap-3 z-20">
                <div className="relative flex items-center justify-center">
                  <div className={`absolute w-full h-full rounded-full blur-sm ${isProcessing ? 'bg-primary/50 animate-pulse' : 'bg-primary/20'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-primary' : 'bg-primary/50'}`}></div>
                </div>
                <span className="font-body-sm text-xs font-medium text-primary">Aura.1 (Active)</span>
              </div>

              {/* Audio Sensing Waveform Overlay (only when recording) */}
              {isRecording && (
                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent flex items-end justify-center pb-8 gap-1.5 z-10 pointer-events-none">
                  {[...Array(9)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-primary rounded-full animate-pulse" 
                      style={{ 
                        height: `${Math.random() * 40 + 10}px`, 
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.5s'
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live Processing Transcript (Glass Card) */}
          <div className="h-32 md:h-40 bg-surface-container-low/50 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col relative overflow-hidden group">
            {/* Luminous top border accent */}
            <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${isRecording ? 'via-primary/80' : 'via-primary/20'} to-transparent transition-colors duration-500`}></div>
            
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-on-surface-variant" />
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Real-time Analysis</span>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-data-mono text-[10px] text-primary/70">Listening</span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex-1 overflow-hidden relative">
              <p className="font-body-md text-sm md:text-base text-on-surface/90 leading-relaxed italic">
                {interimText || (isRecording ? "Listening..." : "Waiting for voice input...")}
              </p>
              {isRecording && <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse align-middle"></span>}
              <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-surface-container-low to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Right Column: Persistent Chat Transcript */}
        <aside className="w-full md:w-96 bg-surface-container-low/30 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col overflow-hidden h-[40vh] md:h-auto">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 bg-surface-container/50 flex items-center justify-between">
            <h2 className="font-body-md text-sm font-semibold text-on-surface">Session Transcript</h2>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          {/* Transcript List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col" ref={chatScrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
                <Activity className="w-8 h-8 mb-4 text-on-surface-variant" />
                <p className="font-body-sm text-sm text-on-surface-variant">Conversation transcript will appear here.</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1 w-11/12 ${msg.role === "user" ? "self-end items-end" : "self-start items-start"}`}>
                <div className={`flex items-center gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border text-[10px] ${
                    msg.role === "user" 
                      ? "bg-surface-container-high border-white/10 text-on-surface" 
                      : "bg-primary/20 border-primary/20 text-primary"
                  }`}>
                    {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
                    {msg.role === "user" ? "You" : "Aura"}
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl border font-body-sm text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-surface-container border-white/5 text-on-surface/90 rounded-tr-sm text-right" 
                    : "bg-surface-container-low border-white/5 text-on-surface rounded-tl-sm"
                }`}>
                  <ExpandableMessage text={msg.text} isCode={msg.isCode} />
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-center my-4 animate-in fade-in zoom-in duration-300">
                <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span className="font-data-mono text-[10px] text-primary uppercase tracking-widest">Analyzing response...</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
