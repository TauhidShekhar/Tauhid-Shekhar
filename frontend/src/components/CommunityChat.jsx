import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { FaPaperPlane, FaUserCircle, FaCircle, FaUsers, FaPlus, FaPlusCircle } from 'react-icons/fa';

const getSocketRoot = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL;
  if (rawApiUrl && rawApiUrl !== 'undefined' && rawApiUrl !== 'null') {
    return rawApiUrl.replace('/api', '');
  }
  const port = window.location.port;
  if (port === '5173' || port === '5174') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'https://tauhid-shekhar-portfolio.onrender.com';
};
const API_ROOT = getSocketRoot();

const CommunityChat = () => {
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  // Starting conversation
  const [showStarter, setShowStarter] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [chatUsers, setChatUsers] = useState([]);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // Initialize Socket connection
  // Initialize Socket connection
  useEffect(() => {
    if (!user) return;
    socketRef.current = io(API_ROOT, { withCredentials: true });

    socketRef.current.on('receive_message', (msg) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages(prev => [...prev, msg]);
      }
      // Refresh conversations list to update lastMessage text preview
      fetchConversations();
    });

    socketRef.current.on('typing_status', (data) => {
      const currentUserId = user.id || user._id;
      if (activeConv && data.senderId !== currentUserId) {
        setPartnerTyping(data.isTyping);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [activeConv, user]);

  // Join Socket conversation room
  useEffect(() => {
    if (activeConv && socketRef.current) {
      socketRef.current.emit('join_room', activeConv._id);
      fetchMessages(activeConv._id);
    }
  }, [activeConv]);

  // Scroll to bottom when message arrives
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.getChatsConversations();
      if (res.success) {
        setConversations(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.getChatsMessages(conversationId);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    
    // Load users list for start conversation panel
    const loadLeaders = async () => {
      try {
        const res = await api.getCommunityLeaderboard();
        if (res.success) {
          const currentUserId = user.id || user._id;
          setChatUsers((res.data || []).filter(u => u._id !== currentUserId));
        }
      } catch (_) {}
    };
    loadLeaders();
  }, [user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const currentUserId = user?.id || user?._id;
    if (!text.trim() || !activeConv || !currentUserId) return;

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        conversationId: activeConv._id,
        senderId: currentUserId,
        text: text.trim()
      });
      // Stop typing
      socketRef.current.emit('typing', { conversationId: activeConv._id, senderId: currentUserId, isTyping: false });
      setIsTyping(false);
      setText('');
    }
  };

  const handleTextChange = (val) => {
    setText(val);
    const currentUserId = user?.id || user?._id;
    if (!activeConv || !socketRef.current || !currentUserId) return;

    if (!isTyping && val.trim() !== '') {
      setIsTyping(true);
      socketRef.current.emit('typing', { conversationId: activeConv._id, senderId: currentUserId, isTyping: true });
    } else if (isTyping && val.trim() === '') {
      setIsTyping(false);
      socketRef.current.emit('typing', { conversationId: activeConv._id, senderId: currentUserId, isTyping: false });
    }
  };

  const handleStartConversation = async (targetUserId) => {
    try {
      const res = await api.startChatsConversation({ targetUserId, isGroup: false });
      if (res.success) {
        setActiveConv(res.data);
        setShowStarter(false);
        fetchConversations();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] shadow-sm flex flex-col md:flex-row overflow-hidden max-w-5xl mx-auto h-[600px] text-left">
      
      {/* Conversations List sidebar */}
      <div className="w-full md:w-80 border-r border-slate-200/50 dark:border-white/5 flex flex-col justify-between shrink-0 h-1/3 md:h-full">
        <div className="p-5 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center">
          <div>
            <h3 className="font-black font-title text-sm text-black dark:text-white">Direct Messages</h3>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Conversations</span>
          </div>
          <button
            onClick={() => setShowStarter(true)}
            className="p-2 bg-primary-blue/10 text-primary-blue rounded-xl hover:bg-primary-blue/20 transition-colors cursor-pointer"
            title="Start Conversation"
          >
            <FaPlus size={12} />
          </button>
        </div>

        {/* Start Chat Starter Modal view overlays */}
        {showStarter && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 flex flex-col gap-2 max-h-[220px] overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Select user to chat</span>
              <button onClick={() => setShowStarter(false)} className="text-[9px] font-bold text-red-500 hover:underline">Cancel</button>
            </div>
            <div className="flex flex-col gap-1.5">
              {chatUsers.map(u => (
                <button
                  key={u._id}
                  onClick={() => handleStartConversation(u._id)}
                  className="w-full p-2 hover:bg-white dark:hover:bg-white/5 rounded-xl flex items-center gap-2.5 text-left text-xs font-bold text-slate-750 dark:text-slate-300 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                    {u.avatar?.url ? <img src={u.avatar.url} alt="User" className="w-full h-full object-cover" /> : <FaUserCircle className="text-slate-400" />}
                  </div>
                  @{u.username}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          {conversations.map(conv => {
            const partner = conv.participants.find(p => p._id !== (user?.id || user?._id)) || {};
            const isActive = activeConv && activeConv._id === conv._id;

            return (
              <button
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                  isActive 
                    ? 'bg-primary-blue/15 text-primary-blue' 
                    : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 border border-slate-350/50 flex items-center justify-center shrink-0">
                  {partner.avatar?.url ? (
                    <img src={partner.avatar.url} alt="Partner" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-slate-400" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs truncate text-black dark:text-white">
                    {partner.fullName || 'Chat User'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate font-bold uppercase tracking-wider">
                    {conv.lastMessage ? conv.lastMessage.text : 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <p className="text-xs text-slate-400 italic p-4 text-center">No active chats. Start one above!</p>
          )}
        </div>
      </div>

      {/* Main active messages display window */}
      <div className="flex-1 flex flex-col justify-between h-2/3 md:h-full">
        {activeConv ? (
          <>
            {/* Header info */}
            <div className="p-5 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-blue/10 text-primary-blue flex items-center justify-center shrink-0 font-bold">
                C
              </div>
              <div>
                <h4 className="font-bold text-xs text-black dark:text-white">
                  {(activeConv.participants.find(p => p._id !== (user?.id || user?._id)) || {}).fullName}
                </h4>
                {partnerTyping ? (
                  <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest block mt-0.5">Typing...</span>
                ) : (
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5 flex items-center gap-1"><FaCircle className="text-green-500" size={6} /> Connected Sockets</span>
                )}
              </div>
            </div>

            {/* Chat timeline message lines */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {messages.map(msg => {
                const isSelf = msg.sender?._id === (user?.id || user?._id) || msg.sender === (user?.id || user?._id);

                return (
                  <div 
                    key={msg._id} 
                    className={`flex flex-col max-w-[70%] ${
                      isSelf ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-[8px] font-bold text-slate-400 mb-0.5">@{msg.sender?.username || 'user'}</span>
                    <div 
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words ${
                        isSelf 
                          ? 'bg-primary-blue text-white rounded-tr-none' 
                          : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 rounded-tl-none border border-slate-200/50 dark:border-white/5'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Send Message controller footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 dark:border-white/5 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type your message..."
                required
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue transition-colors"
              />
              <button
                type="submit"
                className="p-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center shrink-0"
              >
                <FaPaperPlane size={12} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <FaUsers size={48} className="text-slate-300 dark:text-white/10 mb-4 animate-bounce" />
            <h3 className="font-bold text-sm text-black dark:text-white">Select a Chat</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[280px] text-center">Open or start a direct message conversation from the left user panels.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CommunityChat;
