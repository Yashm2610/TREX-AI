"use client";

import React from 'react';
import { Bot } from 'lucide-react';

interface TrexBotIconProps {
  onClick: () => void;
  isOpen: boolean;
}

const TrexBotIcon: React.FC<TrexBotIconProps> = ({ onClick, isOpen }) => {
  return (
    <div 
      className="fixed bottom-8 right-8 z-[100]"
      onClick={onClick}
    >
      <button 
        className={`relative group flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90' : ''}`}
        aria-label="Open TREX Resume Builder"
      >
        {/* Pulsing effect */}
        <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20 group-hover:opacity-40"></span>
        
        <Bot className="w-8 h-8 relative z-10" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-4 py-2 bg-[#151419] border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
          Build with TREX AI
        </div>
      </button>
    </div>
  );
};

export default TrexBotIcon;
