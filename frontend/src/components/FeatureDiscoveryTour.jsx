import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaRocket, FaMap, FaCompass, FaChevronRight, FaChevronLeft, 
  FaTimes, FaUser, FaLock, FaGift, FaUsers, FaMagic, FaSearch
} from 'react-icons/fa';

// List of all features for the Guest Welcome Popup
const GUEST_FEATURES = [
  { icon: 'FaUser', title: 'Interactive Portfolio', desc: 'Browse the developer\'s projects, credentials, and work history.', loginRequired: false },
  { icon: 'FaUsers', title: 'Developer Community', desc: 'Create posts, comment, and discuss code with other members.', loginRequired: true },
  { icon: 'FaMagic', title: 'ATS Resume Checker', desc: 'Scan your resume against automated ATS evaluation systems.', loginRequired: true },
  { icon: 'FaGift', title: 'XP & Rewards', desc: 'Earn XP, level up, and collect coins for your contributions.', loginRequired: true },
  { icon: 'FaRocket', title: 'AI Developer Suite', desc: 'Use AI code assistant, resume analyzer, and summary helpers.', loginRequired: true }
];

const TOUR_STEPS = [
  { target: '#tour-dashboard', title: 'Dashboard', desc: 'Manage your profile, track stats, and view your activity details in one central hub.' },
  { target: '#tour-community', title: 'Developer Community', desc: 'Interact with other developers, post questions, show off projects, and join custom groups.' },
  { target: '#tour-ats', title: 'ATS Resume Checker', desc: 'Scan and score your resume against industry standards with our automated ATS scanner.' },
  { target: '#tour-resume-preview', title: 'Resume Preview', desc: 'Preview your uploaded resume and share it with community members for instant feedback.' },
  { target: '#tour-ai-tools', title: 'AI Developer Suite', desc: 'Harness the power of AI to review code snippets, generate content, and analyze resume data.' },
  { target: '#tour-portfolio', title: 'Interactive Portfolio', desc: 'Explore the developer\'s skills, education, and career experience layout.' },
  { target: '#tour-services', title: 'Premium Services', desc: 'Browse development services and commission custom projects.' },
  { target: '#tour-orders', title: 'Order History', desc: 'Track your commissions, invoices, and service progress status.' },
  { target: '#tour-profile', title: 'User Profile', desc: 'Customize your profile, bios, social links, and showcase your dev stats.' },
  { target: '#tour-notifications', title: 'Activity Notifications', desc: 'Get updates on comments, group invites, direct messages, and system alerts.' },
  { target: '#tour-rewards', title: 'Gamified Rewards', desc: 'Earn XP, level up, and collect coins by contributing to discussions.' },
  { target: '#tour-settings', title: 'Account Settings', desc: 'Manage login history, passwords, profile layouts, and restart onboarding tours.' }
];

