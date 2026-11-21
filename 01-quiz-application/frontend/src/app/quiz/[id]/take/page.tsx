'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, CheckCircle2, AlertCircle, Bookmark, ArrowLeft, ArrowRight, Send, Check } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  prompt: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_IN_THE_BLANKS' | 'MATCHING' | 'ESSAY';
  points: number;
  options?: { id: string; label: string }[];
  matchingPrompts?: string[];
  matchingResponses?: string[];
  blankCount?: number;
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    title: 'Mitochondria Function',
    prompt: 'Which cellular organelle is predominantly responsible for the generation of adenosine triphosphate (ATP) via aerobic respiration?',
    type: 'MULTIPLE_CHOICE',
    points: 2.0,
    options: [
      { id: 'opt-1', label: 'Mitochondrion' },
      { id: 'opt-2', label: 'Golgi apparatus' },
      { id: 'opt-3', label: 'Lysosome' },
      { id: 'opt-4', label: 'Ribosome' }
    ]
  },
  {
    id: 'q2',
    title: 'Plant Cell Structures',
    prompt: 'Which of the following structures are present in typical eukaryotic plant cells but absent in animal cells? (Select all that apply)',
    type: 'MULTIPLE_SELECT',
    points: 3.0,
    options: [
      { id: 'opt-2-1', label: 'Cell wall made of cellulose' },
      { id: 'opt-2-2', label: 'Chloroplasts' },
      { id: 'opt-2-3', label: 'Mitochondria' },
      { id: 'opt-2-4', label: 'Centrioles (typical)' }
    ]
  },
  {
    id: 'q3',
    title: 'Cache Memory Volatility',
    prompt: 'True or False: Static Random-Access Memory (SRAM) used in CPU L1 and L2 caches is non-volatile and preserves state without electrical power.',
    type: 'TRUE_FALSE',
    points: 1.0,
    options: [
      { id: 'opt-3-1', label: 'True' },
      { id: 'opt-3-2', label: 'False' }
    ]
  },
  {
    id: 'q4',
    title: 'Protein Synthesis Organelle',
    prompt: 'Name the complex molecular machine found within all living cells that serves as the primary site of biological protein synthesis.',
    type: 'SHORT_ANSWER',
    points: 2.0
  },
  {
    id: 'q5',
    title: 'Transport Layer Protocols',
    prompt: 'In the internet protocol suite, [blank1] provides reliable, ordered stream delivery, whereas [blank2] provides connectionless datagram delivery with minimal latency.',
    type: 'FILL_IN_THE_BLANKS',
    points: 2.0,
    blankCount: 2
  },
  {
    id: 'q6',
    title: 'Network Layers Matching',
    prompt: 'Match each networking protocol or device with its corresponding OSI Reference Model layer.',
    type: 'MATCHING',
    points: 3.0,
    matchingPrompts: ['HTTP/HTTPS', 'IPv4 / IPv6', 'Ethernet Switch'],
    matchingResponses: ['Application Layer (Layer 7)', 'Network Layer (Layer 3)', 'Data Link Layer (Layer 2)']
  },
  {
    id: 'q7',
    title: 'Mitosis vs Meiosis Essay',
    prompt: 'Compare and contrast the biological significance, genetic outcomes, and chromosome number regulation of mitosis versus meiosis in sexually reproducing organisms.',
    type: 'ESSAY',
    points: 5.0
  }
];

