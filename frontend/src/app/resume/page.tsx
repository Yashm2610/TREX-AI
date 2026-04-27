"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, TrendingUp, Info, Bot } from "lucide-react";
import TrexBotIcon from "@/components/TrexBotIcon";
import ResumeChatbot from "@/components/ResumeChatbot";
import ResumeCanvas from "./builder/ResumeCanvas";

interface SectionScores {
  overall?: number;
  technical_skills?: number;
  experience?: number;
  education?: number;
  projects?: number;
  ats_compatibility?: number;
  [key: string]: number | undefined;
}

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
  section_scores: SectionScores;
  matched_keywords: string[];
  missing_keywords: string[];
  detected_sections: string[];
  missing_sections: string[];
  ats_warnings: string[];
  improvement_suggestions: string[];
  ai_feedback: AIFeedback | null;
}

function AICardComponent({ card }: { card: AICard }) {
  const radialClasses = {
    critical: "trex-radial-red",
    major: "trex-radial-orange",
    moderate: "trex-radial-blue",
    minor: "trex-radial-green",
  };

  const borderColors = {
    critical: "border-red-500/30",
    major: "border-orange-500/30",
    moderate: "border-blue-500/30",
    minor: "border-green-500/30",
  };

  const accentColors = {
    critical: "text-red-400",
    major: "text-orange-400",
    moderate: "text-blue-400",
    minor: "text-green-400",
  };

  const bgAccents = {
    critical: "bg-red-400",
    major: "bg-orange-400",
    moderate: "bg-blue-400",
    minor: "bg-green-400",
  };

  // Logic for the progress bar (Complexity/Readiness index)
  const isProjectCard = card.title.toLowerCase().includes("project");
  const progressValue = card.severity === 'minor' ? 90 : card.severity === 'moderate' ? 65 : card.severity === 'major' ? 40 : 20;

  return (
    <div className={`trex-report-card trex-font-nunito min-h-[320px] flex flex-col ${radialClasses[card.severity]} ${borderColors[card.severity]}`}>
      {/* Header */}
      <div className="flex justify-between items-start p-6 pb-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div className={`w-2 h-2 rounded-full ${bgAccents[card.severity]} animate-pulse`}></div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-4 flex flex-col justify-center">
        <h3 className={`text-xl font-bold mb-1 tracking-tight ${accentColors[card.severity]}`}>
          {card.title}
        </h3>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">
          Senior Assessment
        </p>
        
        <p className="text-sm text-gray-300 leading-relaxed mb-6 italic opacity-80 whitespace-pre-line">
          "{card.details}"
        </p>

        {card.action_items && card.action_items.length > 0 && (
          <div className="mb-6 space-y-3">
             <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Priority Action Items</p>
             <div className="space-y-2">
                {card.action_items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                     <span className="text-[11px] font-medium text-gray-200">{item.label}</span>
                     <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                       item.impact === 'High' || item.impact === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 
                       item.impact === 'Medium' || item.impact === 'Major' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 
                       'bg-blue-500/20 text-blue-400 border-blue-500/20'
                     }`}>
                       {item.impact}
                     </span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {isProjectCard && (
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Complexity Index</span>
              <span className="text-xs font-bold text-white">{progressValue}%</span>
            </div>
            <div className="trex-progress-bg">
              <div 
                className={`trex-progress-fill ${bgAccents[card.severity]}`} 
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#0f0e13]/80 border-t border-gray-800/50 p-6 flex items-center justify-between">
         <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-[8px] font-bold text-gray-400">EM</div>
            <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-[8px] font-bold text-gray-400">SR</div>
         </div>
         <div className={`px-4 py-1.5 rounded-full bg-[#222127] border border-gray-700 text-[10px] font-bold text-white uppercase hover:scale-105 transition-transform cursor-default`}>
           {card.severity} Priority
         </div>
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

  // Builder Journey States
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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

    try {
      if (!resumeFile) {
        throw new Error("Please upload a PDF resume");
      }
      if (!jobDescription.trim()) {
        throw new Error("Please enter the job description");
      }

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

    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "An error occurred";
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
      // Auto-scroll to results if analysis succeeded
      setTimeout(() => {
        if (!error && !loading) {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
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
    <div className="relative min-h-screen flex flex-col trex-font-nunito text-gray-100 selection:bg-orange-500/30">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#232228]">
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[600px] bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[60%] h-[700px] bg-blue-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[500px] bg-red-500/5 rounded-full blur-[130px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#151419]/80 backdrop-blur-xl px-6 md:px-12 py-4 flex justify-between items-center border-b border-white/5">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
          trex<span className="text-orange-500">.ai</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-[13px] font-semibold text-gray-400 tracking-wide">
          <Link href="/" className="hover:text-white transition">HOME</Link>
          <span className="text-white border-b-2 border-orange-500 pb-0.5">RESUME AI</span>
        </div>
        <Link href="/">
          <button className="btn-premium px-6 py-2.5 rounded-full text-sm font-medium">
            Back to Home
          </button>
        </Link>
      </nav>

      {/* Page Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full pt-36 px-6 pb-20 space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">Senior AI Resume Review</h1>
          <p className="text-gray-400 text-lg">Expert-level analysis driven by a sharp Senior HR + Technical persona.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-[#151419] rounded-[2rem] border border-white/5 shadow-2xl p-8 space-y-6">
            <h2 className="text-lg font-bold text-white mb-4">Your Resume (PDF)</h2>
            <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-800 rounded-2xl bg-[#0f0e13]/50 hover:bg-[#0f0e13] transition p-6">
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 transition-all cursor-pointer"
              />
              {!resumeFile && <p className="text-[10px] uppercase font-bold text-gray-600 mt-6 tracking-widest text-center">Only PDFs up to 5MB supported.</p>}
              {resumeFile && <p className="text-sm font-bold text-green-400 mt-6 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20">Selected: {resumeFile.name}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="use-ai" 
                checked={useAI} 
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 text-orange-500 accent-orange-500 rounded border-gray-800 bg-gray-900"
              />
              <label htmlFor="use-ai" className="text-xs text-gray-400 font-bold uppercase tracking-wider cursor-pointer">
                Enable Senior AI Review (Deep & Brutal)
              </label>
            </div>
          </div>

          <div className="bg-[#151419] rounded-[2rem] border border-white/5 shadow-2xl p-8 space-y-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              className="flex-1 w-full min-h-[256px] bg-[#0f0e13]/50 border border-gray-800 rounded-2xl p-6 text-gray-300 focus:ring-1 focus:ring-orange-500/50 outline-none shadow-inner transition-all resize-none placeholder:text-gray-700"
              aria-label="Job description"
            />
            <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest">
              Tip: Include full context for better analysis.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 justify-center pt-6">
          <Button
            onClick={analyzeResume}
            disabled={loading || !resumeFile || !jobDescription.trim()}
            className="px-10 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
          >
            {loading ? "Processing AI Review..." : "Analyze Now"}
          </Button>
          <Button
            onClick={handleClear}
            disabled={loading}
            className="px-10 h-14 bg-[#151419] border border-gray-800 text-gray-400 rounded-full text-lg font-bold hover:bg-[#1f1e24] transition-all"
          >
            Clear
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Overall Score section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Match Score */}
              <div className="bg-[#151419] p-10 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center gap-6 shadow-2xl">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">ATS Match Integrity</p>
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#222" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={analysis.overall_score >= 80 ? "#22c55e" : analysis.overall_score >= 60 ? "#f97316" : "#ef4444"}
                      strokeWidth="6"
                      strokeDasharray={`${(analysis.overall_score / 100) * 263.8} 263.8`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-white tracking-tighter">{analysis.overall_score}%</span>
                  </div>
                </div>
              </div>

              {/* Sub Scores */}
              <div className="bg-[#151419] md:col-span-2 p-10 rounded-[2rem] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-8">Metric Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.entries(analysis.section_scores).map(([key, value]) => (
                    <div key={key} className="bg-[#0f0e13]/80 p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:bg-[#0f0e13] transition-colors group">
                      <span className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{value}</span>
                      <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{key.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Senior Review Cards */}
            {analysis.ai_feedback && (
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                   <div className="h-px flex-1 bg-gray-800"></div>
                   <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.4em] px-4">The Senior Report</h2>
                   <div className="h-px flex-1 bg-gray-800"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <AICardComponent card={analysis.ai_feedback.overall_match} />
                   <AICardComponent card={analysis.ai_feedback.resume_weaknesses} />
                   <AICardComponent card={analysis.ai_feedback.section_review} />
                   <AICardComponent card={analysis.ai_feedback.role_alignment} />
                   <AICardComponent card={analysis.ai_feedback.project_review} />
                   <AICardComponent card={analysis.ai_feedback.roadmap} />
                   <AICardComponent card={analysis.ai_feedback.application_strategy} />
                   <AICardComponent card={analysis.ai_feedback.final_verdict} />
                </div>

                {/* Final Suggestions Engine */}
                <div className="bg-[#151419] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative p-10">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp className="w-48 h-48" />
                  </div>
                  
                  <div className="relative z-10 space-y-8">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                      <TrendingUp className="w-8 h-8 text-orange-500" />
                      Priority Action Plan
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div>
                         <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Urgent Structural Fixes</p>
                         <ul className="space-y-4">
                           {analysis.ai_feedback.suggested_resume_changes.slice(0, 5).map((change, idx) => (
                             <li key={idx} className="flex items-start gap-4 text-sm text-gray-300">
                               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-[10px] font-bold border border-orange-500/20">
                                 {idx + 1}
                               </span>
                               {change}
                             </li>
                           ))}
                         </ul>
                       </div>
                       <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex flex-col justify-center">
                         <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Strategic Insight</p>
                         <p className="text-sm text-gray-400 leading-relaxed italic">
                           "The most impactful change you can make right now is focusing on the <span className="text-white font-bold">{analysis.ai_feedback.role_alignment.title}</span> action items. Addressing these will increase your interview callback rate by an estimated 40% for roles in this domain."
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keyword and Structure Sections (Preserved) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-gray-800/50">
               {/* Architecture and Body Sections */}
               <div className="bg-[#151419] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Resume Architecture</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Detected Sections</p>
                    <div className="flex flex-wrap gap-2">
                       {analysis.detected_sections.map(sec => (
                         <span key={sec} className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase">{sec}</span>
                       ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Missing Critical Sections</p>
                    <div className="flex flex-wrap gap-2">
                       {analysis.missing_sections.map(sec => (
                         <span key={sec} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase">{sec}</span>
                       ))}
                       {analysis.missing_sections.length === 0 && <span className="text-xs text-green-400 font-medium">Standard structure verified.</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div className="bg-[#151419] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Keywords Found ({analysis.matched_keywords.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {analysis.matched_keywords.map((keyword) => (
                    <span key={keyword} className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Missing Keywords */}
              <div className="bg-[#151419] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Missing Keywords ({analysis.missing_keywords.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {analysis.missing_keywords.map((keyword) => (
                    <span key={keyword} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {keyword}
                    </span>
                  ))}
                  {analysis.missing_keywords.length === 0 && <span className="text-xs text-green-400 font-medium">JD keyword targets met!</span>}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-[#151419] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6">System Warnings</h3>
                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <ul className="space-y-4">
                    {analysis.improvement_suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black uppercase">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-gray-400 leading-relaxed font-medium">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">Upload your PDF and paste a job description above to score yourself</p>
              <p className="text-gray-400 text-sm">Our ATS pipeline will review keywords, formatting, sections, and provide AI feedback.</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-500 text-lg font-medium">Running pipeline...</p>
              <p className="text-gray-400 text-sm mt-2">Checking sections, ATS formatting, and keyword matching.</p>
            </div>
          </div>
        )}
      </main>

      {/* Builder Journey Components */}
      <TrexBotIcon onClick={() => setIsChatOpen(true)} isOpen={isChatOpen} />
      <ResumeChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        onSubmit={startBuildingJourney} 
      />
    </div>
    )}
    </ProtectedRoute>
  );
}
