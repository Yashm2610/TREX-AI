"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Custom SVG Icons to prevent version mismatch or compilation issues
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

interface DevProfileProps {
  name: string;
  role: string;
  imageSrc: string;
  fallbackInitials: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

const DevProfile: React.FC<DevProfileProps> = ({
  name,
  role,
  imageSrc,
  fallbackInitials,
  githubUrl,
  linkedinUrl,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center group text-center"
    >
      {/* Oval Photo Container */}
      <div className="relative w-24 h-32 rounded-[50%/40%] overflow-hidden bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 border-2 border-white/10 group-hover:border-blue-500/50 shadow-lg group-hover:shadow-blue-500/10 transition-all duration-300 flex items-center justify-center">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
        
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 text-white select-none">
            <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {fallbackInitials}
            </span>
          </div>
        )}
      </div>

      {/* Developer Details */}
      <div className="mt-4 space-y-1">
        <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors duration-300">
          {name}
        </h4>
        <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">
          {role}
        </p>
      </div>

      {/* Developer Social Links */}
      <div className="flex gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-white transition-colors"
            title="GitHub"
          >
            <GithubIcon className="w-3.5 h-3.5" />
          </a>
        )}
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-white transition-colors"
            title="LinkedIn"
          >
            <LinkedinIcon className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-slate-950 border-t border-white/5 text-slate-400 py-16 px-6 md:px-12 mt-auto">
      {/* Background ambient light */}
      <div className="absolute bottom-0 left-[10%] w-[40%] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-[15%] w-[30%] h-[200px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
        
        {/* Left Section: Branding & Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="text-2xl font-black tracking-tighter text-white">
            trex<span className="text-blue-500">.ai</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
            Total Relocation & Employment eXpert. India's premier AI-native career and relocation intelligence platform. Powered by frontier-class models to deliver real-time data-backed insights.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 tracking-widest uppercase">
            <MapPinIcon className="w-3.5 h-3.5 text-blue-500" /> Made for India
          </div>
        </div>

        {/* Middle Section: Quick Navigation Links */}
        <div className="md:col-span-4 grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h5 className="text-[10px] font-black tracking-[0.2em] text-white uppercase">
              Modules
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/resume" className="hover:text-white transition-colors">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link href="/city" className="hover:text-white transition-colors">
                  City Cost Analyzer
                </Link>
              </li>
              <li>
                <Link href="/career" className="hover:text-white transition-colors">
                  Career Matchmaker
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-black tracking-[0.2em] text-white uppercase">
              Platform
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#why" className="hover:text-white transition-colors">
                  Why We Exist
                </Link>
              </li>
              <li>
                <Link href="/#goal" className="hover:text-white transition-colors">
                  Our Goal
                </Link>
              </li>
              <li>
                <Link href="/my-resumes" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Section: Meet the Developers (Oval Photos) */}
        <div className="md:col-span-4 space-y-6">
          <h5 className="text-[10px] font-black tracking-[0.2em] text-white uppercase text-center md:text-left">
            Meet the Developers
          </h5>
          <div className="flex justify-center md:justify-start gap-8">
            <DevProfile
              name="Yash Mathur"
              role="Co-Founder & Developer"
              imageSrc="/yash.jpg"
              fallbackInitials="YM"
              githubUrl="https://github.com/yashmathur"
              linkedinUrl="https://linkedin.com/in/yashmathur"
            />
            <DevProfile
              name="Mayank Dadheech"
              role="Co-Founder & Developer"
              imageSrc="/mayank.jpg"
              fallbackInitials="MD"
              githubUrl="https://github.com/mayankdadheech"
              linkedinUrl="https://linkedin.com/in/mayankdadheech"
            />
          </div>
        </div>

      </div>

      {/* Footer Bottom copyright and heart */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-[10px] font-bold text-slate-600 tracking-wider uppercase">
        <div>
          &copy; {new Date().getFullYear()} T.R.E.X Project. All Rights Reserved.
        </div>
        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
          Built with <HeartIcon className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by T.R.E.X Dev Team
        </div>
      </div>
    </footer>
  );
}
