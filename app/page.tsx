import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { auth, signIn, signOut } from "@/auth";
import connectToDatabase from "@/lib/db/mongodb";
import Interview from "@/lib/db/models/Interview";
import { 
  PlayCircle, Activity, Briefcase, BarChart3, ArrowRight, CheckCircle2, 
  LayoutDashboard, Video, Settings, PlusCircle, HelpCircle, LogOut, 
  BrainCircuit, TrendingUp, Calendar, Clock, Rocket 
} from "lucide-react";
import DarkVeil from "@/components/ui/DarkVeil";
import { Instrument_Serif } from "next/font/google";
import MobileHamburgerMenu from "@/components/ui/MobileHamburgerMenu";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], display: "swap" });

export default async function Home() {
  const session = await auth();

  if (session) {
    await connectToDatabase();
    const interviewsRaw = await Interview.find({ userId: session.user?.id }).sort({ createdAt: -1 }).lean();
    const interviews = interviewsRaw.map(int => ({
      _id: int._id.toString(),
      interviewType: int.interviewType,
      topic: int.topic,
      role: int.role,
      status: int.status,
      score: int.score,
      createdAt: int.createdAt.toISOString()
    }));

    return (
      <div className="font-body-md text-body-md bg-surface-container-lowest antialiased overflow-x-hidden min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
        
        {/* Background Gradients */}
        <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none z-0"></div>
        
        {/* Mobile Top Header Fallback */}
        <header className="md:hidden flex justify-between items-center p-4 w-full fixed top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
          <Logo className="text-2xl" />
          <MobileHamburgerMenu />
        </header>

        {/* SideNavBar (Desktop Only) */}
        <nav className="hidden md:flex flex-col h-screen py-8 bg-surface-container-lowest w-64 fixed left-0 top-0 border-r border-white/5 z-40">
          {/* Brand */}
          <div className="px-8 mb-8">
            <Logo className="text-3xl" />
          </div>
          
          {/* User Profile Header */}
          <div className="px-8 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-surface-container flex items-center justify-center text-primary font-bold text-xl">
              {session.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-body-md text-body-md font-semibold text-on-surface line-clamp-1">{session.user?.name}</div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <ul className="flex-1 flex flex-col gap-1 mt-4">
            <li>
              <Link href="/" className="bg-secondary/20 text-primary border-r-4 border-primary rounded-r-xl py-3 px-8 flex items-center gap-4 cursor-pointer scale-[0.98] transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="font-body-md text-body-md font-medium relative z-10">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/interviews" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 cursor-pointer group rounded-r-xl">
                <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Interviews</span>
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 cursor-pointer group rounded-r-xl">
                <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Analytics</span>
              </Link>
            </li>
            <li>
              <Link href="/settings" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 cursor-pointer group rounded-r-xl">
                <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Settings</span>
              </Link>
            </li>
          </ul>
          
          {/* Primary CTA */}
          <div className="px-8 mb-6 mt-auto">
            <Link href="/setup/topic" className="w-full py-3 px-4 bg-primary/10 text-primary border border-primary/30 rounded-xl font-body-md text-body-md font-medium flex items-center justify-center gap-2 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0px_0px_15px_rgba(219,252,255,0.2)] transition-all duration-300 group">
              
              Start Practice
            </Link>
          </div>
          
          {/* Footer Links */}
          <div className="px-8 border-t border-white/5 pt-6 flex flex-col gap-4">

            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="w-full">
              <button type="submit" className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-3 cursor-pointer w-full text-left">
                
                <span className="font-body-sm text-sm">Logout</span>
              </button>
            </form>
          </div>
        </nav>

        {/* Main Content Canvas */}
        <main className="flex-1 h-screen overflow-y-auto ml-0 md:ml-64 pt-20 pb-8 px-4 md:pt-16 md:px-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            
            {/* Dashboard Header */}
            <header className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className={`font-headline-lg text-4xl md:text-5xl text-on-surface font-bold tracking-tight`}>
                Welcome back, <span className="text-primary">{session.user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="font-body-md text-lg text-on-surface-variant mt-2 max-w-2xl">
                Ready to crush your next interview? Review your past performances or start a new mock interview session now.
              </p>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Hero Action Card */}
              <Link href="/setup/topic" className="lg:col-span-8 bg-surface-container/60 backdrop-blur-2xl rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/5 hover:border-white/10 flex flex-col justify-between group transition-all">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 transition-all duration-700 group-hover:bg-primary/20"></div>
                <div className="relative z-10 max-w-md">
                  
                  <h2 className={`font-headline-lg text-3xl text-on-surface mb-3 font-semibold`}>Initiate AI Simulation</h2>
                  <p className="font-body-md text-on-surface-variant mb-8">
                    Configure a high-stress scenario tailored to your upcoming roles. The neural engine is primed for technical deep-dives.
                  </p>
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary-fixed-dim hover:shadow-[0_0_25px_rgba(219,252,255,0.4)] transition-all duration-300 transform group-hover:-translate-y-0.5">
                    
                    Start Topic Interview
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 pointer-events-none hidden md:block">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_left,black,transparent)]"></div>
                </div>
              </Link>

              {/* Resume Interview Card */}
              <Link href="/setup/resume" className="lg:col-span-4 bg-surface-container-high/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-white/10 flex flex-col items-center justify-center text-center group transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 w-full flex flex-col items-center">
                  
                  <h3 className={`font-headline-lg text-2xl text-on-surface font-semibold mb-3`}>Resume Based</h3>
                  <p className="font-body-md text-on-surface-variant mb-8 text-sm">
                    Upload your resume for a highly tailored mock interview specific to your experience.
                  </p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container border border-white/10 text-on-surface rounded-xl font-medium hover:text-primary hover:border-primary/50 transition-colors w-full justify-center">
                    Upload Resume <span className="font-data-mono ml-2">-&gt;</span>
                  </div>
                </div>
              </Link>

              {/* Upcoming / Past Interviews Section */}
              <div className="lg:col-span-12 bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-8 border border-white/5 mt-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`font-headline-lg text-2xl text-on-surface font-semibold`}>Your Past Interviews</h3>
                  <Link href="/interviews" className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors flex items-center gap-1">
                    View All <span className="font-data-mono ml-2">-&gt;</span>
                  </Link>
                </div>
                
                {interviews.length === 0 ? (
                  <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center bg-surface-container/20">
                    
                    <p className="text-on-surface-variant text-lg">No interviews found. Start your first session above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {interviews.slice(0, 4).map((int: any) => (
                      <Link 
                        key={int._id}
                        href={int.status === "completed" ? `/interview/${int._id}/feedback` : `/interview/${int._id}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-surface/50 border border-white/5 hover:border-white/10 hover:bg-surface-bright/30 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start sm:items-center gap-5">
                          
                          <div>
                            <h4 className="font-body-md text-lg font-semibold text-on-surface line-clamp-1">{int.interviewType === "topic" ? int.topic : int.role}</h4>
                            <div className="flex items-center gap-3 mt-1 font-data-mono text-xs text-on-surface-variant">
                              <span className="flex items-center gap-1"> {new Date(int.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20"></span>
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary/80">{int.interviewType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center gap-4 pl-17 sm:pl-0">
                          {int.status === "completed" ? (
                            int.score !== undefined ? (
                              <>
                                <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-widest font-bold border border-emerald-500/20">Completed</span>
                                <span className={`font-headline-lg text-2xl font-bold text-primary ml-2`}>{int.score}</span>
                              </>
                            ) : (
                              <span className="px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 text-[10px] uppercase tracking-widest font-bold border border-rose-500/20">Not Completed</span>
                            )
                          ) : (
                            <>
                              <span className="px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 text-[10px] uppercase tracking-widest font-bold border border-amber-500/20">In Progress</span>
                              <button className="px-4 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface hover:text-primary hover:border-primary/50 transition-colors font-body-sm text-sm font-medium">
                                Resume
                              </button>
                            </>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- LANDING PAGE (Not Logged In) ---
  return (
    <div className="font-body-md text-body-md bg-surface-container-lowest antialiased overflow-x-hidden min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <header className="bg-background/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-[0px_0px_15px_rgba(0,219,233,0.1)]">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
          <Logo className="text-2xl" />
          <div className="flex items-center gap-4">
            <form action={async () => { "use server"; await signIn(); }}>
              <button 
                type="submit" 
                className={`font-headline-lg border border-white/20 hover:border-primary text-white hover:text-primary bg-transparent px-6 py-2 transition-all duration-300 text-base font-medium`}
              >
                Get started
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 md:px-10 overflow-hidden pt-20">
          {/* DarkVeil Background */}
          <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen">
            <DarkVeil 
              baseColor={[0.0, 0.94, 1.0]} 
              noiseIntensity={0.03} 
              scanlineIntensity={0.3} 
              scanlineFrequency={800} 
              speed={0.4} 
              warpAmount={0.8} 
              resolutionScale={1} 
            />
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center pb-20">
            <h1 className={`${instrumentSerif.className} text-6xl md:text-[88px] leading-[1.05] tracking-tight mb-8 drop-shadow-2xl`}>
              <span className="text-white block">Ace the interview.</span>
              <span className="text-primary block mt-2">Before it begins.</span>
            </h1>
            
            <p className="font-sans text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium">
Train with AURA that adapts to your role, analyzes your responses, and highlights exactly where you can improve.            </p>
          </div>
        </section>

        {/* BYOK Architecture Section */}
        <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-10 border-t border-white/5">
          <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-16 text-left">
            <div className="flex-1 max-w-xl">
              <span className={`font-headline-lg font-bold text-sm text-primary uppercase tracking-widest block mb-4`}>
                ENTERPRISE-GRADE PRIVACY
              </span>
              <h2 className={`${instrumentSerif.className} text-4xl md:text-6xl text-white font-normal leading-[1.1] mb-6`}>
                Bring Your Own Key.<br />
                <span className="text-primary italic">Absolute Control.</span>
              </h2>
              <p className="font-sans text-white/60 text-base md:text-lg mb-8 leading-relaxed">
                We believe your interview data should remain yours. Connect your own OpenAI, Anthropic, or Gemini API keys to power the simulation engine. Zero platform markup, complete data sovereignty, and uncompromised privacy.
              </p>
              
              <ul className="space-y-3 text-sm text-white/40 font-mono">
                <li>• store keys securely in your local environment</li>
                <li>• choose your preferred LLM provider</li>
                <li>• open-source architecture for total transparency</li>
              </ul>
            </div>

            <div className="flex-grow flex-1 flex flex-col gap-4 max-w-lg w-full relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-none blur-xl group-hover:bg-primary/10 transition-all duration-500"></div>
              <div className="border border-white/10 bg-black/40 rounded-none overflow-hidden font-mono text-xs md:text-sm relative z-10">
                <div className="border-b border-white/10 px-4 py-2 text-white/40 bg-white/5 flex justify-between items-center">
                  <span>.env.local</span>
                  <Settings className="w-4 h-4 text-white/40" />
                </div>
                <div className="p-6 space-y-2 text-white/80">
                  <div><span className="text-white/40"># API Configuration</span></div>
                  <div><span className="text-primary">OPENAI_API_KEY</span>=&quot;sk-proj-...&quot;</div>
                  <div><span className="text-primary">ANTHROPIC_API_KEY</span>=&quot;sk-ant-...&quot;</div>
                  <div><span className="text-primary">GOOGLE_GEMINI_KEY</span>=&quot;AIzaSy...&quot;</div>
                  <div className="mt-4"><span className="text-white/40"># Data stays on your machine</span></div>
                  <div><span className="text-primary">LOCAL_STORAGE</span>=&quot;true&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Side-by-Side Left/Right layout (Live Coding Round focus) */}
        <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-10 border-t border-white/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 text-left">
            {/* Left side info */}
            <div className="flex-1 max-w-xl">
              <span className={`font-headline-lg font-bold text-sm text-primary uppercase tracking-widest block mb-4`}>
                LIVE CODING SIMULATION
              </span>
              <h2 className={`${instrumentSerif.className} text-4xl md:text-6xl text-white font-normal leading-[1.1] mb-6`}>
                Live coding.<br />
                <span className="text-primary italic">Instant evaluation.</span>
              </h2>
              <p className="font-sans text-white/60 text-base md:text-lg mb-8 leading-relaxed">
                Solve algorithmic challenges directly within our integrated code editor. AURA compiles and executes your code against rigorous test suites, evaluating your syntax, performance, and complexity in real-time.
              </p>
              
              <ul className="space-y-3 text-sm text-white/40 font-mono">
                <li>• support for javascript, python, go, and java</li>
                <li>• live test cases with instant complexity profiling (Big O)</li>
                <li>• dynamic AI hints when you hit code performance bottlenecks</li>
              </ul>
            </div>

            {/* Right side config preview cards */}
            <div className="flex-grow flex-1 flex flex-col gap-4 max-w-lg w-full">
              <div className="border border-white/10 bg-black/40 rounded-none overflow-hidden font-mono text-xs md:text-sm">
                <div className="border-b border-white/10 px-4 py-2 text-white/40 bg-white/5">
                  solutions/two_sum.js
                </div>
                <div className="p-6 space-y-1 text-white/80">
                  <div><span className="text-primary">const</span> map = <span className="text-primary">new</span> Map();</div>
                  <div><span className="text-primary">for</span> (<span className="text-primary">let</span> i = 0; i &lt; nums.length; i++) &#123;</div>
                  <div className="pl-4"><span className="text-primary">const</span> diff = target - nums[i];</div>
                  <div className="pl-4"><span className="text-primary">if</span> (map.has(diff)) <span className="text-primary">return</span> [map.get(diff), i];</div>
                  <div className="pl-4">map.set(nums[i], i);</div>
                  <div>&#125;</div>
                </div>
              </div>

              <div className="border border-white/10 bg-black/40 rounded-none overflow-hidden font-mono text-xs md:text-sm">
                <div className="border-b border-white/10 px-4 py-2 text-white/40 bg-white/5">
                  evaluation-metrics.json
                </div>
                <div className="p-6 space-y-1 text-white/80">
                  <div><span className="text-primary">status:</span> &quot;Passed&quot;</div>
                  <div><span className="text-primary">time_complexity:</span> &quot;O(n)&quot;</div>
                  <div><span className="text-primary">space_complexity:</span> &quot;O(n)&quot;</div>
                  <div><span className="text-primary">feedback:</span> &quot;Optimal solution. Exceptional Map utilization.&quot;</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/50 font-mono mt-2 pl-1">
                <span className="w-2.5 h-2.5 bg-primary inline-block"></span>
                real-time compiler — automated test suite — complexity profiling
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: 4-Column Step-by-Step layout */}
        <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-10 border-t border-white/5">
          <div className="text-left mb-16">
            <h2 className={`${instrumentSerif.className} text-4xl md:text-6xl text-white font-normal leading-[1.1]`}>
              Four phases.<br />
              <span className="text-primary italic">Zero guesswork.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 border border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-black/20 text-left">
            <div className="p-8 flex flex-col gap-5">
              <div className="text-5xl md:text-6xl font-bold text-primary tracking-tighter">01</div>
              <div>
                <span className="border border-white/20 text-white/80 bg-white/5 px-2 py-0.5 text-xs font-mono">upload resume</span>
              </div>
              <h4 className="text-white font-medium text-lg">Configure</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Provide your background or paste a target job description. The AI parses and models your career context instantly.
              </p>
            </div>

            <div className="p-8 flex flex-col gap-5">
              <div className="text-5xl md:text-6xl font-bold text-primary tracking-tighter">02</div>
              <div>
                <span className="border border-white/20 text-white/80 bg-white/5 px-2 py-0.5 text-xs font-mono">press space to talk</span>
              </div>
              <h4 className="text-white font-medium text-lg">Simulate</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Answer realistic, audio-driven situational and technical questions adapting in real-time to your statements.
              </p>
            </div>

            <div className="p-8 flex flex-col gap-5">
              <div className="text-5xl md:text-6xl font-bold text-primary tracking-tighter">03</div>
              <div>
                <span className="border border-white/20 text-white/80 bg-white/5 px-2 py-0.5 text-xs font-mono">generate report</span>
              </div>
              <h4 className="text-white font-medium text-lg">Analyze</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Receive immediate feedback on depth of expertise, speech flow, delivery pacing, and exact areas for refinement.
              </p>
            </div>

            <div className="p-8 flex flex-col gap-5">
              <div className="text-5xl md:text-6xl font-bold text-primary tracking-tighter">04</div>
              <div>
                <span className="border border-white/20 text-white/80 bg-white/5 px-2 py-0.5 text-xs font-mono">review weak spots</span>
              </div>
              <h4 className="text-white font-medium text-lg">Perfect</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Practice specific flagged questions again with smart tips to build structural answers and gain maximum confidence.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background w-full py-12 border-t border-white/5 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10 max-w-7xl mx-auto gap-6 md:gap-0">
          <div className={`font-headline-lg text-xl font-bold text-primary`}>AURA AI</div>
          <div>
            <a 
              href="https://github.com/Deb-Karmakar/AURA-AI" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`font-headline-lg border border-white/20 hover:border-primary text-white hover:text-primary bg-transparent px-6 py-2 transition-all duration-300 text-base font-medium`}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