export default function QuizPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.id || 'formal-assessment';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 minutes
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [autosaveStatus, setAutosaveStatus] = useState<'SAVED' | 'SAVING'>('SAVED');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = () => {
    router.push(`/quiz/${quizId}/results`);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAutosaveStatus('SAVING');
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      setAutosaveStatus('SAVED');
    }, 400);
  };

  const toggleFlag = (questionId: string) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const currentQ = mockQuestions[currentIndex];
  const isLast = currentIndex === mockQuestions.length - 1;
  const isFirst = currentIndex === 0;

  const answeredCount = Object.keys(answers).filter(k => {
    const a = answers[k];
    if (Array.isArray(a)) return a.length > 0;
    if (typeof a === 'object' && a !== null) return Object.keys(a).length > 0;
    return typeof a === 'string' && a.trim().length > 0;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Distraction-Free Header Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-800 text-sm md:text-base">
            Biology & Systems Midterm Assessment
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            Attempt #1
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Autosave status indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            {autosaveStatus === 'SAVED' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Autosaved</span>
              </>
            ) : (
              <>
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            )}
          </div>

          {/* Cosmetic countdown timer */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
              secondsRemaining < 120
                ? 'bg-rose-100 text-rose-700 animate-pulse'
                : secondsRemaining < 300
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish Test</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          <div className="bg-white border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded">
                  Question {currentIndex + 1} of {mockQuestions.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentQ.points} Points
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {currentQ.type}
                </span>
              </div>

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded transition ${
                  flagged[currentQ.id]
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Prompt */}
            <h3 className="text-lg font-semibold text-slate-900 mb-6 leading-relaxed">
              {currentQ.prompt}
            </h3>

            {/* Type-Specific Interactive Input */}
            <div className="space-y-4">
              {/* Type 1: MULTIPLE_CHOICE */}
              {currentQ.type === 'MULTIPLE_CHOICE' && currentQ.options && (
                <div className="space-y-2.5">
                  {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleAnswerChange(currentQ.id, opt.id)}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQ.id}`}
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span className="ml-3 text-sm font-medium">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Type 2: MULTIPLE_SELECT */}
              {currentQ.type === 'MULTIPLE_SELECT' && currentQ.options && (
                <div className="space-y-2.5">
                  <div className="text-xs text-indigo-600 font-semibold mb-2">
                    Partial credit awarded for each correct selection
                  </div>
                  {currentQ.options.map(opt => {
                    const selectedList: string[] = answers[currentQ.id] || [];
                    const isChecked = selectedList.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        onClick={() => {
                          const updated = isChecked
                            ? selectedList.filter(id => id !== opt.id)
                            : [...selectedList, opt.id];
                          handleAnswerChange(currentQ.id, updated);
                        }}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                          isChecked
                            ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span className="ml-3 text-sm font-medium">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Type 3: TRUE_FALSE */}
              {currentQ.type === 'TRUE_FALSE' && (
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {['True', 'False'].map(val => {
                    const isSelected = answers[currentQ.id] === val;
                    return (
                      <button
                        key={val}
                        onClick={() => handleAnswerChange(currentQ.id, val)}
                        className={`py-4 px-6 rounded-xl font-bold text-sm border transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 4: SHORT_ANSWER */}
              {currentQ.type === 'SHORT_ANSWER' && (
                <div>
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Type your concise response here..."
                    className="w-full max-w-lg px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Answers are automatically normalized for casing, spacing, and diacritics.
                  </p>
                </div>
              )}

              {/* Type 5: FILL_IN_THE_BLANKS */}
              {currentQ.type === 'FILL_IN_THE_BLANKS' && (
                <div className="space-y-4 max-w-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-slate-600 w-16">[blank1]:</span>
                    <input
                      type="text"
                      value={answers[currentQ.id]?.blank1 || ''}
                      onChange={e => {
                        const existing = answers[currentQ.id] || {};
                        handleAnswerChange(currentQ.id, { ...existing, blank1: e.target.value });
                      }}
                      placeholder="Protocol 1..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-slate-600 w-16">[blank2]:</span>
                    <input
                      type="text"
                      value={answers[currentQ.id]?.blank2 || ''}
                      onChange={e => {
                        const existing = answers[currentQ.id] || {};
                        handleAnswerChange(currentQ.id, { ...existing, blank2: e.target.value });
                      }}
                      placeholder="Protocol 2..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Type 6: MATCHING */}
              {currentQ.type === 'MATCHING' && currentQ.matchingPrompts && currentQ.matchingResponses && (
                <div className="space-y-3 max-w-xl">
                  {currentQ.matchingPrompts.map(promptItem => {
                    const currentMatch = answers[currentQ.id]?.[promptItem] || '';
                    return (
                      <div key={promptItem} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 border rounded-lg gap-2">
                        <span className="text-sm font-semibold text-slate-800">{promptItem}</span>
                        <select
                          value={currentMatch}
                          onChange={e => {
                            const existing = answers[currentQ.id] || {};
                            handleAnswerChange(currentQ.id, { ...existing, [promptItem]: e.target.value });
                          }}
                          className="px-3 py-1.5 border rounded-md text-xs font-medium bg-white focus:ring-indigo-500"
                        >
                          <option value="">-- Choose Match --</option>
                          {currentQ.matchingResponses!.map(resp => (
                            <option key={resp} value={resp}>{resp}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type 7: ESSAY */}
              {currentQ.type === 'ESSAY' && (
                <div>
                  <textarea
                    rows={6}
                    value={answers[currentQ.id] || ''}
                    onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Provide a comprehensive academic explanation..."
                    className="w-full p-4 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                    <span>Essays are evaluated by instructors with rubrics.</span>
                    <span>Words: {(answers[currentQ.id] || '').trim().split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-6">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={isFirst}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border transition ${
                isFirst
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {isLast ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <span>Review & Submit</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(mockQuestions.length - 1, prev + 1))}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar (1 Col) */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Question Palette
            </h4>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {mockQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                const isFlagged = flagged[q.id];

                let bg = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (isCurrent) {
                  bg = 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700 font-bold border-indigo-400';
                } else if (isAnswered) {
                  bg = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-lg border text-xs flex items-center justify-center transition ${bg}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs text-slate-600 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
                  Answered
                </span>
                <span className="font-semibold">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 mr-2" />
                  Unanswered
                </span>
                <span className="font-semibold">{mockQuestions.length - answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" />
                  Flagged
                </span>
                <span className="font-semibold">{Object.values(flagged).filter(Boolean).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Confirm Test Submission
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              You have answered <span className="font-semibold text-slate-900">{answeredCount} of {mockQuestions.length}</span> questions. Once submitted, your answers will be finalized by the assessment engine.
            </p>

            {answeredCount < mockQuestions.length && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-6 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>You still have {mockQuestions.length - answeredCount} unattempted questions!</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Continue Assessment
              </button>
              <button
                onClick={() => router.push(`/quiz/${quizId}/results`)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                Submit Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
