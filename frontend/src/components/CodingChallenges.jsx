import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaCode, FaCheckCircle, FaExclamationTriangle, FaCoins, 
  FaGift, FaHourglassHalf, FaTrophy, FaLightbulb, FaBookOpen 
} from 'react-icons/fa';

const QUIZ_QUESTIONS = {
  Easy: [
    {
      q: 'Which HTML5 tag is used to embed javascript scripts?',
      options: ['<js>', '<script>', '<javascript>', '<codeLink>'],
      answer: 1,
      explain: '<script> is the standard HTML tag for importing JavaScript code.'
    },
    {
      q: 'What is the default layout alignment of elements in CSS Flexbox?',
      options: ['row', 'column', 'grid', 'inline'],
      answer: 0,
      explain: 'Flexbox defaults to flex-direction: row unless specified otherwise.'
    },
    {
      q: 'Which keyword is used to declare a constant in modern JS?',
      options: ['var', 'let', 'const', 'constant'],
      answer: 2,
      explain: 'const is block-scoped and cannot be re-declared or re-assigned.'
    },
    {
      q: 'Which HTML element is used for the largest heading?',
      options: ['<head>', '<h6>', '<heading>', '<h1>'],
      answer: 3,
      explain: '<h1> defines the most important and largest heading tag.'
    },
    {
      q: 'Which CSS property controls the text size?',
      options: ['font-style', 'text-size', 'font-size', 'text-style'],
      answer: 2,
      explain: 'font-size is used to configure text height and width metrics.'
    },
    {
      q: 'How do you write "Hello World" in an alert box in Javascript?',
      options: ['msgBox("Hello World");', 'alert("Hello World");', 'alertBox("Hello World");', 'msg("Hello World");'],
      answer: 1,
      explain: 'The alert() method displays an alert box with a specified message.'
    }
  ],
  Medium: [
    {
      q: 'What is the primary purpose of React.useMemo hook?',
      options: [
        'To cache state values across page refreshes',
        'To memoize expensive calculation outputs',
        'To bind lifecycle triggers on components',
        'To inject Redux selectors'
      ],
      answer: 1,
      explain: 'useMemo caches expensive calculations to prevent unnecessary re-execution.'
    },
    {
      q: 'Which HTTP status code represents a temporary resource redirect?',
      options: ['200 OK', '404 Not Found', '302 Found', '500 Server Error'],
      answer: 2,
      explain: '302 Found represents a temporary redirection, while 301 is permanent.'
    },
    {
      q: 'In Mongoose, which populator method resolves model references?',
      options: ['.fill()', '.populate()', '.resolve()', '.join()'],
      answer: 1,
      explain: '.populate() automatically replaces path references with documents from other collections.'
    },
    {
      q: 'Which of the following is NOT a React Lifecycle method?',
      options: ['componentDidMount', 'componentWillUnmount', 'componentWillBind', 'componentDidUpdate'],
      answer: 2,
      explain: 'componentWillBind is not a valid React lifecycle method name.'
    },
    {
      q: 'What is the correct syntax for referring to an external script called "xxx.js"?',
      options: ['<script href="xxx.js">', '<script name="xxx.js">', '<script src="xxx.js">', '<script file="xxx.js">'],
      answer: 2,
      explain: 'The src attribute points to the external JavaScript file URL.'
    },
    {
      q: 'Which JS array method creates a new array with all elements that pass a test?',
      options: ['map()', 'filter()', 'reduce()', 'find()'],
      answer: 1,
      explain: 'filter() creates a shallow copy of a portion of a given array, filtered down to just the elements that pass the test.'
    }
  ],
  Hard: [
    {
      q: 'Which database index structure is typically used by relational databases?',
      options: ['B-Tree / B+Tree', 'Hash Maps', 'Red-Black Trees', 'Linked Lists'],
      answer: 0,
      explain: 'B-Trees allow range queries and log-time searches, making them the standard database index model.'
    },
    {
      q: 'What does the Node.js event loop do when the call stack is empty?',
      options: [
        'It terminates the process instantly.',
        'It executes functions in the microtask/callback queues.',
        'It allocates extra CPU core threads.',
        'It clears the heap memory cache.'
      ],
      answer: 1,
      explain: 'The event loop moves callbacks from the task/microtask queues to the call stack once it is empty.'
    },
    {
      q: 'How does optimistic concurrency control verify transaction safety in MongoDB?',
      options: [
        'By locking the entire database collections.',
        'By comparing document version keys (__v) before writing.',
        'By rejecting concurrent queries.',
        'By running transaction backups.'
      ],
      answer: 1,
      explain: 'Optimistic concurrency control checks the version key (__v) to ensure the document was not updated since it was read.'
    },
    {
      q: 'What is the time complexity of searching in a balanced Binary Search Tree?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      answer: 2,
      explain: 'Searching in a balanced BST halves the search space at each step, resulting in logarithmic time complexity.'
    },
    {
      q: 'Which CSS layout mechanism is best suited for 2-dimensional grid layouts?',
      options: ['Flexbox', 'CSS Grid', 'Float', 'Absolute Positioning'],
      answer: 1,
      explain: 'CSS Grid is designed for two-dimensional layouts (rows and columns), whereas Flexbox is one-dimensional.'
    },
    {
      q: 'In Javascript, what is the behavior of the "temporal dead zone" (TDZ)?',
      options: [
        'It is a state where functions cannot be called.',
        'It is the period between variable binding and initialization where referencing let/const throws a ReferenceError.',
        'It refers to asynchronous timeouts.',
        'It is the stack limit boundary.'
      ],
      answer: 1,
      explain: 'TDZ is the block scope state between declaring a variable using let/const and the initialization point, during which accesses throw an error.'
    }
  ]
};

