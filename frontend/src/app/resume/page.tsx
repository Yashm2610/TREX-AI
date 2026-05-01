"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, AlertCircle, TrendingUp, Info, 
  UploadCloud, FileText, UserCheck, Sparkles, 
  Search, Layers, Zap, ArrowRight, 
  Target, ShieldCheck, ListChecks, History,
  MoreVertical, Activity, BadgeCheck
} from "lucide-react";
import TrexBotIcon from "@/components/TrexBotIcon";
import ResumeChatbot from "@/components/ResumeChatbot";
import ResumeCanvas from "@/app/resume/builder/ResumeCanvas";
import { useAuth } from "@/components/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface ActionItem {
  label: string;
  impact: string;
}

interface AICard {
  title: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  details: string;
  action_items: ActionItem[];
}

interface AIFeedback {
  provider: string;
  overall_match: AICard;
  resume_weaknesses: AICard;
  section_review: AICard;
  role_alignment: AICard;
  project_review: AICard;
  roadmap: AICard;
  application_strategy: AICard;
  final_verdict: AICard;
  suggested_resume_changes: string[];
}

interface AnalysisResult {
  overall_score: number;
  section_scores: Record<string, number>;
  matched_keywords: string[];
  missing_keywords: string[];
  detected_sections: string[];
  missing_sections: string[];
  ats_warnings: string[];
  improvement_suggestions: string[];
  ai_feedback: AIFeedback | null;
}

