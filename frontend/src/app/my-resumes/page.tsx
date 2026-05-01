"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, FileText, X, AlertCircle, 
  History, Calendar, LayoutGrid, 
  ArrowRight, Sparkles, ShieldCheck, 
  Target, ListChecks, Activity, Zap,
  Layers
} from "lucide-react";

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

export default function MyResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "users", user.uid, "resumes"),
      orderBy("uploadedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Archive Snapshot Updated, Total Docs:", snapshot.size);
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return { 
          ...docData, 
          id: doc.id 
        };
      });
      setResumes(data);
      setLoading(false);
    }, (err: any) => {
      console.error("Error fetching resumes:", err);
      setError("Failed to load your resumes. " + (err?.message || ""));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!id) {
      alert("Error: Missing document ID");
      return;
    }

    if (!confirm("Confirm deletion of this analysis report?")) return;
    
    try {
      console.log("Attempting to delete document:", id);
      const docRef = doc(db, "users", user!.uid, "resumes", id);
      await deleteDoc(docRef);
      console.log("Delete successful for ID:", id);
      
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (err: any) {
      console.error("Critical error during delete:", err);
      alert(`Delete failed: ${err.message}\nPath: users/${user!.uid}/resumes/${id}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen flex flex-col font-sans text-slate-200 bg-[#020617] selection:bg-indigo-500/30">
        {/* Background Glow */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-5 flex justify-between items-center backdrop-blur-2xl border-b border-white/5 bg-[#020617]/40">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white">
            trex<span className="text-indigo-500">.ai</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-slate-500 tracking-[0.3em]">
            <Link href="/" className="hover:text-white transition-colors uppercase">HOME</Link>
            <span className="text-white border-b-2 border-indigo-500 pb-1">HISTORY</span>
          </div>
          <Link href="/">
            <button className="px-6 py-2 rounded-xl text-[10px] font-black bg-indigo-600 hover:bg-indigo-500 transition-all text-white tracking-widest uppercase">
              Dashboard
            </button>
          </Link>
        </nav>

        <main className="flex-1 max-w-6xl mx-auto w-full pt-44 px-6 pb-20 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 tracking-widest uppercase">
                <History className="w-3.5 h-3.5" />
                Archive Storage
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-white">Checked Resumes</h1>
              <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
                Review your previous resume analysis reports and tracking indices.
              </p>
            </div>
            <Link href="/resume">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-7 rounded-3xl h-auto flex items-center gap-3 text-lg hover:scale-105 transition-all">
                New Check <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
             </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 p-10 rounded-[3rem] text-center max-w-2xl mx-auto space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
              <h3 className="text-xl font-bold text-white tracking-tight">Database Connectivity Error</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-8 text-center bg-slate-900/10 border border-white/5 rounded-[4rem]">
              <div className="w-24 h-24 bg-[#020617] border border-white/5 rounded-[2.5rem] flex items-center justify-center text-indigo-500">
                <LayoutGrid className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">No Reports Found</p>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">Analyze a resume to generate your first professional checker report.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resumes.map((resume) => (
                <Card key={resume.id} 
                      onClick={() => setSelectedAnalysis(resume)}
                      className="bg-slate-900/30 border-white/5 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer group shadow-2xl rounded-[2.5rem] overflow-hidden">
                  <div className={`h-1.5 w-full ${resume.overallScore >= 80 ? 'bg-emerald-500' : resume.overallScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'} opacity-50`}></div>
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-sm font-bold text-slate-200 line-clamp-1 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#020617] flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                        <FileText className="w-5 h-5 text-indigo-500 group-hover:text-white transition-colors" />
                      </div>
                      {resume.fileName || "Untitled Resume"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 font-black uppercase tracking-widest mt-6">
                      <Calendar className="w-3.5 h-3.5" />
                      {resume.uploadedAt ? new Date(resume.uploadedAt.toDate()).toLocaleDateString() : 'Recent'}
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between bg-[#020617]/50 p-5 rounded-3xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Match Index</p>
                        <p className="text-2xl font-black text-white"><Counter value={resume.overallScore} />%</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full blur-[4px] ${resume.overallScore >= 80 ? 'bg-emerald-500' : resume.overallScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">View Report</span>
                       <button 
                         onClick={(e) => handleDelete(e, resume.id)} 
                         className="relative z-30 p-2.5 text-slate-700 hover:text-white hover:bg-rose-500 rounded-2xl transition-all active:scale-90 shadow-lg"
                         title="Delete Report"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Enhanced Modal */}
        {selectedAnalysis && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#020617] w-full max-w-6xl max-h-full rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Report Archive</h3>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedAnalysis.fileName}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAnalysis(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                  <X className="w-7 h-7 text-slate-500" />
                </button>
              </div>

              <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="bg-slate-900/30 p-10 rounded-[2.5rem] border border-white/5 text-center flex flex-col items-center justify-center space-y-3 shadow-inner">
                        <p className="text-5xl font-black text-white tracking-tighter"><Counter value={selectedAnalysis.overallScore} />%</p>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Match Index</p>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedAnalysis.analysisResult.section_scores && Object.entries(selectedAnalysis.analysisResult.section_scores).map(([key, val]) => (
                        <div key={key} className="bg-slate-900/20 p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center hover:border-indigo-500/20 transition-all">
                          <p className="text-2xl font-black text-slate-200"><Counter value={val as number} /></p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center mt-2">{key.replace('_', ' ')}</p>
                        </div>
                      ))}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-slate-900/20 border-white/5 rounded-[2.5rem] p-10 space-y-8">
                        <div className="flex items-center gap-4">
                           <ShieldCheck className="w-6 h-6 text-emerald-500" />
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated Strengths</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedAnalysis.analysisResult?.matched_keywords?.slice(0, 15).map((kw: string) => (
                            <span key={kw} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-xl uppercase">
                              {kw}
                            </span>
                          ))}
                        </div>
                    </Card>

                    <Card className="bg-slate-900/20 border-white/5 rounded-[2.5rem] p-10 space-y-8">
                        <div className="flex items-center gap-4">
                           <Target className="w-6 h-6 text-rose-500" />
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Gaps</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedAnalysis.analysisResult?.missing_keywords?.slice(0, 10).map((kw: string) => (
                            <span key={kw} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-xl uppercase">
                              {kw}
                            </span>
                          ))}
                        </div>
                    </Card>
                 </div>

                 {/* Restored Integrity Sections */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-[2.5rem] p-8 space-y-6">
                       <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> Components Found</h4>
                       <div className="flex flex-wrap gap-2">
                          {selectedAnalysis.analysisResult.detected_sections?.map((s: string) => (
                            <span key={s} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500/70 text-[9px] font-bold rounded-lg uppercase tracking-tight">{s.replace('_', ' ')}</span>
                          ))}
                       </div>
                    </Card>

                    <Card className="bg-amber-500/5 border-amber-500/20 rounded-[2.5rem] p-8 space-y-6">
                       <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-3"><Layers className="w-4 h-4" /> Structural Gaps</h4>
                       <div className="flex flex-wrap gap-2">
                          {selectedAnalysis.analysisResult.missing_sections?.map((s: string) => (
                            <span key={s} className="px-3 py-1.5 bg-amber-500/10 text-amber-500/70 text-[9px] font-bold rounded-lg uppercase tracking-tight">Missing: {s.replace('_', ' ')}</span>
                          ))}
                       </div>
                    </Card>

                    <Card className="bg-rose-500/5 border-rose-500/20 rounded-[2.5rem] p-8 space-y-6">
                       <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] flex items-center gap-3"><AlertCircle className="w-4 h-4" /> Integrity Warnings</h4>
                       <ul className="space-y-3">
                          {selectedAnalysis.analysisResult.ats_warnings?.map((w: string, i: number) => (
                            <li key={i} className="text-[11px] text-slate-400 flex gap-3"><span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>{w}</li>
                          ))}
                          {(!selectedAnalysis.analysisResult.ats_warnings || selectedAnalysis.analysisResult.ats_warnings.length === 0) && <li className="text-[11px] text-emerald-500/50 italic">No critical formatting issues detected.</li>}
                       </ul>
                    </Card>
                 </div>

                 <Card className="bg-gradient-to-br from-indigo-900/20 to-transparent border-indigo-500/10 rounded-[3rem] p-10 space-y-10">
                    <div className="flex items-center gap-4 px-2">
                       <Activity className="w-6 h-6 text-indigo-500" />
                       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Action Roadmap</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ul className="space-y-4">
                          {(selectedAnalysis.analysisResult?.ai_feedback?.suggested_resume_changes || selectedAnalysis.analysisResult?.improvement_suggestions || []).slice(0, 5).map((item: string, idx: number) => (
                            <li key={idx} className="flex gap-5 text-sm text-slate-400 group">
                              <span className="flex-shrink-0 w-8 h-8 bg-black/40 border border-white/5 rounded-full flex items-center justify-center text-[11px] font-black text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">{idx+1}</span>
                              <span className="pt-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="bg-black/30 p-8 rounded-[2rem] border border-white/5 space-y-6">
                           <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                              <Zap className="w-4 h-4" /> Assessment Summary
                           </p>
                           <p className="text-sm text-slate-500 italic leading-relaxed">
                              {selectedAnalysis.analysisResult.ai_feedback?.overall_match.details || "Historical snapshot of your checked document."}
                           </p>
                        </div>
                    </div>
                 </Card>
              </div>
              
              <div className="p-10 border-t border-white/5 bg-slate-900/20 flex justify-between items-center px-12">
                <button 
                  onClick={(e) => {
                    handleDelete(e, selectedAnalysis.id);
                    setSelectedAnalysis(null);
                  }}
                  className="flex items-center gap-2 text-rose-500/50 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete This Report
                </button>
                <Link href="/resume">
                  <Button className="bg-white text-black hover:bg-slate-200 font-black px-12 py-7 rounded-[2rem] h-auto text-lg transition-transform hover:scale-105 active:scale-95">
                    Open in Checker
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
