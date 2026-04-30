"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, ExternalLink, FileText, X, AlertCircle } from "lucide-react";

export default function MyResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "users", user!.uid, "resumes"),
        orderBy("uploadedAt", "desc")
      );
      
      // 8 second timeout for Firebase connection
      const getDocsPromise = getDocs(q);
      const snapshot = await Promise.race([
        getDocsPromise,
        new Promise<any>((_, reject) => 
          setTimeout(() => reject("FIREBASE_TIMEOUT"), 8000)
        )
      ]);
      
      // Prevent unhandled promise rejection if getDocs fails after timeout
      getDocsPromise.catch(() => {});
      
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResumes(data);
    } catch (e: any) {
      console.error("Error fetching resumes:", e);
      if (e === "FIREBASE_TIMEOUT" || e?.message === "FIREBASE_TIMEOUT" || e?.code === "unavailable") {
        setError("Could not connect to database. Please ensure Firestore Database is enabled in your Firebase Console.");
      } else {
        setError("Failed to load your resumes. " + (e?.message || e || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved resume analysis?")) return;
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "users", user!.uid, "resumes", id));
      
      // Refresh list
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error("Error deleting resume analysis:", e);
      alert("Failed to delete the resume analysis.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen flex flex-col font-sans text-gray-900 selection:bg-orange-200">
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#fdfdfd]">
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[600px] bg-gradient-to-br from-orange-100/80 to-amber-50/40 rounded-full blur-[120px]" />
        </div>

        <nav className="fixed top-0 w-full z-50 glass-nav px-6 md:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
            trex<span className="text-orange-500">.ai</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[13px] font-semibold text-gray-600 tracking-wide">
            <Link href="/" className="hover:text-black transition">HOME</Link>
            <span className="text-black border-b-2 border-orange-500 pb-0.5">MY RESUMES</span>
          </div>
          <Link href="/">
            <button className="btn-premium px-6 py-2.5 rounded-full text-sm font-medium">
              Back to Home
            </button>
          </Link>
        </nav>

        <main className="flex-1 max-w-6xl mx-auto w-full pt-36 px-6 pb-20 space-y-10">
          <div className="flex flex-col space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Saved Resumes</h1>
            <p className="text-gray-500">View and manage your past AI resume reviews.</p>
          </div>

          {loading ? (
             <div className="flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg border border-red-100 shadow-lg shadow-red-100/50">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="font-bold text-lg mb-2">Connection Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-700">No resumes saved yet</p>
                <p className="text-sm text-gray-500">Go to Resume AI and analyze a resume to save it here.</p>
              </div>
              <Link href="/resume">
                <button className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                  Go to Resume Analyzer
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="glass shadow-xl shadow-gray-200/50 hover:shadow-orange-100 transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-gray-800 line-clamp-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      {resume.fileName || "Untitled Resume"}
                    </CardTitle>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {resume.uploadedAt ? new Date(resume.uploadedAt.toDate()).toLocaleDateString() : 'Just now'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white" 
                           style={{ backgroundColor: resume.overallScore >= 80 ? '#22c55e' : resume.overallScore >= 60 ? '#f97316' : '#ef4444' }}>
                        {resume.overallScore || 0}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Score</p>
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">ATS Match Integrity</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setSelectedAnalysis(resume.analysisResult)} className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold text-xs rounded-lg transition-colors">
                        <FileText className="w-4 h-4" /> View Analysis
                      </button>
                      <button onClick={() => handleDelete(resume.id)} className="flex items-center justify-center gap-2 w-full py-2 text-red-500 hover:bg-red-50 font-bold text-xs rounded-lg transition-colors mt-2">
                        <Trash2 className="w-4 h-4" /> Delete Record
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Simple Modal for viewing analysis */}
        {selectedAnalysis && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Analysis Snapshot
                </h3>
                <button onClick={() => setSelectedAnalysis(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                 {/* Only rendering a basic summary here to avoid copy-pasting the massive 300 line UI. */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedAnalysis.section_scores && Object.entries(selectedAnalysis.section_scores).map(([key, val]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded border border-gray-100 text-center">
                        <p className="text-xl font-bold text-gray-800">{val as string}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace('_', ' ')}</p>
                      </div>
                    ))}
                 </div>
                 
                 {selectedAnalysis.ai_feedback?.suggested_resume_changes && (
                   <div className="mt-6">
                     <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">AI Priority Action Plan</p>
                     <ul className="space-y-2">
                       {selectedAnalysis.ai_feedback.suggested_resume_changes.map((change: string, idx: number) => (
                         <li key={idx} className="flex gap-2 text-sm text-gray-700 bg-orange-50/50 p-3 rounded-lg border border-orange-100/50">
                            <span className="font-bold text-orange-400">{idx+1}.</span>
                            {change}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">To see full details</p>
                    <p className="text-sm text-gray-600">Re-analyze this resume with the job description in the Resume AI tool for the complete neural assessor experience.</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