// Detailed AI Analysis Card Component
function AICardComponent({ card }: { card: AICard }) {
  const severityMap = {
    critical: { border: "border-rose-500/50", bg: "bg-rose-500/5", text: "text-rose-400", pill: "bg-rose-500", label: "Critical" },
    major: { border: "border-amber-500/50", bg: "bg-amber-500/5", text: "text-amber-400", pill: "bg-amber-500", label: "Major" },
    moderate: { border: "border-blue-500/50", bg: "bg-blue-500/5", text: "text-blue-400", pill: "bg-blue-500", label: "Moderate" },
    minor: { border: "border-emerald-500/50", bg: "bg-emerald-500/5", text: "text-emerald-400", pill: "bg-emerald-500", label: "Minor" },
  };

  const config = severityMap[card.severity] || severityMap.moderate;

  return (
    <Card className={`group relative ${config.bg} ${config.border} border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>Assessment Category</span>
            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{card.title}</h3>
          </div>
          <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${config.pill} text-white`}>
            {config.label}
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          {card.details}
        </p>

        {card.action_items && card.action_items.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {card.action_items.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full pl-2 pr-3 py-1.5 transition-colors"
                title={`Impact: ${item.impact}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${config.pill}`}></div>
                <span className="text-[11px] font-bold text-slate-300 tracking-tight">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dynamic Counter Component
function Counter({ value, duration = 1500 }: { value: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{count}</>;
}

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="space-y-10 animate-pulse w-full max-w-6xl mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-900/50 rounded-3xl border border-slate-800"></div>
        <div className="h-48 md:col-span-2 bg-slate-900/50 rounded-3xl border border-slate-800"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-900/50 rounded-3xl border border-slate-800"></div>
        <div className="h-64 bg-slate-900/50 rounded-3xl border border-slate-800"></div>
      </div>
    </div>
  );
}

// Vibrant Circular Score Component
function CircularScore({ score }: { score: number }) {
  const colorClass = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";
  const strokeClass = score >= 80 ? "stroke-emerald-400" : score >= 60 ? "stroke-amber-400" : "stroke-rose-400";
  
  return (
    <div className="relative w-44 h-44 group">
      {/* Outer Glow */}
      <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
      
      <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={`${(score / 100) * 263.9} 263.9`}
          strokeLinecap="round"
          className={`${strokeClass} transition-all duration-1500 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className={`text-5xl font-black ${colorClass} tracking-tighter drop-shadow-sm`}><Counter value={score} />%</span>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Match Index</span>
      </div>
    </div>
  );
}

export default function ResumeOptimizer() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [useAI, setUseAI] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user } = useAuth();

  const startBuildingJourney = async (data: any) => {
    setIsChatOpen(false);
    try {
      const res = await fetch("http://localhost:8000/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to initialize builder");
      const { session_id } = await res.json();
      setCurrentSessionId(session_id);
      setIsCanvasOpen(true);
    } catch (e) {
      alert("Error starting builder session");
    }
  };

  const analyzeResume = async () => {
    setLoading(true);
    setError("");
    setAnalysis(null);
    setShowLoginPrompt(false);

    try {
      if (!resumeFile) throw new Error("Please upload a PDF resume");
      if (!jobDescription.trim()) throw new Error("Please enter the job description");

      const formData = new FormData();
      formData.append("resume_file", resumeFile);
      formData.append("job_description", jobDescription);
      formData.append("use_ai", useAI ? "true" : "false");
      formData.append("provider", "groq");

      const res = await fetch("http://localhost:8000/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to analyze resume");
      }

      const data: AnalysisResult = await res.json();
      setAnalysis(data);

      if (user) {
        const resumeId = crypto.randomUUID();
        await setDoc(doc(db, "users", user.uid, "resumes", resumeId), {
          fileName: resumeFile.name,
          uploadedAt: serverTimestamp(),
          jobDescription,
          analysisResult: data,
          overallScore: data.overall_score
        });
      } else {
        setShowLoginPrompt(true);
      }

    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
      if (!error) {
        setTimeout(() => window.scrollTo({ top: 850, behavior: 'smooth' }), 300);
      }
    }
  };

  const handleClear = () => {
    setResumeFile(null);
    setJobDescription("");
    setAnalysis(null);
    setError("");
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <ProtectedRoute>
      {isCanvasOpen && currentSessionId ? (
        <ResumeCanvas sessionId={currentSessionId} onBack={() => setIsCanvasOpen(false)} />
      ) : (
        <div className="relative min-h-screen flex flex-col font-sans text-slate-200 bg-[#020617] selection:bg-indigo-500/30">
          {/* Background Accents */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute top-[20%] right-[-5%] w-[40%] h-[600px] bg-violet-600/10 rounded-full blur-[140px]" />
          </div>

          <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-5 flex justify-between items-center backdrop-blur-2xl border-b border-white/5 bg-[#020617]/40">
            <Link href="/" className="text-2xl font-black tracking-tighter text-white">
              trex<span className="text-indigo-500">.ai</span>
            </Link>
            <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-slate-500 tracking-[0.3em]">
              <Link href="/" className="hover:text-white transition-colors uppercase">HOME</Link>
              {user && <Link href="/my-resumes" className="hover:text-white transition-colors flex items-center gap-2">
                <History className="w-3 h-3" /> ARCHIVE
              </Link>}
              <span className="text-white border-b-2 border-indigo-500 pb-1">CHECKER</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-slate-500 hover:text-white font-black px-4 py-2 text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest h-auto">
                  Dashboard
                </Button>
              </Link>
            </div>
          </nav>

          <main className="flex-1 max-w-6xl mx-auto w-full pt-44 px-6 pb-32 space-y-20">
            {/* Hero */}
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black tracking-[0.3em] uppercase">
                <Activity className="w-4 h-4" />
                Vibrant Analysis Engine
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white max-w-5xl leading-[0.9]">
                The Intelligent <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">Resume Checker.</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl leading-relaxed font-medium">
                Professional ATS validation and keyword matching for modern career growth.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-900/30 border-white/5 backdrop-blur-sm rounded-[2.5rem] p-2 overflow-hidden hover:border-indigo-500/30 transition-all duration-500">
                <CardHeader className="px-8 pt-8 pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-500" /> Resume Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <div className={`relative flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-3xl transition-all duration-300 ${resumeFile ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 bg-slate-950/50 hover:bg-slate-900/50 hover:border-white/10'}`}>
                    <input id="resume-upload" type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {!resumeFile ? (
                      <div className="flex flex-col items-center text-center space-y-4">
                        <UploadCloud className="w-10 h-10 text-indigo-500" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-200">Drop PDF here</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">or click to browse</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center space-y-4">
                        <BadgeCheck className="w-12 h-12 text-indigo-500" />
                        <p className="text-sm font-bold text-white line-clamp-1">{resumeFile.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); setResumeFile(null); }} className="text-[9px] font-black text-slate-600 hover:text-rose-500 uppercase tracking-widest">Change File</button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/30 border-white/5 backdrop-blur-sm rounded-[2.5rem] p-2 overflow-hidden hover:border-violet-500/30 transition-all duration-500">
                <CardHeader className="px-8 pt-8 pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                    <Target className="w-5 h-5 text-violet-500" /> Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste target JD here..." className="w-full h-64 bg-slate-950/50 border border-white/5 rounded-3xl p-7 text-sm text-slate-300 placeholder:text-slate-700 outline-none resize-none" />
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center space-y-8">
               <div className="flex items-center gap-4 px-6 py-2 bg-white/5 rounded-full border border-white/5">
                  <input type="checkbox" id="checker-ai" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} className="w-4 h-4 rounded-md border-white/10 bg-black text-indigo-500" />
                  <label htmlFor="checker-ai" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-indigo-400">Deep Analysis Mode</label>
               </div>
               <Button onClick={analyzeResume} disabled={loading || !resumeFile || !jobDescription.trim()} className="w-full md:w-96 h-20 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-3xl shadow-xl transition-all">
                {loading ? "CHECKING..." : "CHECK MY RESUME"}
               </Button>
               <button onClick={handleClear} className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.4em]">Clear Workspace</button>
            </div>

            {error && <div className="max-w-2xl mx-auto p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">{error}</div>}
            {loading && <SkeletonLoader />}

            {/* Results */}
            {analysis && (
              <div className="space-y-24 animate-in fade-in duration-1000">
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <Card className="bg-slate-900/40 border-white/5 rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-8 shadow-2xl">
                      <CircularScore score={analysis.overall_score} />
                   </Card>
                   <Card className="md:col-span-2 bg-slate-900/20 border-white/5 rounded-[3rem] p-10">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(analysis.section_scores).map(([key, value]) => (
                          <div key={key} className="bg-[#020617]/50 p-7 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all">
                            <p className="text-4xl font-black text-white"><Counter value={value} /></p>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2">{key.replace('_', ' ')}</p>
                          </div>
                        ))}
                      </div>
                   </Card>
                </div>

                {/* AI Feedback Grid */}
                {analysis.ai_feedback && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-6"><h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Analysis Report</h2><div className="h-px flex-1 bg-white/5"></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <AICardComponent card={analysis.ai_feedback.overall_match} />
                       <AICardComponent card={analysis.ai_feedback.resume_weaknesses} />
                       <AICardComponent card={analysis.ai_feedback.section_review} />
                       <AICardComponent card={analysis.ai_feedback.role_alignment} />
                       <AICardComponent card={analysis.ai_feedback.project_review} />
                       <AICardComponent card={analysis.ai_feedback.roadmap} />
                       <AICardComponent card={analysis.ai_feedback.application_strategy} />
                       <AICardComponent card={analysis.ai_feedback.final_verdict} />
                    </div>

                    {/* Roadmap Strip */}
                    <Card className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border-indigo-500/20 rounded-[3rem] p-12 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-12 opacity-5"><Zap className="w-48 h-48 text-white" /></div>
                       <div className="relative z-10 space-y-10">
                          <h3 className="text-2xl font-black text-white tracking-tight">Priority Action Plan</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                             <ul className="space-y-5">
                                {[...(analysis.ai_feedback?.suggested_resume_changes || []), ...(analysis.improvement_suggestions || [])].slice(0, 10).map((change, idx) => (
                                  <li key={idx} className="flex gap-5 text-sm text-slate-200 group">
                                     <span className="flex-shrink-0 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[11px] font-black text-indigo-400 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all">{idx+1}</span>
                                     <span>{change}</span>
                                  </li>
                                ))}
                             </ul>
                             <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5 space-y-6">
                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4" /> Strategic Insight</p>
                                <p className="text-sm text-slate-400 italic leading-relaxed">{analysis.ai_feedback.final_verdict.details}</p>
                             </div>
                          </div>
                       </div>
                    </Card>
                  </div>
                )}

                {/* Keyword & Structural Deep Dive */}
                <div className="space-y-12">
                   <div className="flex items-center gap-6"><h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Content Integrity</h2><div className="h-px flex-1 bg-white/5"></div></div>
                   
                   {/* Row 1: Keywords */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="bg-slate-900/20 border-white/5 rounded-[2.5rem] p-10 space-y-8">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Keywords</h4>
                         <div className="flex flex-wrap gap-2">
                           {analysis.matched_keywords?.map(kw => (
                             <span key={kw} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-xl uppercase">{kw}</span>
                           ))}
                         </div>
                      </Card>
                      <Card className="bg-slate-900/20 border-white/5 rounded-[2.5rem] p-10 space-y-8">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3"><AlertCircle className="w-4 h-4 text-rose-500" /> Missing Targets</h4>
                         <div className="flex flex-wrap gap-2">
                           {analysis.missing_keywords?.map(kw => (
                             <span key={kw} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-xl uppercase">{kw}</span>
                           ))}
                         </div>
                      </Card>
                   </div>

                   {/* Row 2: Structure & Warnings */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Detected Sections */}
                      <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-[2.5rem] p-8 space-y-6">
                         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> Components Found</h4>
                         <div className="flex flex-wrap gap-2">
                            {analysis.detected_sections?.map(s => (
                              <span key={s} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500/70 text-[9px] font-bold rounded-lg uppercase tracking-tight">{s.replace('_', ' ')}</span>
                            ))}
                         </div>
                      </Card>

                      {/* Structural Gaps */}
                      <Card className="bg-amber-500/5 border-amber-500/20 rounded-[2.5rem] p-8 space-y-6">
                         <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-3"><Layers className="w-4 h-4" /> Structural Gaps</h4>
                         <div className="flex flex-wrap gap-2">
                            {analysis.missing_sections?.map(s => (
                              <span key={s} className="px-3 py-1.5 bg-amber-500/10 text-amber-500/70 text-[9px] font-bold rounded-lg uppercase tracking-tight">Missing: {s.replace('_', ' ')}</span>
                            ))}
                         </div>
                      </Card>

                      {/* ATS Warnings */}
                      <Card className="bg-rose-500/5 border-rose-500/20 rounded-[2.5rem] p-8 space-y-6">
                         <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] flex items-center gap-3"><AlertCircle className="w-4 h-4" /> Integrity Warnings</h4>
                         <ul className="space-y-3">
                            {analysis.ats_warnings?.map((w, i) => (
                              <li key={i} className="text-[11px] text-slate-400 flex gap-3"><span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>{w}</li>
                            ))}
                            {(!analysis.ats_warnings || analysis.ats_warnings.length === 0) && <li className="text-[11px] text-emerald-500/50 italic">No critical formatting issues detected.</li>}
                         </ul>
                      </Card>
                   </div>
                </div>
              </div>
            )}
          </main>
          <TrexBotIcon onClick={() => setIsChatOpen(true)} isOpen={isChatOpen} />
          <ResumeChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onSubmit={startBuildingJourney} />
        </div>
      )}
    </ProtectedRoute>
  );
}