const CodingChallenges = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('coding'); // coding, quiz

  // Coding Challenge States
  const [challenge, setChallenge] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Spin Wheel States
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState('');
  const [wheelOffset, setWheelOffset] = useState(0);

  // Quiz Arena States
  const [quizDifficulty, setQuizDifficulty] = useState('Easy');
  const [quizState, setQuizState] = useState('idle'); // idle, active, finished
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizTimeLeft, setQuizTimeLeft] = useState(30);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [currentQuestionsList, setCurrentQuestionsList] = useState([]);

  const loadChallenge = async () => {
    try {
      const res = await api.getDailyChallenge();
      if (res.success) {
        setChallenge(res.data.challenge);
        setIsSolved(res.data.isSolved);
        setCode(res.data.challenge?.codeTemplate || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChallenge(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  // Timer loop for active quizzes
  useEffect(() => {
    if (quizState !== 'active') return;
    if (quizTimeLeft <= 0) {
      handleForceSubmitQuiz();
      return;
    }
    const timer = setTimeout(() => {
      setQuizTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [quizTimeLeft, quizState]);

  const handleSubmitSolution = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await api.submitChallengeSolution(challenge._id, code);
      if (res.success) {
        setSubmitResult(res);
        if (res.passed) {
          setIsSolved(true);
        }
      }
    } catch (err) {
      setSubmitResult({
        passed: false,
        message: err.message || 'Syntax compile check failed.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpinWheel = async () => {
    if (spinning) return;
    setSpinning(true);
    setWheelResult('');
    
    // Rotate wheel physics rotation
    const randomRotation = 1440 + Math.floor(Math.random() * 360);
    setWheelOffset(prev => prev + randomRotation);

    try {
      const res = await api.triggerSpinWheel();
      
      setTimeout(() => {
        setSpinning(false);
        if (res.success) {
          setWheelResult(`Congrats! You won ${res.data.resultName}!`);
        }
      }, 3000);
    } catch (err) {
      setSpinning(false);
      setWheelResult(err.message || 'Wheel already spun today. Try again tomorrow.');
    }
  };

  // --- Quiz Handlers ---
  const handleStartQuiz = () => {
    // Select 3 random questions from the pool for the chosen difficulty
    const allQs = QUIZ_QUESTIONS[quizDifficulty] || [];
    const shuffled = [...allQs].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setCurrentQuestionsList(selected);

    setUserAnswers([]);
    setCurrentQIndex(0);
    setQuizTimeLeft(30);
    setQuizResult(null);
    setQuizState('active');
  };

  const handleSelectOption = (optIndex) => {
    const updated = [...userAnswers, optIndex];
    setUserAnswers(updated);
    
    const questions = currentQuestionsList;
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setQuizTimeLeft(30); // reset timer for next question
    } else {
      submitQuizResults(updated);
    }
  };

  const handleForceSubmitQuiz = () => {
    // Fill remaining answers as -1 (missed)
    const questions = currentQuestionsList;
    const filled = [...userAnswers];
    while (filled.length < questions.length) {
      filled.push(-1);
    }
    setUserAnswers(filled);
    submitQuizResults(filled);
  };

  const submitQuizResults = async (answers) => {
    setSubmittingQuiz(true);
    setQuizState('finished');
    
    const questions = currentQuestionsList;
    let score = 0;
    
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        score += 1;
      }
    });

    try {
      const res = await api.submitQuizScore(quizDifficulty, score, questions.length);
      if (res.success) {
        if (res.passed) {
          try {
            localStorage.setItem('portfolio_quiz_done_date', new Date().toDateString());
          } catch (_) {}
        }
        setQuizResult({
          score,
          total: questions.length,
          passed: res.passed,
          xp: res.xpAwarded,
          coins: res.coinsAwarded,
          message: res.message
        });
      }
    } catch (err) {
      alert(err.message || 'Quiz scoring submission failed.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loadingChallenge) {
    return (
      <div className="p-16 flex items-center justify-center bg-[#121217] border border-white/5 rounded-3xl min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-3 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }



  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Workspace Arena Console (col-span-2) */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* Toggle headers */}
        <div className="flex gap-2 bg-[#121217] border border-white/5 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('coding')}
            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'coding' ? 'bg-purple-650 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Coding Arena
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'quiz' ? 'bg-purple-650 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quiz Arena
          </button>
        </div>

        {activeTab === 'coding' ? (
          /* --- CODING WORKSPACE --- */
          <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Coding Playground</span>
                <h2 className="text-sm font-black text-white mt-1 flex items-center gap-1.5"><FaCode className="text-purple-400" /> {challenge?.title}</h2>
              </div>
              <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                challenge?.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                challenge?.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                {challenge?.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed mt-1">
              {challenge?.description}
            </p>

            {/* Test cases summary */}
            <div className="bg-[#181822] p-3 rounded-2xl border border-white/5 mt-1 flex flex-col gap-1.5">
              <span className="text-[8px] font-black text-slate-450 uppercase tracking-wider">Example Cases</span>
              {challenge?.testCases?.map((tc, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Input: {tc.input}</span>
                  <span className="text-purple-400 font-bold">Expected: {tc.output}</span>
                </div>
              ))}
            </div>

            {/* Solution Editor */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Solution Snippet (NodeJS/JS)</span>
              <textarea
                disabled={isSolved || submitting}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-[220px] p-4 bg-[#181822] border border-white/5 rounded-2xl text-[11px] font-mono text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              />
            </div>

            {/* Action Row */}
            <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3.5">
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Challenge Reward</span>
                <span className="text-[10px] text-purple-400 font-black mt-0.5">+{challenge?.xpReward} XP / +{challenge?.coinsReward} Coins</span>
              </div>

              {isSolved ? (
                <button
                  onClick={async () => {
                    setLoadingChallenge(true);
                    try {
                      const res = await api.getRandomChallenge();
                      if (res.success) {
                        setChallenge(res.data.challenge);
                        setIsSolved(res.data.isSolved);
                        setCode(res.data.challenge?.codeTemplate || '');
                        setSubmitResult(null);
                      }
                    } catch (err) {
                      alert(err.message || 'Failed to load next challenge.');
                    } finally {
                      setLoadingChallenge(false);
                    }
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                >
                  Practice Next Challenge
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={handleSubmitSolution}
                  className="px-6 py-2.5 bg-purple-655 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {submitting ? 'Compiling...' : 'Submit Code'}
                </button>
              )}
            </div>

            {/* Submit output */}
            {submitResult && (
              <div className={`mt-3 p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
                submitResult.passed 
                  ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                <div className="mt-0.5">
                  {submitResult.passed ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    {submitResult.passed ? 'Compilation Successful' : 'Test Failures'}
                  </span>
                  <p className="mt-0.5 leading-relaxed text-[11px]">{submitResult.message}</p>
                  {submitResult.passed && submitResult.rewards && (
                    <span className="text-[9px] mt-1 text-green-400 font-bold">
                      Unlocked +{submitResult.rewards.xp} XP and +{submitResult.rewards.coins} Coins!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- QUIZ WORKSPACE --- */
          <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl flex flex-col gap-4">
            
            {quizState === 'idle' && (
              <div className="flex flex-col gap-4 text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/5 border border-purple-500/10 flex items-center justify-center text-purple-400 mx-auto">
                  <FaBookOpen size={20} />
                </div>
                <h3 className="font-black text-sm text-white uppercase tracking-wider">Ecosystem Quiz Arena</h3>
                <p className="text-[10px] text-slate-450 max-w-sm mx-auto leading-relaxed">
                  Test your skills in JavaScript, React, Databases, and System Design. Earn Coins and XP on successful passing grades (60%+ score required).
                </p>

                {/* Difficulty selector */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Select Difficulty Level</span>
                  <div className="flex justify-center gap-2">
                    {['Easy', 'Medium', 'Hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setQuizDifficulty(diff)}
                        className={`px-5 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          quizDifficulty === diff 
                            ? 'bg-purple-650/10 border-purple-500/30 text-purple-400 font-black' 
                            : 'bg-[#181822] border-white/5 text-slate-500 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartQuiz}
                  className="mt-4 mx-auto px-8 py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {quizState === 'active' && (
              <div className="flex flex-col gap-4 text-left">
                {/* Header indicators */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-[9px] font-black text-purple-450 uppercase tracking-wider flex items-center gap-1">
                    <FaTrophy /> Question {currentQIndex + 1} of {currentQuestionsList.length}
                  </span>
                  <span className="text-[9px] font-black text-pink-400 uppercase tracking-wider flex items-center gap-1">
                    <FaHourglassHalf className="animate-spin-slow" /> {quizTimeLeft}s left
                  </span>
                </div>

                {/* Question */}
                <h4 className="font-bold text-xs text-white leading-relaxed">
                  {currentQuestionsList[currentQIndex].q}
                </h4>

                {/* Options grid */}
                <div className="flex flex-col gap-2.5 mt-2">
                  {currentQuestionsList[currentQIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className="w-full p-3 bg-[#181822]/80 hover:bg-purple-650/15 border border-white/5 hover:border-purple-500/20 rounded-xl text-left text-[11px] text-slate-200 hover:text-white font-bold cursor-pointer transition-all flex items-center gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center text-[8px] font-black text-slate-400">{String.fromCharCode(65 + idx)}</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizState === 'finished' && (
              <div className="flex flex-col gap-4 text-left">
                <h3 className="font-black text-xs text-white uppercase tracking-wider border-b border-white/5 pb-2.5">Quiz Results Overview</h3>
                
                {submittingQuiz ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className={`p-4 rounded-2xl border flex flex-col gap-1 ${
                      quizResult?.passed 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      <span className="font-black text-sm uppercase tracking-wider">{quizResult?.passed ? 'Passed ✓' : 'Failed ✗'}</span>
                      <p className="text-[11px] font-bold mt-1">{quizResult?.message}</p>
                    </div>

                    {/* Review list */}
                    <div className="flex flex-col gap-3 mt-2">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Answer Keys Review</span>
                      {currentQuestionsList.map((q, idx) => {
                        const isCorrect = userAnswers[idx] === q.answer;
                        return (
                          <div key={idx} className="p-3.5 rounded-2xl bg-[#181822] border border-white/5 flex flex-col gap-1.5 text-xs text-left">
                            <div className="flex justify-between items-start gap-3">
                              <span className="font-bold text-white text-[11px] leading-relaxed">{idx + 1}. {q.q}</span>
                              <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase shrink-0 ${isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-400 font-bold">
                              <span>Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{q.options[userAnswers[idx]] || 'Skipped'}</span></span>
                              <span>Correct answer: <span className="text-green-400">{q.options[q.answer]}</span></span>
                            </div>
                            <span className="text-[9px] text-slate-500 italic flex items-center gap-1"><FaLightbulb className="text-amber-450" /> {q.explain}</span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setQuizState('idle')}
                      className="mt-3 w-full py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer text-center"
                    >
                      Return to Arena
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Daily spin wheel dashboard (col-span-1) */}
      <div className="flex flex-col gap-6">
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl shadow-sm flex flex-col gap-4 items-center justify-between min-h-[380px]">
          <div className="w-full border-b border-white/5 pb-2 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FaGift /> Daily Spin Wheel</span>
          </div>

          {/* Interactive Wheel Circle SVG */}
          <div className="relative w-44 h-44 my-4 shrink-0 flex items-center justify-center">
            {/* Pointer pin */}
            <div className="absolute -top-1 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[12px] border-t-purple-500 z-10" />
            
            {/* Circular wheel design */}
            <div 
              className="w-full h-full rounded-full border-4 border-purple-600/20 overflow-hidden relative transition-transform duration-[3000ms] ease-out shadow-lg shadow-purple-600/5"
              style={{ transform: `rotate(${wheelOffset}deg)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-800 to-indigo-900 flex items-center justify-center">
                <div className="w-full h-full relative">
                  {/* Wheel segments separators */}
                  <div className="absolute inset-0 border-t border-white/10 rotate-45" />
                  <div className="absolute inset-0 border-t border-white/10 rotate-90" />
                  <div className="absolute inset-0 border-t border-white/10 rotate-[135deg]" />
                  <div className="absolute inset-0 border-t border-white/10 rotate-180" />
                  <div className="absolute inset-0 flex items-center justify-center text-[7px] text-white/50 font-black">
                    <span className="absolute -top-14 select-none">XP</span>
                    <span className="absolute -bottom-14 select-none">COINS</span>
                    <span className="absolute -left-14 select-none">GIFT</span>
                    <span className="absolute -right-14 select-none">XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spin button center */}
            <button
              disabled={spinning}
              onClick={handleSpinWheel}
              className="absolute w-12 h-12 rounded-full bg-purple-650 hover:bg-purple-700 text-white font-black text-[9px] uppercase tracking-wider flex items-center justify-center border border-purple-500/30 cursor-pointer shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {spinning ? '...' : 'Spin'}
            </button>
          </div>

          <div className="w-full">
            {wheelResult ? (
              <div className="p-3 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl text-center text-[10px] font-black uppercase tracking-wider">
                {wheelResult}
              </div>
            ) : (
              <p className="text-[10px] text-slate-455 text-center leading-snug">
                Spin once every 24 hours to earn free Developer Coins or XP bonuses!
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CodingChallenges;
