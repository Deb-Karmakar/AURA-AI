"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import MobileHamburgerMenu from "@/components/ui/MobileHamburgerMenu";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, Video, Settings as SettingsIcon, PlusCircle, HelpCircle, LogOut, 
  BarChart3, Key, Lock, Sparkles, BrainCircuit, Bot, CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [openAIEnabled, setOpenAIEnabled] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [claudeEnabled, setClaudeEnabled] = useState(false);

  const [openAIKey, setOpenAIKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Load from local storage on mount
    const storedOpenAIEnabled = localStorage.getItem("aura_openai_enabled") === "true";
    const storedGeminiEnabled = localStorage.getItem("aura_gemini_enabled") === "true";
    const storedClaudeEnabled = localStorage.getItem("aura_claude_enabled") === "true";
    
    setOpenAIEnabled(storedOpenAIEnabled);
    setGeminiEnabled(storedGeminiEnabled);
    setClaudeEnabled(storedClaudeEnabled);

    setOpenAIKey(localStorage.getItem("aura_openai_key") || "");
    setGeminiKey(localStorage.getItem("aura_gemini_key") || "");
    setClaudeKey(localStorage.getItem("aura_claude_key") || "");

    // Fetch session for sidebar
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSession(data);
        }
      })
      .catch(err => console.error("Failed to fetch session", err));
  }, []);

  const handleSave = () => {
    localStorage.setItem("aura_openai_enabled", openAIEnabled.toString());
    localStorage.setItem("aura_gemini_enabled", geminiEnabled.toString());
    localStorage.setItem("aura_claude_enabled", claudeEnabled.toString());

    localStorage.setItem("aura_openai_key", openAIKey);
    localStorage.setItem("aura_gemini_key", geminiKey);
    localStorage.setItem("aura_claude_key", claudeKey);

    // Set the primary provider for the API requests based on what is enabled
    // This is used by the feedback evaluation logic
    let primaryProvider = "";
    let primaryKey = "";
    
    if (geminiEnabled && geminiKey) {
      primaryProvider = "google";
      primaryKey = geminiKey;
    } else if (openAIEnabled && openAIKey) {
      primaryProvider = "openai";
      primaryKey = openAIKey;
    } else if (claudeEnabled && claudeKey) {
      primaryProvider = "anthropic";
      primaryKey = claudeKey;
    }
    
    if (primaryProvider && primaryKey) {
      localStorage.setItem("ai_interviewer_provider", primaryProvider);
      localStorage.setItem("ai_interviewer_api_key", primaryKey);
    } else {
      localStorage.removeItem("ai_interviewer_provider");
      localStorage.removeItem("ai_interviewer_api_key");
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDiscard = () => {
    // Reset to local storage values
    setOpenAIEnabled(localStorage.getItem("aura_openai_enabled") === "true");
    setGeminiEnabled(localStorage.getItem("aura_gemini_enabled") === "true");
    setClaudeEnabled(localStorage.getItem("aura_claude_enabled") === "true");

    setOpenAIKey(localStorage.getItem("aura_openai_key") || "");
    setGeminiKey(localStorage.getItem("aura_gemini_key") || "");
    setClaudeKey(localStorage.getItem("aura_claude_key") || "");
  };

  return (
    <div className="font-body-md text-body-md bg-[#050505] antialiased overflow-x-hidden min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[150px] z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-container/10 blur-[150px] z-0 pointer-events-none"></div>
      
      {/* Mobile Top Header Fallback */}
      <header className="md:hidden flex justify-between items-center p-4 w-full fixed top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
        <Logo className="text-2xl" />
        <MobileHamburgerMenu />
      </header>

      {/* SideNavBar (Desktop Only) */}
      <nav className="hidden md:flex flex-col h-screen py-8 bg-surface-container-lowest w-64 fixed left-0 top-0 border-r border-white/5 z-40">
        <div className="px-8 mb-8">
          <Logo className="text-3xl" />
        </div>
        
        {/* User Profile Header */}
        <div className="px-8 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-surface-container flex items-center justify-center text-primary font-bold text-xl">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-body-md text-body-md font-semibold text-on-surface line-clamp-1">{session?.user?.name || "Loading..."}</div>
          </div>
        </div>
        
        <ul className="flex-1 flex flex-col gap-1 mt-4">
          <li>
            <Link href="/" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/interviews" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Interviews</span>
            </Link>
          </li>
          <li>
            <Link href="/analytics" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Analytics</span>
            </Link>
          </li>
          <li className="bg-secondary/20 text-primary border-r-4 border-primary rounded-r-xl py-3 px-8 flex items-center gap-4 cursor-pointer scale-[0.98] transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="font-body-md text-body-md font-medium relative z-10">Settings</span>
          </li>
        </ul>
        
        <div className="px-8 mb-6 mt-auto">
          <Link href="/setup/topic" className="w-full py-3 px-4 bg-primary/10 text-primary border border-primary/30 rounded-xl font-body-md text-body-md font-medium flex items-center justify-center gap-2 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0px_0px_15px_rgba(219,252,255,0.2)] transition-all duration-300 group">
            Start Practice
          </Link>
        </div>
        
        <div className="px-8 border-t border-white/5 pt-6 flex flex-col gap-4">

          <button onClick={() => signOut()} className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-3 cursor-pointer w-full text-left">
            <span className="font-body-sm text-sm">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 h-screen overflow-y-auto ml-0 md:ml-64 pt-20 pb-8 px-4 md:pt-16 md:px-10 relative z-10 w-full">
        <div className="max-w-4xl mx-auto">
          
          <header className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface tracking-tight mb-4 font-bold">Bring Your Own Key (BYOK)</h1>
            <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
              Configure and manage your API connections to cutting-edge AI models. Your keys are encrypted locally with zero server-side persistence, ensuring enterprise-grade security for your recruitment data stream.
            </p>
          </header>

          <form className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            
            {/* OpenAI Card */}
            <div className={`bg-surface-container/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${openAIEnabled ? 'opacity-100 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-primary/30' : 'opacity-70'}`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-[100%] ${openAIEnabled ? 'hover:translate-x-[100%]' : ''} transition-transform duration-1000`}></div>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <Bot className="w-7 h-7 text-on-surface" />
                  </div>
                  <div>
                    <h3 className="font-headline-lg-mobile text-2xl font-bold text-on-surface mb-1">OpenAI</h3>
                    <p className="text-on-surface-variant text-sm mb-4">GPT-4 Turbo &amp; Embedding Models</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2 py-0.5 rounded bg-surface border border-white/10 text-on-surface-variant font-label-caps text-[10px] font-bold tracking-widest">DEFAULT MODEL</span>
                    </div>
                  </div>
                </div>
                
                {/* Toggle */}
                <div className="relative flex items-center">
                  <span className="mr-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-medium">Enable</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={openAIEnabled} onChange={(e) => setOpenAIEnabled(e.target.checked)} />
                    <div className="w-12 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-variant after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container/40 peer-checked:after:bg-primary peer-checked:border-primary/50 border border-white/10 peer-checked:shadow-[0_0_10px_rgba(0,219,233,0.3)]"></div>
                  </label>
                </div>
              </div>

              <div className={`mt-8 relative z-10 transition-opacity duration-300 ${openAIEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="block font-label-caps text-[11px] text-on-surface-variant mb-2 font-bold tracking-widest">API KEY</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant/50">
                    <Key className="w-5 h-5" />
                  </span>
                  <input 
                    type="password" 
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-on-surface font-data-mono text-sm tracking-wider focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder-on-surface-variant/30"
                    placeholder="sk-proj-..."
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {openAIKey ? (
                    <span className="text-sm text-primary/80 flex items-center gap-1.5 font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      Key configured locally
                    </span>
                  ) : (
                    <span></span>
                  )}
                  <Link href="https://platform.openai.com/api-keys" target="_blank" className="text-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-white/20 underline-offset-4">Get API Key</Link>
                </div>
              </div>
            </div>

            {/* Gemini Card */}
            <div className={`bg-surface-container/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${geminiEnabled ? 'opacity-100 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-primary/30' : 'opacity-70'}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-headline-lg-mobile text-2xl font-bold text-on-surface mb-1">Google Gemini</h3>
                    <p className="text-on-surface-variant text-sm mb-4">Gemini 1.5 Latest</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2 py-0.5 rounded bg-surface border border-white/10 text-on-surface-variant font-label-caps text-[10px] font-bold tracking-widest">VIDEO ANALYSIS</span>
                    </div>
                  </div>
                </div>
                
                {/* Toggle */}
                <div className="relative flex items-center">
                  <span className="mr-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-medium">Enable</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={geminiEnabled} onChange={(e) => setGeminiEnabled(e.target.checked)} />
                    <div className="w-12 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-variant after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container/40 peer-checked:after:bg-primary peer-checked:border-primary/50 border border-white/10 peer-checked:shadow-[0_0_10px_rgba(0,219,233,0.3)]"></div>
                  </label>
                </div>
              </div>

              <div className={`mt-8 relative z-10 transition-opacity duration-300 ${geminiEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="block font-label-caps text-[11px] text-on-surface-variant mb-2 font-bold tracking-widest">API KEY</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant/50">
                    <Key className="w-5 h-5" />
                  </span>
                  <input 
                    type="password" 
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-on-surface font-data-mono text-sm tracking-wider focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder-on-surface-variant/30"
                    placeholder="AIzaSy..."
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {geminiKey ? (
                    <span className="text-sm text-primary/80 flex items-center gap-1.5 font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      Key configured locally
                    </span>
                  ) : (
                    <span></span>
                  )}
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" className="text-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-white/20 underline-offset-4">Get API Key</Link>
                </div>
              </div>
            </div>

            {/* Claude Card */}
            <div className={`bg-surface-container/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${claudeEnabled ? 'opacity-100 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-primary/30' : 'opacity-70'}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-7 h-7 text-[#849495]" />
                  </div>
                  <div>
                    <h3 className="font-headline-lg-mobile text-2xl font-bold text-on-surface mb-1">Anthropic Claude</h3>
                    <p className="text-on-surface-variant text-sm mb-4">Claude 3 Opus &amp; Sonnet</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2 py-0.5 rounded bg-surface border border-white/10 text-on-surface-variant font-label-caps text-[10px] font-bold tracking-widest">DOCUMENT PARSING</span>
                    </div>
                  </div>
                </div>
                
                {/* Toggle */}
                <div className="relative flex items-center">
                  <span className="mr-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-medium">Enable</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={claudeEnabled} onChange={(e) => setClaudeEnabled(e.target.checked)} />
                    <div className="w-12 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-variant after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container/40 peer-checked:after:bg-primary peer-checked:border-primary/50 border border-white/10 peer-checked:shadow-[0_0_10px_rgba(0,219,233,0.3)]"></div>
                  </label>
                </div>
              </div>

              <div className={`mt-8 relative z-10 transition-opacity duration-300 ${claudeEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="block font-label-caps text-[11px] text-on-surface-variant mb-2 font-bold tracking-widest">API KEY</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant/50">
                    <Key className="w-5 h-5" />
                  </span>
                  <input 
                    type="password" 
                    value={claudeKey}
                    onChange={(e) => setClaudeKey(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-on-surface font-data-mono text-sm tracking-wider focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder-on-surface-variant/30"
                    placeholder="sk-ant-..."
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {claudeKey ? (
                    <span className="text-sm text-primary/80 flex items-center gap-1.5 font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      Key configured locally
                    </span>
                  ) : (
                    <span></span>
                  )}
                  <Link href="https://console.anthropic.com/settings/keys" target="_blank" className="text-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-white/20 underline-offset-4">Get API Key</Link>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-white/5 mt-10">
              <button type="button" onClick={handleDiscard} className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-on-surface hover:bg-white/5 transition-colors">
                Discard Changes
              </button>
              <button type="submit" className={`w-full sm:w-auto px-8 py-3 rounded-xl ${isSaved ? 'bg-green-500/20 text-green-400' : 'bg-primary text-on-primary'} font-medium flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,219,233,0.2)] hover:shadow-[0_0_25px_rgba(0,219,233,0.4)] hover:-translate-y-px transition-all`}>
                {isSaved ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {isSaved ? "Saved!" : "Save Configuration"}
              </button>
            </div>
          </form>
          
        </div>
      </main>
    </div>
  );
}
