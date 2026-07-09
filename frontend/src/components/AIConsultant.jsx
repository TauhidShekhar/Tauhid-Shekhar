import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaRobot, FaBrain, FaPlus, FaTrash, FaEdit, FaCheck,
  FaCode, FaFileAlt, FaPaperPlane, FaDownload, FaShareAlt,
  FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaPaperclip, FaTimes, FaSearch
} from 'react-icons/fa';

const AIConsultant = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [credits, setCredits] = useState(10);
  
  // Search and sidebar list filter
  const [searchTerm, setSearchTerm] = useState('');

  // Voice Inputs / Outputs state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Active chat inputs & scroll
  const [inputMsg, setInputMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  
  // File upload state
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  // Rename modal / inline edit state
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleVal, setEditTitleVal] = useState('');

  // Audit Tab quick modes
  const [utilityMode, setUtilityMode] = useState(false);
  const [activeUtilityTab, setActiveUtilityTab] = useState('code');
  const [auditCode, setAuditCode] = useState('');
  const [auditLanguage, setAuditLanguage] = useState('Javascript');
  const [auditCodeOutput, setAuditCodeOutput] = useState(null);
  const [auditResumeText, setAuditResumeText] = useState('');
  const [auditResumeOutput, setAuditResumeOutput] = useState(null);
  const [utilityLoading, setUtilityLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    { 
      title: '🤖 AI Portfolio Reviewer', 
      desc: 'Suggest improvements for developer portfolio aesthetics & structure.',
      prompt: 'Review my developer portfolio outline and suggest enhancements for UI design and project showcase layout.'
    },
    { 
      title: '📄 AI Resume Optimizer', 
      desc: 'Improve technical resume items to score high in ATS tracking tools.',
      prompt: 'Analyze this technical experience bullet point and rewrite it to highlight impact and keywords for ATS algorithms: "Fixed bugs in React frontend and worked on databases."'
    },
    { 
      title: '💻 AI Code Reviewer', 
      desc: 'Audit custom codebase snippets for performance issues.',
      prompt: 'Audit the following code for memory leaks, performance bottlenecks, and CamelCase syntax errors: \n\n```javascript\nfunction load_data() {\n  setInterval(async function() {\n    let res = await fetch("/api/status");\n    console.log(res);\n  }, 1000);\n}\n```'
    },
    { 
      title: '🐞 AI Bug Fix Assistant', 
      desc: 'Identify compiler errors and suggest fixes.',
      prompt: 'I am getting a "VersionError: No document found for query" inside Mongoose save hooks. Explain why this happens and write a solution snippet.'
    },
    { 
      title: '🎯 AI Career Coach', 
      desc: 'Draft roadmaps for transitioning to senior roles.',
      prompt: 'Map out a technical skill learning roadmap for transitioning from a frontend builder to a Cloud-Native Full Stack Solutions Architect.'
    }
  ];

  // Load chat histories
  const loadChats = async () => {
    try {
      const res = await api.getAIChats();
      if (res.success) {
        setChats(res.data || []);
        if (res.data && res.data.length > 0 && !activeChat) {
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
  const handleCreateChat = async (category = 'General') => {
    try {
      const title = `AI ${category} Consultation`;
      const res = await api.createAIChat({ title, category });
      if (res.success) {
        setChats(prev => [res.data, ...prev]);
        setActiveChat(res.data);
        setUtilityMode(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create chat.');
    }
  };

  // Send message with attachments
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputMsg.trim() && !attachment) || !activeChat || sendingMsg) return;

    let displayContent = inputMsg;
    if (attachment) {
      displayContent += `\n\n*[Attached ${attachment.type.toUpperCase()}: ${attachment.name}]*`;
    }

    const userMessage = { role: 'user', content: displayContent, timestamp: new Date() };
    const updatedMessages = [...activeChat.messages, userMessage];
    
    // Update local active chat UI optimistically
    setActiveChat(prev => ({ ...prev, messages: updatedMessages }));
    setInputMsg('');
    setSendingMsg(true);

    const activeAttachments = attachment ? [attachment] : null;
    setAttachment(null);

    try {
      const res = await api.sendAIChatMessage(activeChat._id, userMessage.content, activeAttachments);
      if (res.success) {
        setActiveChat(res.data);
        setCredits(res.creditsLeft);
        setChats(prev => prev.map(c => c._id === res.data._id ? res.data : c));
      }
    } catch (err) {
      alert(err.message || 'Failed to communicate with AI Assistant.');
      loadChats();
    } finally {
      setSendingMsg(false);
    }
  };

  // Rename chat title
  const handleRenameChat = async (chatId) => {
    if (!editTitleVal.trim()) return;
    try {
      const res = await api.updateAIChat(chatId, { title: editTitleVal.trim() });
      if (res.success) {
        setChats(prev => prev.map(c => c._id === chatId ? { ...c, title: res.data.title } : c));
        if (activeChat?._id === chatId) {
          setActiveChat(prev => ({ ...prev, title: res.data.title }));
        }
        setEditingChatId(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to rename chat.');
    }
  };

  // Delete chat session
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this AI conversation history permanently?')) return;
    try {
      const res = await api.deleteAIChat(chatId);
      if (res.success) {
        setChats(prev => prev.filter(c => c._id !== chatId));
        if (activeChat?._id === chatId) {
          setActiveChat(chats.find(c => c._id !== chatId) || null);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete chat.');
    }
  };

  // Voice Speech Recognition
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech Recognition API is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMsg(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Voice Speech Output
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert('Speech Synthesis API is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ''));
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // File Attachments parser
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Attachments size limit is 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  // Export Chat PDF / Markdown
  const exportChatHistory = (format) => {
    if (!activeChat || activeChat.messages.length === 0) return;
    
    let docText = `# AI Consultant History: ${activeChat.title}\n\n`;
    activeChat.messages.forEach(m => {
      docText += `### [${m.role.toUpperCase()}]\n${m.content}\n\n`;
    });

    if (format === 'markdown') {
      const blob = new Blob([docText], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeChat.title.replace(/\s+/g, '_')}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const win = window.open('', '_blank');
      win.document.write(`
        <html>
          <head>
            <title>${activeChat.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #0f172a; }
              .msg { margin-bottom: 20px; padding: 15px; border-radius: 12px; }
              .user { background: #f8fafc; border: 1px solid #e2e8f0; }
              .assistant { background: #f3e8ff; border-left: 4px solid #a855f7; }
              pre { background: #0f172a; color: #f8fafc; padding: 15px; border-radius: 8px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <h1>${activeChat.title}</h1>
            ${activeChat.messages.map(m => `
              <div class="msg ${m.role}">
                <strong>${m.role === 'user' ? 'User' : 'AI Consultant'}</strong>
                <div>${m.content.replace(/\n/g, '<br>')}</div>
              </div>
            `).join('')}
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  // Share conversation simulation
  const shareChatLink = () => {
    if (!activeChat) return;
    const shareUrl = `${window.location.origin}/community/ai-assistant/share/${activeChat._id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Conversation link copied to clipboard! (Share URL generated)');
  };

  // Code Block parsing helper
  const parseMessageContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const rawCode = part.slice(3, -3);
        const codeLines = rawCode.split('\n');
        const language = codeLines[0].trim() || 'javascript';
        const codeText = codeLines.slice(1).join('\n');
        return (
          <div key={index} className="my-3 overflow-hidden rounded-xl border border-white/5 bg-[#09090c] font-mono text-xs">
            <div className="flex justify-between items-center bg-white/5 px-4 py-2 border-b border-white/5 text-[10px] text-slate-400 font-bold uppercase">
              <span>{language}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  alert('Code snippet copied to clipboard!');
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Copy Code
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-left text-purple-200 scrollbar-thin">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  const filteredChatsList = chats.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-black text-white uppercase tracking-wider">AI Consultant Studio</h1>
        <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">ChatGPT-like specialized agent for developer workflows</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Chats Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4 bg-[#121217] border border-white/5 p-4 rounded-3xl h-[600px]">
          
          <button
            onClick={() => handleCreateChat('General')}
            className="w-full py-2.5 bg-gradient-to-r from-purple-650 to-indigo-650 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-purple-600/10"
          >
            <FaPlus size={10} /> New AI Chat
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1e1e24] border border-white/5 text-xs text-white placeholder-slate-450 focus:outline-none"
            />
            <FaSearch className="absolute left-3 top-2.5 text-slate-450" size={10} />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 scrollbar-thin">
            {loadingChats ? (
              <div className="py-12 flex justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
              </div>
            ) : filteredChatsList.length > 0 ? (
              filteredChatsList.map(c => (
                <div
                  key={c._id}
                  onClick={() => {
                    setActiveChat(c);
                    setUtilityMode(false);
                  }}
                  className={`group p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                    activeChat?._id === c._id && !utilityMode
                      ? 'bg-purple-600/10 border-purple-500/20 text-white'
                      : 'bg-white/2 border-transparent text-slate-400 hover:bg-white/4'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FaBrain className="text-purple-400 shrink-0 text-xs" />
                    {editingChatId === c._id ? (
                      <input
                        type="text"
                        value={editTitleVal}
                        onChange={(e) => setEditTitleVal(e.target.value)}
                        onBlur={() => handleRenameChat(c._id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameChat(c._id)}
                        className="bg-[#1e1e24] border border-white/10 text-white text-[11px] px-1.5 py-0.5 rounded focus:outline-none w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="text-[11px] font-black truncate">{c.title}</span>
                    )}
                  </div>
                  
                  {editingChatId !== c._id && (
                    <div className="hidden group-hover:flex items-center gap-1.5 shrink-0 ml-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(c._id);
                          setEditTitleVal(c.title);
                        }}
                        className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                        title="Rename chat"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(c._id, e)}
                        className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer"
                        title="Delete chat"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[10px] text-slate-450 font-bold">
                No active chat sessions
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase">
            <span>AI Studio Balance</span>
            <span className="text-purple-400 font-black">{credits} Credits Left</span>
          </div>
        </div>

        {/* Right Column: Chat Interface & Utility Panels */}
        <div className="lg:col-span-3 flex flex-col bg-[#121217] border border-white/5 rounded-3xl h-[600px] overflow-hidden">
          
          {/* Active Chat Header */}
          <div className="px-5 py-3 border-b border-white/5 bg-[#171720]/80 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <FaRobot className="text-purple-400 text-sm" />
              <span className="text-xs font-black text-white">
                {activeChat ? activeChat.title : 'Assistant Console'}
              </span>
            </div>
            {activeChat && (
              <div className="flex items-center gap-3">
                <button
                  onClick={shareChatLink}
                  className="p-1.5 text-slate-400 hover:text-white text-xs cursor-pointer rounded-lg hover:bg-white/5 transition-all"
                  title="Share Conversation"
                >
                  <FaShareAlt />
                </button>
                <div className="relative group/export">
                  <button
                    className="p-1.5 text-slate-400 hover:text-white text-xs cursor-pointer rounded-lg hover:bg-white/5 transition-all flex items-center gap-1"
                    title="Export Chat"
                  >
                    <FaDownload />
                  </button>
                  <div className="absolute right-0 top-6 hidden group-hover/export:flex flex-col bg-[#1e1e24] border border-white/5 rounded-xl py-1 shadow-xl z-50 min-w-[100px]">
                    <button 
                      onClick={() => exportChatHistory('markdown')}
                      className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-350 hover:bg-white/5 hover:text-white cursor-pointer"
                    >
                      Markdown
                    </button>
                    <button 
                      onClick={() => exportChatHistory('pdf')}
                      className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-350 hover:bg-white/5 hover:text-white cursor-pointer"
                    >
                      Print / PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {activeChat && activeChat.messages ? (
              activeChat.messages.length <= 1 ? (
                /* Suggested prompt grid if no user message yet */
                <div className="py-6 max-w-xl mx-auto space-y-6">
                  <div className="text-center">
                    <h3 className="text-sm font-black text-white">Ask anything to kickstart your project</h3>
                    <p className="text-[11px] text-slate-450 mt-1">Select a quick recommendation topic to check code, resume, or plans</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedPrompts.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setInputMsg(p.prompt);
                        }}
                        className="p-3 rounded-2xl bg-white/2 hover:bg-purple-600/5 border border-white/5 hover:border-purple-500/20 cursor-pointer text-left transition-all"
                      >
                        <span className="text-[11px] font-black text-white">{p.title}</span>
                        <p className="text-[9px] text-slate-450 mt-1 font-bold">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Chat logs list */
                <div className="space-y-4 max-w-2xl mx-auto">
                  {activeChat.messages.map((m, idx) => (
                    <div key={idx} className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role !== 'user' && (
                        <div className="w-8 h-8 rounded-xl bg-purple-650/15 border border-purple-500/10 flex items-center justify-center shrink-0">
                          <FaRobot className="text-purple-400" size={13} />
                        </div>
                      )}
                      
                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs text-left relative ${
                        m.role === 'user'
                          ? 'bg-purple-600/15 text-purple-100 rounded-tr-none border border-purple-500/10'
                          : 'bg-[#181822] text-slate-300 rounded-tl-none border border-white/5'
                      }`}>
                        <div className="prose prose-invert prose-xs">
                          {parseMessageContent(m.content)}
                        </div>

                        {m.role !== 'user' && (
                          <button
                            onClick={() => speakText(m.content)}
                            className="absolute -bottom-2 -right-2 p-1 bg-[#1e1e24] hover:bg-purple-600 border border-white/5 text-[9px] text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer shadow"
                            title="Speak Response"
                          >
                            <FaVolumeUp />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {sendingMsg && (
                    <div className="flex gap-3.5 justify-start items-center">
                      <div className="w-8 h-8 rounded-xl bg-purple-650/15 border border-purple-500/10 flex items-center justify-center shrink-0">
                        <FaRobot className="text-purple-400" size={13} />
                      </div>
                      <div className="p-3 bg-[#181822] border border-white/5 rounded-2xl rounded-tl-none text-slate-400 text-xs flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-450">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )
            ) : (
              <div className="py-24 text-center text-xs text-slate-400 font-bold">
                Select an active chat session or create a new one to begin.
              </div>
            )}
          </div>

          {/* File attachment preview */}
          {attachment && (
            <div className="px-5 py-2 border-t border-white/5 bg-[#171720]/40 flex justify-between items-center text-[10px] text-slate-350 shrink-0">
              <span className="font-bold">Attached: {attachment.name} ({attachment.type.toUpperCase()})</span>
              <button 
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {/* Message Input Form */}
          <div className="p-4 border-t border-white/5 bg-[#171720]/50 shrink-0">
            {activeChat ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                
                {/* File Attachment Triggers */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-[#1e1e24] hover:bg-[#252530] text-slate-400 hover:text-white rounded-xl border border-white/5 flex items-center justify-center cursor-pointer transition-colors"
                  title="Attach file (PDF/Image)"
                >
                  <FaPaperclip size={12} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <input
                  type="text"
                  placeholder={isListening ? "Listening..." : "Ask AI Developer Assistant..."}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#181822] border border-white/5 text-xs text-white placeholder-slate-450 focus:outline-none focus:border-purple-500 focus:bg-[#1e1e28] transition-colors"
                  disabled={isListening}
                />

                {/* Voice Input Trigger */}
                <button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white border-red-500/20 animate-pulse'
                      : 'bg-[#1e1e24] hover:bg-[#252530] text-slate-400 hover:text-white border-white/5'
                  }`}
                  title={isListening ? "Stop Voice Input" : "Voice Input"}
                >
                  <FaMicrophone size={12} />
                </button>

                <button
                  type="submit"
                  disabled={(!inputMsg.trim() && !attachment) || sendingMsg}
                  className="px-5 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]"
                >
                  <FaPaperPlane size={10} /> Send
                </button>
              </form>
            ) : (
              <div className="text-center text-[10px] font-bold text-slate-450 uppercase py-2">
                AI Consultative Workspace locked. Select a history channel above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConsultant;
