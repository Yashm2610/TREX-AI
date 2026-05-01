"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { 
  Card, CardHeader, CardTitle, CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, MapPin, TrendingUp, Sparkles, 
  UploadCloud, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, ExternalLink, 
  BarChart3, Globe, ShieldCheck, Zap
} from "lucide-react";

interface JobMatch {
  role: str;
  match_score: number;
  missing_skills: string[];
  skills_to_learn: string[];
  description: string;
}

interface CareerAnalysisResult {
  recommended_roles: JobMatch[];
  overall_match_score: number;
  missing_skills: string[];
  skills_to_learn: string[];
  improvement_suggestions: string[];
  job_readiness_score: number;
  roadmap: string[];
  extracted_skills: string[];
  sample_jobs?: any[];
}

export default function CareerMatchmaker() {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [expLevel, setExpLevel] = useState("entry");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("full-time");
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CareerAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const analyzeCareer = async () => {
    setLoading(true);
    setError("");
    setAnalysis(null);
    setShowLoginPrompt(false);

    try {
      if (!resumeFile) throw new Error("Please upload a PDF resume");
      if (!targetRole) throw new Error("Please enter your target role");
      if (!location) throw new Error("Please enter your preferred location");

      const formData = new FormData();
      formData.append("resume_file", resumeFile);
      formData.append("target_role", targetRole);
      formData.append("location", location);
      formData.append("experience_level", expLevel);
      formData.append("expected_salary", salary);
      formData.append("job_type", jobType);

      const res = await fetch("http://localhost:8000/api/career/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to analyze career match");
      }

      const data: CareerAnalysisResult = await res.json();
      setAnalysis(data);

      if (user) {
        const matchId = crypto.randomUUID();
        await setDoc(doc(db, "careerMatches", matchId), {
          uid: user.uid,
          userEmail: user.email,
          targetRole,
          preferredLocation: location,
          experienceLevel: expLevel,
          expectedSalary: salary,
          jobType,
          resumeFileName: resumeFile.name,
          extractedSkills: data.extracted_skills,
          matchScore: data.overall_match_score,
          missingSkills: data.missing_skills,
          recommendedJobs: data.recommended_roles,
          improvementSuggestions: data.improvement_suggestions,
          jobReadinessScore: data.job_readiness_score,
          createdAt: serverTimestamp(),
        });
      } else {
        setShowLoginPrompt(true);
      }

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (!error && !loading) {
          window.scrollTo({ top: 800, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const generateJobLinks = (role: string, loc: string) => {
    const q = encodeURIComponent(role);
    const l = encodeURIComponent(loc);
    return [
      { name: "Internshala", url: `https://internshala.com/jobs/${q.toLowerCase().replace(/ /g, '-')}-jobs-in-${l.toLowerCase().replace(/ /g, '-')}`, color: "text-blue-500" },
      { name: "Indeed", url: `https://www.indeed.co.in/jobs?q=${q}&l=${l}`, color: "text-blue-700" },
      { name: "LinkedIn", url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`, color: "text-sky-600" },
      { name: "Naukri", url: `https://www.naukri.com/${q.toLowerCase().replace(/ /g, '-')}-jobs-in-${l.toLowerCase().replace(/ /g, '-')}`, color: "text-blue-900" },
    ];
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-gray-900 selection:bg-emerald-200">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#fdfdfd]">
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[600px] bg-gradient-to-br from-emerald-100/80 to-teal-50/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[60%] h-[700px] bg-emerald-100/40 rounded-full blur-[140px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-nav px-6 md:px-12 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
          trex<span className="text-emerald-500">.ai</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-[13px] font-semibold text-gray-600 tracking-wide">
          <Link href="/" className="hover:text-black transition">HOME</Link>
          <span className="text-black border-b-2 border-emerald-500 pb-0.5 uppercase">Career AI</span>
        </div>
        <Link href="/">
          <button className="btn-premium px-6 py-2.5 rounded-full text-sm font-medium">
            Back to Home
          </button>
        </Link>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full pt-36 px-6 pb-20 space-y-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold tracking-widest animate-pulse">
            <Sparkles className="w-3 h-3" />
            CAREER INTELLIGENCE ENGINE
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Discover Your Perfect Role</h1>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
            Map your skills to the market. Get a precise match score, identify skill gaps, and get a roadmap to your dream career.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form Section */}
          <Card className="glass shadow-xl shadow-gray-200/50 border-white/40">
            <CardHeader className="border-b border-gray-100/50 bg-gray-50/30">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                Career Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Role</label>
                <input 
                  type="text" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preferred Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience Level</label>
                  <select 
                    value={expLevel} 
                    onChange={(e) => setExpLevel(e.target.value)}
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="internship">Internship</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Type</label>
                  <select 
                    value={jobType} 
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Salary (Annual)</label>
                <input 
                  type="text" 
                  value={salary} 
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 12-15 LPA"
                  className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload Section */}
          <Card className="glass shadow-xl shadow-gray-200/50 border-white/40 overflow-hidden">
             <CardHeader className="border-b border-gray-100/50 bg-gray-50/30">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Resume Document
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 flex flex-col items-center justify-center h-full min-h-[300px]">
               <div 
                className={`group relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-2xl transition-all duration-300 bg-white/50
                  ${resumeFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/10'}`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {!resumeFile ? (
                  <div className="flex flex-col items-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                       <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 uppercase">Drop Resume</p>
                      <p className="text-xs text-gray-400 mt-1">PDF ONLY • MAX 2MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-6 space-y-4">
                    <FileText className="w-12 h-12 text-emerald-500" />
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{resumeFile.name}</p>
                    <button onClick={() => setResumeFile(null)} className="text-[10px] font-bold text-red-500 uppercase z-20">Remove</button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={analyzeCareer}
            disabled={loading || !resumeFile || !targetRole}
            className="w-full md:w-80 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl shadow-emerald-500/20 text-lg font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Find My Match"}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {showLoginPrompt && (
          <div className="flex justify-center">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              LOGIN TO SAVE YOUR CAREER ANALYSIS
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-12 pt-10 animate-in fade-in duration-700">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass border-emerald-200">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Alignment</p>
                  <div className="text-5xl font-black text-emerald-600">{analysis.overall_match_score}%</div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${analysis.overall_match_score}%` }}></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-blue-200">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Readiness</p>
                  <div className="text-5xl font-black text-blue-600">{analysis.job_readiness_score}%</div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${analysis.job_readiness_score}%` }}></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-orange-200">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skills Extracted</p>
                  <div className="text-5xl font-black text-orange-500">{analysis.extracted_skills.length}</div>
                  <p className="text-[10px] text-gray-400 font-medium">Verified technical entities</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance & Skill Gaps */}
            <div id="performance" className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="glass border-white/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    Skill Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Critical Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-[11px] font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Priority Skills to Learn</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills_to_learn.map(s => (
                        <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <TrendingUp className="w-32 h-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                    Growth Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.roadmap.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Job Match Cards */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest px-4">Market Opportunities</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.recommended_roles.map((job, idx) => (
                    <Card key={idx} className="group glass hover:border-emerald-500/50 transition-all duration-300">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{job.role}</h3>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">{job.match_score}% Match</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-3">{job.description}</p>
                        <div className="pt-2">
                           <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Target Skills</p>
                           <div className="flex flex-wrap gap-1">
                             {job.missing_skills.slice(0, 3).map(s => (
                               <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-medium">{s}</span>
                             ))}
                           </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                           {generateJobLinks(job.role, location).map(link => (
                             <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`text-[11px] font-bold ${link.color} hover:underline flex items-center gap-1`}>
                               Search {link.name} <ExternalLink className="w-3 h-3" />
                             </a>
                           ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {/* Demo Cards if internal dataset requested */}
                  <Card className="group glass border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Globe className="w-6 h-6 text-emerald-500" />
                     </div>
                     <p className="text-sm font-bold text-gray-800">More Roles Found</p>
                     <p className="text-xs text-gray-400 mt-1">We found 8 other potential roles matching your profile.</p>
                     <Button className="mt-4 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-[11px] font-bold px-4 py-2 rounded-xl">View Advanced Report</Button>
                  </Card>
               </div>
            </div>

            {/* Sample Jobs / Market Trends */}
            {analysis.sample_jobs && analysis.sample_jobs.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest px-4">Market Trends</h2>
                    <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {analysis.sample_jobs.map((job, idx) => (
                    <Card key={idx} className="glass border-emerald-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                           <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{job.type}</span>
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{job.match_score}% MATCH</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{job.role}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{job.company}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] font-medium text-gray-500">
                           <MapPin className="w-3 h-3" /> {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                           <Zap className="w-3 h-3" /> {job.salary}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Section */}
            <Card className="glass border-emerald-500/20 bg-emerald-50/10">
               <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Resume Optimization Strategy
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <ul className="space-y-3">
                    {analysis.improvement_suggestions.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
               </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
