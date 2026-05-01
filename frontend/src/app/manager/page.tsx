"use client";

import React, { useEffect, useState } from "react";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { 
  Card, CardHeader, CardTitle, CardContent 
} from "@/components/ui/card";
import { 
  Users, Briefcase, Filter, Search, 
  ArrowUpRight, Mail, MapPin, Calendar, 
  ChevronRight, LayoutDashboard, Settings,
  LogOut, Shield, TrendingUp
} from "lucide-react";

interface MatchSubmission {
  id: string;
  userEmail: string;
  targetRole: string;
  preferredLocation: string;
  matchScore: number;
  missingSkills: string[];
  jobReadinessScore: number;
  createdAt: any;
  resumeFileName: string;
}

export default function ManagerDashboard() {
  const [submissions, setSubmissions] = useState<MatchSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const q = query(
          collection(db, "careerMatches"),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MatchSubmission[];
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(s => 
    s.targetRole.toLowerCase().includes(filterRole.toLowerCase())
  );

  return (
    <RoleProtectedRoute allowedRoles={["manager", "admin"]}>
      <div className="flex min-h-screen bg-gray-50/50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="p-8">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
              trex<span className="text-blue-500">.ai</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">General</div>
            <Link href="/manager" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-medium transition-all">
              <Users className="w-4 h-4" />
              Applicants
            </Link>
            <div className="px-4 py-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">System</div>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-medium transition-all">
              <Shield className="w-4 h-4" />
              Roles & Access
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-medium transition-all">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-100">
             <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all">
              <LogOut className="w-4 h-4" />
              Exit Dashboard
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search submissions by role..."
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  LIVE FEED
               </div>
            </div>
          </header>

          <div className="p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applicant Pipeline</h1>
                <p className="text-sm text-gray-500">Monitor career matchmaking submissions and match scores.</p>
              </div>
              <div className="flex gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filters
                 </button>
                 <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold shadow-lg shadow-gray-900/10 hover:bg-gray-800">
                    Export CSV
                 </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Applications", value: submissions.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "High Matches (>80%)", value: submissions.filter(s => s.matchScore >= 80).length, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Average Readiness", value: submissions.length ? Math.round(submissions.reduce((acc, curr) => acc + curr.jobReadinessScore, 0) / submissions.length) + "%" : "0%", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "Active Roles", value: new Set(submissions.map(s => s.targetRole)).size, icon: LayoutDashboard, color: "text-purple-500", bg: "bg-purple-50" },
              ].map((stat, idx) => (
                <Card key={idx} className="border-none shadow-sm overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                         +12% <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submissions Table */}
            <Card className="border-none shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applicant</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Role</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match Score</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Readiness</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 bg-white">
                     {loading ? (
                        <tr>
                           <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm italic">Loading pipeline data...</td>
                        </tr>
                     ) : filteredSubmissions.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm italic">No submissions found matching filters.</td>
                        </tr>
                     ) : filteredSubmissions.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                    {s.userEmail ? s.userEmail[0] : "?"}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{s.userEmail || "Anonymous"}</span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold">
                                       <Mail className="w-3 h-3" /> {s.resumeFileName ? s.resumeFileName.slice(0, 15) + "..." : "No File"}
                                    </span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col">
                                 <span className="text-sm font-semibold text-gray-800">{s.targetRole}</span>
                                 <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold">
                                    <MapPin className="w-3 h-3" /> {s.preferredLocation}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                 <span className={`text-sm font-black ${s.matchScore >= 80 ? 'text-emerald-500' : s.matchScore >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                                    {s.matchScore}%
                                 </span>
                                 <div className="w-20 bg-gray-100 h-1 rounded-full overflow-hidden">
                                    <div className={`h-full ${s.matchScore >= 80 ? 'bg-emerald-500' : s.matchScore >= 60 ? 'bg-orange-500' : 'bg-red-50'}`} style={{ width: `${s.matchScore}%` }}></div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{s.jobReadinessScore}%</span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                 <Calendar className="w-3 h-3" />
                                 {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : "Just Now"}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                 <ChevronRight className="w-5 h-5" />
                              </button>
                           </td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </Card>
          </div>
        </main>
      </div>
    </RoleProtectedRoute>
  );
}
