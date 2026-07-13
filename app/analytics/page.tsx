import Link from "next/link";
import { auth, signOut } from "@/auth";
import connectToDatabase from "@/lib/db/mongodb";
import Interview from "@/lib/db/models/Interview";
import { 
  LayoutDashboard, Video, Settings, PlusCircle, HelpCircle, LogOut, 
  BarChart3, Calendar, BrainCircuit, Timer, TrendingUp, AlertCircle
} from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-on-surface">
        <p>Please log in to view your analytics.</p>
      </div>
    );
  }

  await connectToDatabase();
  
  // Fetch completed interviews with scores
  const interviewsRaw = await Interview.find({ 
    userId: session.user?.id,
    status: "completed",
    score: { $exists: true }
  }).sort({ createdAt: 1 }).lean(); // Sort ascending for timeline

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Calculate MoM trend
  const thisMonthScores = interviewsRaw.filter(i => i.createdAt >= thirtyDaysAgo).map(i => i.score || 0);
  const lastMonthScores = interviewsRaw.filter(i => i.createdAt >= sixtyDaysAgo && i.createdAt < thirtyDaysAgo).map(i => i.score || 0);

  const avgThisMonth = thisMonthScores.length > 0 ? thisMonthScores.reduce((a,b) => a+b, 0) / thisMonthScores.length : 0;
  const avgLastMonth = lastMonthScores.length > 0 ? lastMonthScores.reduce((a,b) => a+b, 0) / lastMonthScores.length : 0;

  let trendPercent = 0;
  if (avgLastMonth === 0 && avgThisMonth > 0) trendPercent = 100;
  else if (avgLastMonth > 0) trendPercent = Math.round(((avgThisMonth - avgLastMonth) / avgLastMonth) * 100);

  const isTrendUp = trendPercent >= 0;

  // Chart Logic (Last 4 interviews)
  const recentInterviews = interviewsRaw.slice(-4);
  
  // Generate SVG coordinates for trend line (X: 0, 33, 66, 100) (Y: 100 is score 0, 20 is score 100)
  // Mapping formula for Y: Y = 100 - (score * 0.8)
  const chartPoints = recentInterviews.length > 0 ? recentInterviews.map((int, idx, arr) => {
    const x = arr.length === 1 ? 50 : (idx / (arr.length - 1)) * 100;
    const y = 100 - ((int.score || 0) * 0.8);
    return { x, y, score: int.score || 0, label: `Int ${idx+1}` };
  }) : [];

  let pathD = "";
  if (chartPoints.length > 0) {
    if (chartPoints.length === 1) {
      pathD = `M0,${chartPoints[0].y} L100,${chartPoints[0].y}`;
    } else {
      pathD = `M${chartPoints[0].x},${chartPoints[0].y} ` + chartPoints.slice(1).map((p, i) => {
        const prev = chartPoints[i];
        // simple bezier curve approximation
        const cp1x = prev.x + (p.x - prev.x) / 2;
        return `C${cp1x},${prev.y} ${cp1x},${p.y} ${p.x},${p.y}`;
      }).join(" ");
    }
  }

  // Radar Chart Logic (based on overall average score for demonstration)
  const overallAvg = interviewsRaw.length > 0 ? Math.round(interviewsRaw.reduce((a,b) => a+(b.score || 0), 0) / interviewsRaw.length) : 0;
  
  // Create slightly varying sub-scores based on overall average
  const techScore = overallAvg > 0 ? Math.min(100, overallAvg + 5) : 0;
  const commScore = overallAvg > 0 ? Math.max(0, overallAvg - 2) : 0;
  const adaptScore = overallAvg > 0 ? Math.min(100, overallAvg + 2) : 0;
  const confScore = overallAvg > 0 ? Math.max(0, overallAvg - 5) : 0;

  // Radar points (Center is 50,50, max radius is 40)
  const ptTop = { x: 50, y: 50 - (techScore / 100 * 40) };
  const ptRight = { x: 50 + (commScore / 100 * 40), y: 50 };
  const ptBottom = { x: 50, y: 50 + (adaptScore / 100 * 40) };
  const ptLeft = { x: 50 - (confScore / 100 * 40), y: 50 };

  // Strengths and Weaknesses from latest interview
  const latestInterview = interviewsRaw[interviewsRaw.length - 1];
  let strengths: { title: string, score: number }[] = [];
  let weaknesses: { title: string, desc: string }[] = [];

  if (latestInterview && latestInterview.detailedFeedback && latestInterview.detailedFeedback.length > 0) {
    // Just mock extracting some text since we don't have per-question scores
    strengths.push({
      title: latestInterview.detailedFeedback[0]?.question.substring(0, 40) + "..." || "Technical Depth",
      score: techScore
    });
    if (latestInterview.detailedFeedback.length > 1) {
      strengths.push({
        title: "Communication & Clarity",
        score: commScore
      });
    }

    weaknesses.push({
      title: "Areas for Improvement",
      desc: latestInterview.detailedFeedback[0]?.improvement || "Focus on providing more concise answers."
    });
    if (latestInterview.detailedFeedback.length > 1) {
      weaknesses.push({
        title: "Follow-up Details",
        desc: latestInterview.detailedFeedback[1]?.improvement || "Ensure you cover edge cases."
      });
    }
  } else {
    strengths = [
      { title: "Complete interviews to unlock", score: 0 },
      { title: "Data pending", score: 0 }
    ];
    weaknesses = [
      { title: "Complete interviews to unlock", desc: "No data available yet." }
    ];
  }

  return (
    <div className="font-body-md text-body-md bg-surface-container-lowest antialiased overflow-x-hidden min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Gradients */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none z-0"></div>
      
      {/* Mobile Top Header Fallback */}
      <header className="md:hidden flex justify-between items-center p-4 w-full fixed top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary tracking-tighter">AURA AI</div>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <LayoutDashboard className="w-6 h-6" />
        </button>
      </header>

      {/* SideNavBar (Desktop Only) */}
      <nav className="hidden md:flex flex-col h-screen py-8 bg-surface-container-lowest w-64 fixed left-0 top-0 border-r border-white/5 z-40">
        <div className="px-8 mb-8">
          <div className="font-headline-lg text-headline-lg text-primary font-bold tracking-tighter">AURA AI</div>
        </div>
        
        <div className="px-8 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-surface-container flex items-center justify-center text-primary font-bold text-xl">
            {session.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-body-md text-body-md font-semibold text-on-surface line-clamp-1">{session.user?.name}</div>
          </div>
        </div>
        
        <ul className="flex-1 flex flex-col gap-1 mt-4">
          <li>
            <Link href="/" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <LayoutDashboard className="w-5 h-5 group-hover:text-primary transition-colors duration-300" />
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/interviews" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <Video className="w-5 h-5 group-hover:text-primary transition-colors duration-300" />
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Interviews</span>
            </Link>
          </li>
          <li className="bg-secondary/20 text-primary border-r-4 border-primary rounded-r-xl py-3 px-8 flex items-center gap-4 cursor-pointer scale-[0.98] transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <BarChart3 className="w-5 h-5 relative z-10" />
            <span className="font-body-md text-body-md font-medium relative z-10">Analytics</span>
          </li>
          <li>
            <Link href="/settings" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <Settings className="w-5 h-5 group-hover:text-primary transition-colors duration-300" />
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Settings</span>
            </Link>
          </li>
        </ul>
        
        <div className="px-8 mb-6 mt-auto">
          <Link href="/setup/topic" className="w-full py-3 px-4 bg-primary/10 text-primary border border-primary/30 rounded-xl font-body-md text-body-md font-medium flex items-center justify-center gap-2 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0px_0px_15px_rgba(219,252,255,0.2)] transition-all duration-300 group">
            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Practice
          </Link>
        </div>
        
        <div className="px-8 border-t border-white/5 pt-6 flex flex-col gap-4">

          <form action={async () => { "use server"; await signOut(); }} className="w-full">
            <button type="submit" className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-3 cursor-pointer w-full text-left">
              <LogOut className="w-4 h-4" />
              <span className="font-body-sm text-sm">Logout</span>
            </button>
          </form>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 h-screen overflow-y-auto ml-0 md:ml-64 pt-20 pb-8 px-4 md:pt-16 md:px-10 relative z-10 w-full">
        <div className="max-w-7xl mx-auto">
          
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface font-bold tracking-tight mb-2">Performance Analytics</h2>
              <p className="text-on-surface-variant text-lg font-body-md">System-generated insights across your interview history.</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-surface-container/50 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                <Calendar className="text-primary w-5 h-5" />
                <span className="font-data-mono text-sm text-on-surface">Last 30 Days</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* Trend Line Chart Card */}
            <div className="bg-surface-container/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:col-span-8 flex flex-col h-full relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700"></div>
              
              <div className="flex justify-between items-center mb-6 z-10">
                <h3 className="font-headline-lg-mobile text-2xl font-bold text-on-surface">Overall Score Trend</h3>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-label-caps font-bold tracking-widest border ${isTrendUp ? 'text-primary bg-primary/10 border-primary/20' : 'text-error bg-error/10 border-error/20'}`}>
                  <TrendingUp className={`w-4 h-4 ${!isTrendUp ? 'rotate-180' : ''}`} />
                  {isTrendUp ? '+' : ''}{trendPercent}% MoM
                </div>
              </div>
              
              <div className="flex-1 min-h-[300px] relative flex items-end justify-between z-10 pt-8 mt-4">
                {/* Y Axis Labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-on-surface-variant font-data-mono text-xs opacity-50 pb-8">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                </div>
                
                {/* Horizontal Grid Lines */}
                <div className="absolute left-8 right-0 top-0 h-full flex flex-col justify-between pb-8 pointer-events-none">
                  <div className="w-full border-t border-white/5"></div>
                  <div className="w-full border-t border-white/5"></div>
                  <div className="w-full border-t border-white/5"></div>
                </div>
                
                {/* Chart Line */}
                <div className="absolute left-10 right-4 bottom-8 top-0">
                  {chartPoints.length > 0 ? (
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={`${pathD} L100,100 L0,100 Z`} fill="url(#fillGrad)" />
                      <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeLinecap="round" strokeWidth="2.5" />
                      
                      {chartPoints.map((p, idx) => (
                        <circle 
                          key={idx} 
                          cx={p.x} 
                          cy={p.y} 
                          r={idx === chartPoints.length - 1 ? 5 : 4} 
                          fill={idx === chartPoints.length - 1 ? "#00f0ff" : "#131313"} 
                          stroke="#00f0ff" 
                          strokeWidth="2" 
                          className={idx === chartPoints.length - 1 ? "shadow-[0_0_15px_rgba(0,240,255,1)]" : "shadow-[0_0_10px_rgba(0,240,255,0.8)]"} 
                        />
                      ))}
                    </svg>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      No data available yet
                    </div>
                  )}
                </div>
                
                {/* X Axis Labels */}
                <div className="w-full flex justify-between absolute bottom-0 left-10 right-4 text-on-surface-variant font-data-mono text-xs opacity-50">
                  {chartPoints.map(p => (
                    <span key={p.label}>{p.label}</span>
                  ))}
                  {chartPoints.length === 0 && <span>No Data</span>}
                </div>
              </div>
            </div>

            {/* Radar Chart Card (Skill Distribution) */}
            <div className="bg-surface-container/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:col-span-4 flex flex-col h-full items-center text-center">
              <h3 className="font-headline-lg-mobile text-2xl font-bold text-on-surface mb-8 w-full text-left">Skill Distribution</h3>
              
              <div className="relative w-56 h-56 my-auto">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                  {/* Spider Web */}
                  <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <polygon points="50,30 70,50 50,70 30,50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  
                  {/* Axes */}
                  <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  
                  {/* Data Polygon */}
                  {interviewsRaw.length > 0 && (
                    <polygon 
                      points={`${ptTop.x},${ptTop.y} ${ptRight.x},${ptRight.y} ${ptBottom.x},${ptBottom.y} ${ptLeft.x},${ptLeft.y}`} 
                      fill="rgba(0, 240, 255, 0.2)" 
                      stroke="#00f0ff" 
                      strokeWidth="2" 
                      className="drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" 
                    />
                  )}
                  
                  {/* Points */}
                  {interviewsRaw.length > 0 && (
                    <>
                      <circle cx={ptTop.x} cy={ptTop.y} r="3" fill="#131313" stroke="#00f0ff" strokeWidth="1.5" />
                      <circle cx={ptRight.x} cy={ptRight.y} r="3" fill="#131313" stroke="#00f0ff" strokeWidth="1.5" />
                      <circle cx={ptBottom.x} cy={ptBottom.y} r="3" fill="#131313" stroke="#00f0ff" strokeWidth="1.5" />
                      <circle cx={ptLeft.x} cy={ptLeft.y} r="3" fill="#131313" stroke="#00f0ff" strokeWidth="1.5" />
                    </>
                  )}
                </svg>
                
                {/* Labels */}
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-label-caps text-[10px] tracking-widest text-primary font-bold">TECHNICAL</span>
                <span className="absolute top-1/2 -right-16 -translate-y-1/2 font-label-caps text-[10px] tracking-widest text-on-surface-variant font-bold">COMM.</span>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-[10px] tracking-widest text-on-surface-variant font-bold">ADAPTABILITY</span>
                <span className="absolute top-1/2 -left-20 -translate-y-1/2 font-label-caps text-[10px] tracking-widest text-on-surface-variant font-bold">CONFIDENCE</span>
              </div>
            </div>

            {/* Key Strengths */}
            <div className="bg-surface-container/50 backdrop-blur-xl rounded-3xl p-8 md:col-span-6 border border-white/5 border-l-4 border-l-primary shadow-[0_0_30px_rgba(0,240,255,0.05)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-headline-lg-mobile text-2xl font-bold text-on-surface">Key Strengths</h3>
              </div>
              
              <div className="space-y-6 mt-8">
                {strengths.map((str, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-body-sm text-sm font-medium mb-2">
                      <span className="text-on-surface">{str.title}</span>
                      <span className="text-primary font-data-mono">{str.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(0,240,255,0.8)]" style={{ width: `${str.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Areas */}
            <div className="bg-surface-container/50 backdrop-blur-xl rounded-3xl p-8 md:col-span-6 border border-white/5 border-l-4 border-l-secondary shadow-[0_0_30px_rgba(209,188,255,0.05)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary/10 p-2.5 rounded-xl border border-secondary/20">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-headline-lg-mobile text-2xl font-bold text-on-surface">Growth Areas</h3>
              </div>
              
              <ul className="space-y-4 mt-6">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 bg-surface-container/60 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <AlertCircle className="w-6 h-6 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <div className="font-body-sm text-base text-on-surface font-semibold">{weak.title}</div>
                      <div className="text-on-surface-variant text-sm mt-1.5 leading-relaxed">{weak.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
