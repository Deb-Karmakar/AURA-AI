import Link from "next/link";
import { auth, signOut } from "@/auth";
import connectToDatabase from "@/lib/db/mongodb";
import Interview from "@/lib/db/models/Interview";
import { 
  LayoutDashboard, Video, Settings, PlusCircle, HelpCircle, LogOut, 
  BarChart3, Search, Filter, Calendar, Clock, User, ArrowRight, Activity
} from "lucide-react";

export default async function InterviewsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1", 10) || 1;
  const limit = 10;
  
  const session = await auth();
  
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-on-surface">
        <p>Please log in to view your interviews.</p>
      </div>
    );
  }

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

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === "completed" && i.score !== undefined);
  const avgScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedInterviews.length) 
    : 0;
  const inProgressCount = interviews.filter(i => i.status === "in-progress").length;

  const totalPages = Math.ceil(totalInterviews / limit);
  const paginatedInterviews = interviews.slice((page - 1) * limit, page * limit);

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
        {/* Brand */}
        <div className="px-8 mb-8">
          <div className="font-headline-lg text-headline-lg text-primary font-bold tracking-tighter">AURA AI</div>
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
            <Link href="/" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <LayoutDashboard className="w-5 h-5 group-hover:text-primary transition-colors duration-300" />
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Dashboard</span>
            </Link>
          </li>
          <li className="bg-secondary/20 text-primary border-r-4 border-primary rounded-r-xl py-3 px-8 flex items-center gap-4 cursor-pointer scale-[0.98] transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Video className="w-5 h-5 relative z-10" />
            <span className="font-body-md text-body-md font-medium relative z-10">Interviews</span>
          </li>
          <li>
            <Link href="/analytics" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <BarChart3 className="w-5 h-5 group-hover:text-primary transition-colors duration-300" />
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Analytics</span>
            </Link>
          </li>
          <li>
            <Link href="/settings" className="text-on-surface-variant hover:bg-white/5 hover:bg-surface-variant/50 py-3 px-8 transition-all flex items-center gap-4 group rounded-r-xl">
              <Settings className="w-5 h-5 group-hover:text-primary transition-colors duration-300" />
              <span className="font-body-md text-body-md group-hover:text-primary transition-colors duration-300">Settings</span>
            </Link>
          </li>
        </ul>
        
        {/* Primary CTA */}
        <div className="px-8 mb-6 mt-auto">
          <Link href="/setup/topic" className="w-full py-3 px-4 bg-primary/10 text-primary border border-primary/30 rounded-xl font-body-md text-body-md font-medium flex items-center justify-center gap-2 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0px_0px_15px_rgba(219,252,255,0.2)] transition-all duration-300 group">
            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Practice
          </Link>
        </div>
        
        {/* Footer Links */}
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
      <main className="flex-1 h-screen overflow-y-auto ml-0 md:ml-64 pt-20 pb-8 px-4 md:pt-16 md:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-2 font-bold tracking-tight">Interview Archives</h2>
              <p className="font-body-md text-lg text-on-surface-variant max-w-xl">
                Review past sessions, analyze AI-driven candidate sentiment, and extract actionable recruitment insights from the centralized repository.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Search topics, roles..." 
                  className="bg-surface-container-low border border-white/10 rounded-xl py-2 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 transition-all"
                />
              </div>
              <button className="p-2 rounded-xl bg-surface-container-low border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-container/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-medium">Total Interviews</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-4xl text-on-surface font-bold">{totalInterviews}</span>
              </div>
            </div>
            
            <div className="bg-surface-container/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-medium">Avg AI Match Score</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-4xl text-on-surface font-bold">{avgScore}</span>
              </div>
            </div>
            
            <div className="bg-surface-container/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-medium">Processing Queue</span>
              <div className="flex items-center gap-3">
                <span className="font-headline-lg text-4xl text-on-surface font-bold">{inProgressCount}</span>
                {inProgressCount > 0 && (
                  <div className="flex items-center gap-2 bg-surface-container-high px-2 py-1 rounded-md border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="font-data-mono text-[10px] text-on-surface-variant">IN PROGRESS</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Table / List */}
          <div className="bg-surface-container/30 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/5">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 border-b border-white/10 bg-surface-container-low/50 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-medium">
              <div className="col-span-4">Topic / Role</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Match Score</div>
              <div className="col-span-3 text-right">Action</div>
            </div>
            
            {/* List Items */}
            <div className="flex flex-col">
              {paginatedInterviews.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="w-10 h-10 text-on-surface-variant mx-auto mb-4 opacity-50" />
                  <p className="text-on-surface-variant text-lg">No interviews found.</p>
                </div>
              ) : (
                paginatedInterviews.map((int: any) => (
                  <div key={int._id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-center border-b border-white/5 hover:bg-white/5 transition-colors group ${int.status === "in-progress" ? 'opacity-80' : ''}`}>
                    <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors relative overflow-hidden`}>
                        {int.status === "in-progress" && <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>}
                        <User className={`w-6 h-6 z-10 ${int.status === "in-progress" ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary transition-colors'}`} />
                      </div>
                      <div>
                        <div className="font-body-md font-medium text-on-surface line-clamp-1">{int.interviewType === "topic" ? int.topic : int.role}</div>
                        <div className="font-body-sm text-sm text-on-surface-variant uppercase tracking-wider mt-0.5">{int.interviewType}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-3 flex items-center gap-2 text-on-surface-variant font-data-mono text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(int.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                      {int.status === "completed" ? (
                        int.score !== undefined ? (
                          <>
                            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${int.score}%` }}></div>
                            </div>
                            <span className="font-data-mono text-sm text-primary font-medium">{int.score}/100</span>
                          </>
                        ) : (
                          <span className="px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 text-[10px] uppercase tracking-widest font-bold border border-rose-500/20">Not Completed</span>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          <span className="font-data-mono text-xs text-primary ml-2">In Progress...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-1 md:col-span-3 flex justify-end">
                      {int.status === "completed" ? (
                        <Link href={`/interview/${int._id}/feedback`} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-on-surface hover:text-primary hover:border-primary/50 transition-all text-sm font-medium">
                          View Analysis
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <Link href={`/interview/${int._id}`} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/5 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium bg-surface-container">
                          Resume Session
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {interviews.length > 0 && (
              <div className="p-5 border-t border-white/10 flex justify-between items-center bg-surface-container-low/30">
                <span className="font-data-mono text-xs text-on-surface-variant">
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalInterviews)} of {totalInterviews} records
                </span>
                <div className="flex gap-2">
                  {page > 1 ? (
                    <Link href={`/interviews?page=${page - 1}`} className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-on-surface hover:bg-white/5 transition-colors">
                      &lt;
                    </Link>
                  ) : (
                    <button disabled className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-on-surface-variant opacity-50 cursor-not-allowed">
                      &lt;
                    </button>
                  )}
                  {page < totalPages ? (
                    <Link href={`/interviews?page=${page + 1}`} className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-on-surface hover:bg-white/5 transition-colors">
                      &gt;
                    </Link>
                  ) : (
                    <button disabled className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-on-surface-variant opacity-50 cursor-not-allowed">
                      &gt;
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