const FeatureDiscoveryTour = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Popups visibility state
  const [showGuestWelcome, setShowGuestWelcome] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [whatsNewList, setWhatsNewList] = useState([]);
  const [currentWhatsNew, setCurrentWhatsNew] = useState(null);
  
  // Highlight state
  const [highlightStyle, setHighlightStyle] = useState({ display: 'none' });

  // 1. Initial Load Checks (Logged-in users only)
  useEffect(() => {
    const runDiscoveryChecks = async () => {
      if (isLoading) return;
      if (!isAuthenticated) return;

      // Logged in user onboarding checks
      if (user) {
        if (user.onboardingTourCompleted === false) {
          setTourActive(true);
          setTourStep(0);
        }

        // Fetch What's New releases
        try {
          const res = await api.getWhatsNewFeatures();
          if (res.success && res.data && res.data.length > 0) {
            setWhatsNewList(res.data);
            setCurrentWhatsNew(res.data[0]);
          }
        } catch (err) {
          console.warn('Failed to load what\'s new releases:', err.message);
        }
      }
    };

    runDiscoveryChecks();
  }, [isAuthenticated, user, isLoading]);

  // Guest Onboarding Delay & Activity check (Delayed by 1 minute)
  useEffect(() => {
    if (isAuthenticated) return;

    const guestSeen = localStorage.getItem('portfolio_guest_welcome_seen');
    if (guestSeen) return;

    let hasShown = false;
    let lastActivity = Date.now();

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Track user active states
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('click', updateActivity);

    // Initial 1-minute (60 seconds) wait period
    const delayTimer = setTimeout(() => {
      const checkInterval = setInterval(() => {
        if (hasShown || isAuthenticated || localStorage.getItem('portfolio_guest_welcome_seen')) {
          clearInterval(checkInterval);
          return;
        }

        // Only show if user had active interactions in the last 45 seconds
        const timeSinceLastActivity = Date.now() - lastActivity;
        if (timeSinceLastActivity < 45000) {
          setShowGuestWelcome(true);
          hasShown = true;
          clearInterval(checkInterval);
        }
      }, 5000); // Check activity state every 5 seconds
    }, 60000);

    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [isAuthenticated]);

  // 2. Element Spotlight Positioning
  useEffect(() => {
    if (tourActive && TOUR_STEPS[tourStep]) {
      const step = TOUR_STEPS[tourStep];
      
      // Delay slightly to allow layout changes/scrolling
      const timer = setTimeout(() => {
        const el = document.querySelector(step.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const rect = el.getBoundingClientRect();
          setHighlightStyle({
            display: 'block',
            top: `${rect.top + window.scrollY - 6}px`,
            left: `${rect.left + window.scrollX - 6}px`,
            width: `${rect.width + 12}px`,
            height: `${rect.height + 12}px`
          });
        } else {
          setHighlightStyle({ display: 'none' });
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setHighlightStyle({ display: 'none' });
    }
  }, [tourActive, tourStep]);

  // Handle Guest Popup close
  const closeGuestWelcome = () => {
    localStorage.setItem('portfolio_guest_welcome_seen', 'true');
    setShowGuestWelcome(false);
  };

  // Handle Onboarding Skip/Finish
  const finishOnboarding = async () => {
    setTourActive(false);
    try {
      await api.completeOnboarding();
    } catch (err) {
      console.warn('Failed to save onboarding tour status:', err.message);
    }
  };

  // Handle What's New Close
  const closeWhatsNew = async (action) => {
    if (!currentWhatsNew) return;

    try {
      await api.viewFeatureRelease(currentWhatsNew._id);
    } catch (err) {
      console.warn('Failed to save what\'s new viewed status:', err.message);
    }

    if (action === 'details') {
      window.location.href = '/features';
    }

    // Move to next What's New in list if any
    const nextList = whatsNewList.slice(1);
    setWhatsNewList(nextList);
    setCurrentWhatsNew(nextList.length > 0 ? nextList[0] : null);
  };

  // Icon Resolver helper
  const renderIcon = (name) => {
    switch (name) {
      case 'FaRocket': return <FaRocket />;
      case 'FaUsers': return <FaUsers />;
      case 'FaGift': return <FaGift />;
      case 'FaUser': return <FaUser />;
      default: return <FaCompass />;
    }
  };

  return (
    <>
      {/* 1. Guest Welcome Popup */}
      {showGuestWelcome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b0b0f]/90 border border-white/10 rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 text-left relative glassmorphism shadow-2xl">
            <button 
              onClick={closeGuestWelcome}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-650/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FaRocket size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Welcome to DevPortfolio</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Explore our features and community tools</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {GUEST_FEATURES.map((feat, index) => (
                <div key={index} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                  <span className="text-purple-400 text-sm mt-1 shrink-0">{renderIcon(feat.icon)}</span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-white">{feat.title}</span>
                      {feat.loginRequired && (
                        <span className="px-1.5 py-0.5 text-[8px] bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-md font-bold uppercase shrink-0">
                          Login Required
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 leading-relaxed">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-1 border-t border-white/5 pt-4">
              <button 
                onClick={closeGuestWelcome}
                className="flex-1 py-2.5 bg-[#181822] hover:bg-[#20202d] text-slate-300 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Skip for Now
              </button>
              <a 
                href="/features"
                onClick={() => localStorage.setItem('portfolio_guest_welcome_seen', 'true')}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Onboarding Spotlight Tour */}
      {tourActive && TOUR_STEPS[tourStep] && (
        <>
          {/* Spotlight Highlight cut-out border */}
          <div 
            className="fixed pointer-events-none border-[3px] border-purple-500 rounded-2xl z-[997] transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
            style={highlightStyle}
          />

          {/* Tour Description Tooltip Overlay */}
          <div className="fixed inset-0 z-[998] pointer-events-none flex items-center justify-center p-4">
            <div className="bg-[#0b0b0f]/95 border border-purple-500/30 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-4 text-left pointer-events-auto shadow-2xl glassmorphism mt-[15vh]">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">
                  Step {tourStep + 1} of {TOUR_STEPS.length}
                </span>
                <button 
                  onClick={finishOnboarding}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  title="Skip Tour"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {TOUR_STEPS[tourStep].title}
                </h4>
                <p className="text-[10px] text-slate-350 leading-relaxed mt-1">
                  {TOUR_STEPS[tourStep].desc}
                </p>
              </div>

              {/* Progress dots bar */}
              <div className="flex gap-1 items-center my-1">
                {TOUR_STEPS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === tourStep ? 'w-4 bg-purple-500' : 'w-1.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3.5 mt-0.5">
                <button 
                  onClick={finishOnboarding}
                  className="text-[9px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-wider cursor-pointer"
                >
                  Skip Tour
                </button>

                <div className="flex gap-2">
                  {tourStep > 0 && (
                    <button 
                      onClick={() => setTourStep(prev => prev - 1)}
                      className="px-3 py-1.5 bg-[#181822] hover:bg-[#20202d] text-slate-300 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <FaChevronLeft size={8} /> Prev
                    </button>
                  )}
                  {tourStep < TOUR_STEPS.length - 1 ? (
                    <button 
                      onClick={() => setTourStep(prev => prev + 1)}
                      className="px-4 py-1.5 bg-purple-650 hover:bg-purple-750 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      Next <FaChevronRight size={8} />
                    </button>
                  ) : (
                    <button 
                      onClick={finishOnboarding}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Finish
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. What's New Popup */}
      {currentWhatsNew && !tourActive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b0b0f]/90 border border-purple-500/20 rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 text-left relative glassmorphism shadow-2xl">
            <button 
              onClick={() => closeWhatsNew('later')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[8px] bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-md font-bold uppercase">
                What's New
              </span>
              <span className="text-[9px] text-slate-500">v{currentWhatsNew.version}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">{currentWhatsNew.name}</h3>
              <p className="text-[10px] text-slate-450 leading-relaxed mt-1">{currentWhatsNew.description}</p>
            </div>

            {currentWhatsNew.screenshot?.url && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                <img src={currentWhatsNew.screenshot.url} alt="release preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex gap-3 border-t border-white/5 pt-4 mt-1">
              <button 
                onClick={() => closeWhatsNew('later')}
                className="flex-1 py-2 bg-[#181822] hover:bg-[#20202d] text-slate-350 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
              >
                Later
              </button>
              <button 
                onClick={() => closeWhatsNew('details')}
                className="flex-1 py-2 bg-purple-650 hover:bg-purple-750 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeatureDiscoveryTour;
