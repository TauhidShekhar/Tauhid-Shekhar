import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaBrain, FaCompass, FaCode, FaBriefcase, FaSun, FaMoon, FaTimes 
} from 'react-icons/fa';

const CommandPalette = ({ isOpen, onClose, isDark, toggleTheme }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { 
      id: 'theme', 
      title: 'Toggle Dark/Light Mode', 
      description: 'Switch between light and dark theme aesthetics', 
      icon: isDark ? <FaSun className="text-amber-400" /> : <FaMoon className="text-indigo-400" />,
      action: () => {
        toggleTheme();
        onClose();
      }
    },
    { 
      id: 'ai', 
      title: 'Ask AI Consultant', 
      description: 'Open AI Career & Coding Assistant chat workspace', 
      icon: <FaBrain className="text-purple-400" />,
      action: () => {
        navigate('/community/ai-assistant');
        onClose();
      }
    },
    { 
      id: 'challenges', 
      title: 'Daily Arena Challenges', 
      description: 'Practice programming challenges to earn Coins', 
      icon: <FaCode className="text-green-400" />,
      action: () => {
        navigate('/community/challenges');
        onClose();
      }
    },
    { 
      id: 'explore', 
      title: 'Explore Projects & Feed', 
      description: 'Browse other developers projects and publications', 
      icon: <FaCompass className="text-blue-400" />,
      action: () => {
        navigate('/community/projects');
        onClose();
      }
    },
    { 
      id: 'jobs', 
      title: 'Open Career Tracker', 
      description: 'Manage cover letters, job lists, and resume scans', 
      icon: <FaBriefcase className="text-orange-400" />,
      action: () => {
        navigate('/community/career-hub');
        onClose();
      }
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Palette Body */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#121217]/95 shadow-2xl shadow-purple-950/20 text-[#f1f1f5] flex flex-col max-h-[350px]">
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
          <FaSearch className="text-slate-400 text-sm shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or query..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none text-xs text-white placeholder-slate-450 focus:outline-none"
          />
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FaTimes size={12} />
          </button>
        </div>

        {/* Command Items List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredCommands.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredCommands.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    idx === selectedIndex 
                      ? 'bg-purple-600/20 border-l-2 border-purple-500 text-white pl-4' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="text-sm shrink-0">{cmd.icon}</div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black leading-none">{cmd.title}</span>
                    <span className="text-[10px] text-slate-450 mt-1">{cmd.description}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-bold">
              No matching commands or actions found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#09090c]/50 flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <span>Search global routes and actions</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↑↓</kbd> to navigate
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">Enter</kbd> to select
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
