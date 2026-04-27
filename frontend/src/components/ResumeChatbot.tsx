"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, Trophy, Globe, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ResumeChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ResumeChatbot: React.FC<ResumeChatbotProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [resumeData, setResumeData] = useState<any>({
    personal_info: {},
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    languages: []
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const questions = [
    { field: "name", label: "What is your full name?", icon: <User className="w-4 h-4" /> },
    { field: "email", label: "Your email address?", icon: <Mail className="w-4 h-4" /> },
    { field: "phone", label: "Phone number?", icon: <Phone className="w-4 h-4" /> },
    { field: "location", label: "Where are you based? (City, Country)", icon: <MapPin className="w-4 h-4" /> },
    { field: "github", label: "GitHub profile URL?", icon: <Globe className="w-4 h-4" /> },
    { field: "linkedin", label: "LinkedIn profile URL?", icon: <Globe className="w-4 h-4" /> },
    { field: "summary", label: "Briefly describe your career goal or a short bio.", icon: <Briefcase className="w-4 h-4" /> },
    { field: "experience", label: "Tell me about your work experience. (e.g. 'Software Engineer at Google, 2020-2022. Built X...')", icon: <Briefcase className="w-4 h-4" /> },
    { field: "education", label: "Your educational background? (College, Degree, Year)", icon: <GraduationCap className="w-4 h-4" /> },
    { field: "skills", label: "List your top technical skills, separated by commas.", icon: <Code className="w-4 h-4" /> },
    { field: "projects", label: "Any notable projects you've worked on?", icon: <Trophy className="w-4 h-4" /> },
    { field: "achievements", label: "Any certifications or achievements?", icon: <Award className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hi! I'm TREX. Let's build your professional resume step by step.");
      addBotMessage(questions[0].label);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { type: 'bot', text }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const currentQuestion = questions[step];
    addUserMessage(inputValue);

    // Update resume data based on step
    const updatedData = { ...resumeData };
    if (step < 6) {
        updatedData.personal_info[currentQuestion.field] = inputValue;
    } else if (currentQuestion.field === 'summary') {
        updatedData.summary = inputValue;
    } else if (currentQuestion.field === 'experience') {
        // Simple parser for demo, AI will polish it
        updatedData.experience.push({ company: "Work", role: "Position", bullets: [inputValue] });
    } else if (currentQuestion.field === 'education') {
        updatedData.education.push({ institution: "University", degree: "Degree", field: inputValue });
    } else if (currentQuestion.field === 'skills') {
        updatedData.skills = inputValue.split(',').map(s => s.trim());
    } else if (currentQuestion.field === 'projects') {
        updatedData.projects.push({ name: "Project", description: inputValue });
    } else if (currentQuestion.field === 'achievements') {
        updatedData.achievements.push(inputValue);
    }
    setResumeData(updatedData);

    setInputValue("");
    
    if (step < questions.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setTimeout(() => addBotMessage(questions[nextStep].label), 500);
    } else {
      addBotMessage("Great! I have enough info to start building. Ready to see the magic?");
      addBotMessage("Click 'Generate Resume' to proceed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#151419] w-full max-w-lg h-[600px] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f0e13]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-tight">TREX Resume Bot</h3>
              <p className="text-[10px] text-orange-500/80 font-black uppercase tracking-widest">Active Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                msg.type === 'user' 
                  ? 'bg-orange-500 text-white rounded-tr-none' 
                  : 'bg-[#1f1e24] text-gray-300 border border-white/5 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/5 bg-[#0f0e13]/50">
          {step === questions.length - 1 && messages[messages.length-1]?.type === 'bot' && (
            <Button 
                onClick={() => onSubmit(resumeData)}
                className="w-full mb-4 bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl"
            >
                Generate Resume
            </Button>
          )}
          <div className="relative flex items-center">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer..."
              className="w-full bg-[#0f0e13] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-orange-500/50 transition-colors pr-12"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 p-1.5 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeChatbot;
