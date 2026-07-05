import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaRobot, FaBrain, FaPlus, FaTrash, FaEdit, FaStar, FaCheck,
  FaCheckCircle, FaExclamationTriangle, FaCode, FaFileAlt, 
  FaPaperPlane, FaDownload, FaTools, FaChevronRight, FaRegStar
} from 'react-icons/fa';

const AIConsultant = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [credits, setCredits] = useState(10);
  
  // New chat creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatCategory, setNewChatCategory] = useState('React Help');

  // Active chat inputs & scroll
  const [inputMsg, setInputMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleVal, setEditTitleVal] = useState('');
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  
  // Specialized Audit tools toggle (Quick Utility mode)
  const [utilityMode, setUtilityMode] = useState(false);
  const [activeUtilityTab, setActiveUtilityTab] = useState('code');

  // Audit tab inputs
  const [auditCode, setAuditCode] = useState('');
  const [auditLanguage, setAuditLanguage] = useState('Javascript');
  const [auditCodeOutput, setAuditCodeOutput] = useState(null);
  const [auditResumeText, setAuditResumeText] = useState('');
  const [auditResumeOutput, setAuditResumeOutput] = useState(null);
  const [auditTopic, setAuditTopic] = useState('');
  const [auditCategory, setAuditCategory] = useState('General');
  const [auditGenOutput, setAuditGenOutput] = useState('');
  const [utilityLoading, setUtilityLoading] = useState(false);

  const [audits, setAudits] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_ai_audits');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_ai_audits', JSON.stringify(audits));
    } catch (_) {}
  }, [audits]);

  const messagesEndRef = useRef(null);

  // Load chat histories
  const loadChats = async () => {
    try {
      const res = await api.getAIChats();
      if (res.success) {
        setChats(res.data || []);
        if (res.data && res.data.length > 0 && !activeChat) {
          // Default to first chat if none selected
          setActiveChat(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load AI chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadCredits = async () => {
    try {
      const res = await api.getRewardsDashboard();
      if (res.success) {
        setCredits(res.data.profile?.aiCredits || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadChats();
    loadCredits();
  }, []);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages, sendingMsg]);

  // Create chat session
  const handleCreateChat = async (e) => {
    if (e) e.preventDefault();
    try {
      const title = newChatTitle.trim() || `AI ${newChatCategory} Consultation`;
      const res = await api.createAIChat({ title, category: newChatCategory });
      if (res.success) {
        setChats(prev => [res.data, ...prev]);
        setActiveChat(res.data);
        setShowCreateModal(false);
        setNewChatTitle('');
        setUtilityMode(false); // Switch back from utility view
      }
    } catch (err) {
      alert(err.message || 'Failed to create chat.');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || !activeChat || sendingMsg) return;

    const userMessage = { role: 'user', content: inputMsg, timestamp: new Date() };
    
    // Optimistically update active chat UI
    const updatedMessages = [...activeChat.messages, userMessage];
    setActiveChat(prev => ({ ...prev, messages: updatedMessages }));
    setInputMsg('');
    setSendingMsg(true);

    try {
      const res = await api.sendAIChatMessage(activeChat._id, userMessage.content);
      if (res.success) {
        setActiveChat(res.data);
        setCredits(res.creditsLeft);
        // Sync local chat lists
        setChats(prev => prev.map(c => c._id === res.data._id ? res.data : c));
      }
    } catch (err) {
      alert(err.message || 'Failed to communicate with AI Assistant.');
      // Revert optimistic updates on failure
      loadChats();
    } finally {
      setSendingMsg(false);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (chat) => {
    try {
      const res = await api.updateAIChat(chat._id, { isBookmarked: !chat.isBookmarked });
      if (res.success) {
        setChats(prev => prev.map(c => c._id === chat._id ? { ...c, isBookmarked: res.data.isBookmarked } : c));
        if (activeChat && activeChat._id === chat._id) {
          setActiveChat(prev => ({ ...prev, isBookmarked: res.data.isBookmarked }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Rename chat
  const handleRenameChat = async (chatId) => {
    if (!editTitleVal.trim()) return;
    try {
      const res = await api.updateAIChat(chatId, { title: editTitleVal.trim() });
      if (res.success) {
        setChats(prev => prev.map(c => c._id === chatId ? { ...c, title: res.data.title } : c));
        if (activeChat && activeChat._id === chatId) {
          setActiveChat(prev => ({ ...prev, title: res.data.title }));
        }
        setEditingChatId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Delete this AI chat session permanently?')) return;
    try {
      const res = await api.deleteAIChat(chatId);
      if (res.success) {
        const remaining = chats.filter(c => c._id !== chatId);
        setChats(remaining);
        if (activeChat && activeChat._id === chatId) {
          setActiveChat(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Chat
  const handleExportChat = () => {
    if (!activeChat) return;
    const log = activeChat.messages.map(m => `[${m.role.toUpperCase()}] - ${new Date(m.timestamp).toLocaleTimeString()}\n${m.content}\n\n`).join('---\n\n');
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Consultation_${activeChat.category.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Audit Utility Methods ---
  const runCodeReview = async () => {
    if (!auditCode.trim()) return;
    setUtilityLoading(true);
    setAuditCodeOutput(null);
    try {
      const res = await api.aiReviewCode(auditCode, auditLanguage);
      if (res.success) {
        setAuditCodeOutput(res.data);
        setCredits(res.creditsLeft);
        
        const newAudit = {
          id: Date.now().toString(),
          type: 'code',
          title: `Code Audit (${auditLanguage} - Score: ${res.data.score}/100)`,
          timestamp: new Date(),
          inputs: { auditCode, auditLanguage },
          output: res.data
        };
        setAudits(prev => [newAudit, ...prev]);

        loadChats(); // refresh logs
      }
    } catch (err) {
      alert(err.message || 'Audit failed.');
    } finally {
      setUtilityLoading(false);
    }
  };

  const runResumeReview = async () => {
    if (!auditResumeText.trim()) return;
    setUtilityLoading(true);
    setAuditResumeOutput(null);
    try {
      const res = await api.aiReviewResume(auditResumeText);
      if (res.success) {
        setAuditResumeOutput(res.data);
        setCredits(res.creditsLeft);

        const newAudit = {
          id: Date.now().toString(),
          type: 'resume',
          title: `ATS Match (${res.data.overallScore}%)`,
          timestamp: new Date(),
          inputs: { auditResumeText },
          output: res.data
        };
        setAudits(prev => [newAudit, ...prev]);

        loadChats();
      }
    } catch (err) {
      alert(err.message || 'Resume audit failed.');
    } finally {
      setUtilityLoading(false);
    }
  };

  const runContentGenerator = async () => {
    if (!auditTopic.trim()) return;
    setUtilityLoading(true);
    setAuditGenOutput('');
    try {
      const res = await api.aiGenerateContent(auditTopic, auditCategory);
      if (res.success) {
        setAuditGenOutput(res.data);
        setCredits(res.creditsLeft);

        const newAudit = {
          id: Date.now().toString(),
          type: 'generator',
          title: `Post: ${auditTopic.length > 25 ? auditTopic.substring(0, 25) + '...' : auditTopic}`,
          timestamp: new Date(),
          inputs: { auditTopic, auditCategory },
          output: res.data
        };
        setAudits(prev => [newAudit, ...prev]);

        loadChats();
      }
    } catch (err) {
      alert(err.message || 'Generator failed.');
    } finally {
      setUtilityLoading(false);
    }
  };

  const displayChats = filterBookmarked ? chats.filter(c => c.isBookmarked) : chats;

  return (
    <div className="flex flex-col gap-6 text-left relative min-h-[600px] h-[calc(100vh-140px)]">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-3">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FaRobot className="text-purple-400" /> AI Developer Consultant
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
            Optimize code, evaluate ATS resumes, or chat with specialized developer assistants
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle audit tools */}
          <button
            onClick={() => setUtilityMode(!utilityMode)}
            className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
              utilityMode 
                ? 'bg-purple-650/15 border-purple-500/30 text-purple-400' 
                : 'bg-[#121217] border-white/5 text-slate-350 hover:text-white'
            }`}
          >
            <FaTools /> {utilityMode ? 'Open Chat Hub' : 'Audit Toolkits'}
          </button>

          {/* Credits Display */}
          <div className="px-4 py-2 bg-purple-650/10 border border-purple-500/15 rounded-xl text-[10px] font-black uppercase text-purple-400 flex items-center gap-1.5">
            <FaBrain /> {credits} AI Credits Left
          </div>
        </div>
      </div>

      {utilityMode ? (
        /* --- UTILITY AUDIT MODE --- */
        <div className="flex flex-col gap-5 bg-[#121217] border border-white/5 p-6 rounded-3xl flex-1 overflow-y-auto">
          <div className="flex gap-2 border-b border-white/5 pb-3">
            {['code', 'resume', 'generator'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveUtilityTab(tab)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeUtilityTab === tab 
                    ? 'bg-purple-650 text-white' 
                    : 'bg-[#181822] border border-white/5 text-slate-450 hover:text-white'
                }`}
              >
                {tab === 'code' && 'AI Code Audit'}
                {tab === 'resume' && 'ATS Resume score'}
                {tab === 'generator' && 'Post Generator'}
              </button>
            ))}
          </div>

          {activeUtilityTab === 'code' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white uppercase flex items-center gap-1"><FaCode /> Run Code Scan</span>
                <p className="text-[8px] text-slate-450 uppercase">Reviews architecture, syntax issues, and leaks. Cost: 1 credit.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <textarea
                  value={auditCode}
                  onChange={(e) => setAuditCode(e.target.value)}
                  placeholder="Paste component logic or queries here..."
                  className="w-full h-44 md:col-span-3 p-4 bg-[#181822] border border-white/5 rounded-2xl text-[10px] font-mono text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
                <div className="flex flex-col gap-3 justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Language</span>
                    <select
                      value={auditLanguage}
                      onChange={(e) => setAuditLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181822] border border-white/5 rounded-lg text-xs text-white"
                    >
                      <option>Javascript</option>
                      <option>Python</option>
                      <option>HTML/CSS</option>
                      <option>Java</option>
                      <option>Go Lang</option>
                    </select>
                  </div>
                  <button
                    disabled={utilityLoading || !auditCode.trim()}
                    onClick={runCodeReview}
                    className="w-full py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
                  >
                    {utilityLoading ? 'Analyzing...' : 'Run Audit'}
                  </button>
                </div>
              </div>

              {auditCodeOutput && (
                <div className="border-t border-white/5 pt-4 flex flex-col gap-3 animate-fade-in text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Analysis Output</span>
                    <span className="text-[9px] bg-purple-600/20 text-purple-400 border border-purple-500/10 px-2.5 py-0.5 rounded-full font-black">Score: {auditCodeOutput.score}/100</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#181822] border border-white/5">
                      <span className="text-[9px] text-green-400 font-black uppercase flex items-center gap-1"><FaCheckCircle /> Strengths</span>
                      <ul className="list-disc pl-4 text-slate-350 mt-1 flex flex-col gap-1 text-[10px]">
                        {auditCodeOutput.positives?.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#181822] border border-white/5">
                      <span className="text-[9px] text-yellow-500 font-black uppercase flex items-center gap-1"><FaExclamationTriangle /> Warnings</span>
                      <ul className="list-disc pl-4 text-slate-350 mt-1 flex flex-col gap-1 text-[10px]">
                        {auditCodeOutput.warnings?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeUtilityTab === 'resume' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white uppercase flex items-center gap-1"><FaFileAlt /> ATS Keyword Score</span>
                <p className="text-[8px] text-slate-450 uppercase">Inspects profile resume text alignments. Cost: 1 credit.</p>
              </div>
              <textarea
                value={auditResumeText}
                onChange={(e) => setAuditResumeText(e.target.value)}
                placeholder="Paste markdown experience descriptions here..."
                className="w-full h-36 p-4 bg-[#181822] border border-white/5 rounded-2xl text-[10px] font-mono text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              />
              <button
                disabled={utilityLoading || !auditResumeText.trim()}
                onClick={runResumeReview}
                className="self-end px-6 py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                {utilityLoading ? 'Analyzing...' : 'Evaluate Resume'}
              </button>

              {auditResumeOutput && (
                <div className="border-t border-white/5 pt-4 flex flex-col gap-3 animate-fade-in text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase font-black">Critique Analysis</span>
                    <span className="text-[9px] bg-purple-600/20 text-purple-400 border border-purple-500/10 px-2.5 py-0.5 rounded-full font-black">ATS Match: {auditResumeOutput.overallScore}%</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#181822] border border-white/5">
                      <span className="text-[9px] text-green-400 font-black uppercase flex items-center gap-1"><FaCheckCircle /> Strengths</span>
                      <ul className="list-disc pl-4 text-slate-350 mt-1 flex flex-col gap-1 text-[10px]">
                        {auditResumeOutput.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#181822] border border-white/5">
                      <span className="text-[9px] text-yellow-500 font-black uppercase flex items-center gap-1"><FaExclamationTriangle /> Gaps</span>
                      <ul className="list-disc pl-4 text-slate-350 mt-1 flex flex-col gap-1 text-[10px]">
                        {auditResumeOutput.gaps?.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeUtilityTab === 'generator' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white uppercase flex items-center gap-1"><FaRobot /> Engagement Social Generator</span>
                <p className="text-[8px] text-slate-450 uppercase">Generates clean markdown social copies. Cost: 1 credit.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Enter topic details (e.g. Hooks vs State)..."
                  value={auditTopic}
                  onChange={(e) => setAuditTopic(e.target.value)}
                  className="w-full md:col-span-3 px-4 py-2.5 rounded-xl bg-[#181822] border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <select
                  value={auditCategory}
                  onChange={(e) => setAuditCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#181822] border border-white/5 rounded-xl text-xs text-white"
                >
                  <option>General</option>
                  <option>Tutorials</option>
                  <option>QA Doubt</option>
                </select>
              </div>
              <button
                disabled={utilityLoading || !auditTopic.trim()}
                onClick={runContentGenerator}
                className="self-end px-6 py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                {utilityLoading ? 'Drafting...' : 'Generate social post'}
              </button>

              {auditGenOutput && (
                <div className="border-t border-white/5 pt-4 flex flex-col gap-2 text-xs">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Generated Post Code</span>
                  <div className="p-4 bg-[#181822] border border-white/5 rounded-2xl text-[10px] text-slate-200 leading-relaxed whitespace-pre-wrap select-all cursor-pointer">
                    {auditGenOutput}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Completed AI Audit Logs */}
          {audits.length > 0 && (
            <div className="border-t border-white/5 pt-5 mt-4 flex flex-col gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaCheckCircle className="text-purple-400" /> Completed AI Audit Logs
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {audits.map(audit => (
                  <div 
                    key={audit.id}
                    onClick={() => {
                      setActiveUtilityTab(audit.type);
                      if (audit.type === 'code') {
                        setAuditCode(audit.inputs.auditCode);
                        setAuditLanguage(audit.inputs.auditLanguage);
                        setAuditCodeOutput(audit.output);
                      } else if (audit.type === 'resume') {
                        setAuditResumeText(audit.inputs.auditResumeText);
                        setAuditResumeOutput(audit.output);
                      } else if (audit.type === 'generator') {
                        setAuditTopic(audit.inputs.auditTopic);
                        setAuditCategory(audit.inputs.auditCategory);
                        setAuditGenOutput(audit.output);
                      }
                    }}
                    className="p-3 bg-[#181822] hover:bg-purple-650/10 border border-white/5 hover:border-purple-500/25 rounded-2xl cursor-pointer text-left transition-all flex flex-col justify-between min-h-[60px]"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black text-white truncate max-w-[150px]">{audit.title}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-bold uppercase shrink-0">
                        {audit.type}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-550 mt-1 block">
                      {new Date(audit.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- ACTIVE CHAT WORKSPACE DUAL PANE --- */
        <div className="flex flex-col md:flex-row gap-5 flex-1 h-[calc(100%-80px)] overflow-hidden">
          
          {/* Left panel: Chat sessions list */}
          <div className="w-full md:w-64 bg-[#121217] border border-white/5 rounded-3xl flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-white/5 flex flex-col gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <FaPlus /> Start Consultation
              </button>

              {/* Filters */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                <span className="font-bold uppercase">Conversations</span>
                <button
                  onClick={() => setFilterBookmarked(!filterBookmarked)}
                  className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${filterBookmarked ? 'text-amber-400 font-black' : ''}`}
                >
                  <FaStar size={8} /> {filterBookmarked ? 'Starred Only' : 'Show All'}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {loadingChats ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-4 h-4 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                </div>
              ) : displayChats.length === 0 ? (
                <span className="text-[9px] text-slate-550 italic text-center py-8">No chats logged yet.</span>
              ) : (
                displayChats.map(c => {
                  const isActive = activeChat && activeChat._id === c._id;
                  return (
                    <div
                      key={c._id}
                      className={`group relative p-2.5 rounded-xl flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-purple-600/10 border-purple-500/20 text-white' 
                          : 'bg-[#181822]/40 border-transparent text-slate-400 hover:bg-[#181822] hover:text-white'
                      }`}
                      onClick={() => setActiveChat(c)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold ${
                          isActive ? 'bg-purple-650/20 text-purple-400' : 'bg-white/5 text-slate-500'
                        }`}>
                          <FaRobot size={10} />
                        </div>
                        
                        {editingChatId === c._id ? (
                          <input
                            type="text"
                            value={editTitleVal}
                            onChange={(e) => setEditTitleVal(e.target.value)}
                            onBlur={() => handleRenameChat(c._id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameChat(c._id)}
                            className="bg-[#121217] border border-purple-500/35 text-[10px] text-white px-1.5 py-0.5 rounded w-full focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-[10px] font-bold truncate pr-3">{c.title}</span>
                            <span className="text-[8px] text-slate-500 uppercase mt-0.5">{c.category}</span>
                          </div>
                        )}
                      </div>

                      {/* Hover action bar */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(c._id);
                            setEditTitleVal(c.title);
                          }}
                          className="p-1 text-slate-500 hover:text-white cursor-pointer"
                        >
                          <FaEdit size={8} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(c);
                          }}
                          className={`p-1 cursor-pointer ${c.isBookmarked ? 'text-amber-450' : 'text-slate-550 hover:text-amber-450'}`}
                        >
                          {c.isBookmarked ? <FaStar size={8} /> : <FaRegStar size={8} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(c._id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <FaTrash size={8} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Active Chat dialogue */}
          <div className="flex-1 bg-[#121217] border border-white/5 rounded-3xl flex flex-col overflow-hidden relative">
            {activeChat ? (
              <>
                {/* Chat window Header */}
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-400">
                      <FaRobot size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{activeChat.title}</span>
                      <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider mt-0.5">{activeChat.category} Assistant</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleBookmark(activeChat)}
                      className={`p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer text-xs ${
                        activeChat.isBookmarked ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      <FaStar />
                    </button>
                    <button
                      onClick={handleExportChat}
                      title="Download chat logs"
                      className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>

                {/* Messages dialogue body */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                  {activeChat.messages.map((m, idx) => {
                    const isAi = m.role === 'assistant';
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start text-left' : 'self-end flex-row-reverse text-right'}`}
                      >
                        {isAi && (
                          <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                            <FaRobot size={11} />
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-1">
                          <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed select-text ${
                            isAi 
                              ? 'bg-[#181822] border border-white/5 text-slate-200 rounded-tl-none' 
                              : 'bg-purple-650 text-white rounded-tr-none'
                          }`}>
                            {/* Parse custom titles or blocks inside the simulated replies */}
                            <div className="whitespace-pre-wrap font-sans text-left">
                              {m.content}
                            </div>
                          </div>
                          
                          <span className="text-[7px] text-slate-550 font-bold uppercase px-1">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {sendingMsg && (
                    <div className="flex gap-3 self-start items-center">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        <FaRobot size={11} />
                      </div>
                      <div className="p-3 bg-[#181822] rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-white/5 bg-[#121217] flex gap-2 shrink-0"
                >
                  <input
                    type="text"
                    disabled={sendingMsg}
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder={`Ask AI specialized ${activeChat.category} (Cost: 1 Credit)...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#181822] border border-white/5 text-[11px] text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !inputMsg.trim()}
                    className="px-4 bg-purple-650 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              /* --- EMPTY CHAT VIEWPORT --- */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#121217]/50">
                <div className="w-14 h-14 rounded-2xl bg-purple-600/5 border border-purple-500/10 flex items-center justify-center text-purple-400 mb-4 animate-pulse">
                  <FaRobot size={24} />
                </div>
                <h3 className="font-black text-sm text-white uppercase tracking-wider">Start an AI Consultation</h3>
                <p className="text-[10px] text-slate-450 max-w-xs mt-1.5 leading-relaxed">
                  Select a past session or start a new developer thread to review code, debug, or discuss roadmap strategies!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-5 py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Create Session
                </button>
              </div>
            )}
          </div>
          
        </div>
      )}

      {/* --- CREATE SESSION MODAL OVERLAY --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateChat}
            className="bg-[#121217] border border-white/10 p-6 rounded-[30px] w-full max-w-sm flex flex-col gap-4 text-xs shadow-xl animate-scale-up"
          >
            <div className="border-b border-white/5 pb-2 text-left">
              <h3 className="text-sm font-black text-white uppercase">New AI Consultation</h3>
              <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5 block">Select an assistant category</span>
            </div>

            <div className="flex flex-col gap-3 text-left">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Session Name (Optional)</span>
                <input
                  type="text"
                  placeholder="e.g. Debugging Mongoose Middleware"
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181822] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Assistant Specialty</span>
                <select
                  value={newChatCategory}
                  onChange={(e) => setNewChatCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181822] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option>React Help</option>
                  <option>Node/Express Help</option>
                  <option>MongoDB/SQL Help</option>
                  <option>DSA Help</option>
                  <option>Career Roadmap</option>
                  <option>Interview Questions</option>
                  <option>General Coding</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewChatTitle('');
                }}
                className="px-4 py-2 bg-[#181822] border border-white/5 text-slate-450 hover:text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer transition-colors"
              >
                Launch
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AIConsultant;
