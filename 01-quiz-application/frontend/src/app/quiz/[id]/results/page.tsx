'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle, XCircle, Clock, RotateCcw, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function QuizResultsPage() {
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  // Mock finalized evaluation data
  const result = {
    quizTitle: 'Biology & Systems Midterm Assessment',
    attemptNumber: 1,
    status: 'FINALIZED',
    totalPointsEarned: 16.5,
    totalPointsPossible: 20.0,
    scorePercentage: 82.5,
    passed: true,
    passScorePercentage: 70.0,
    timeSpent: '21 minutes 40 seconds',
    submittedAt: 'November 21, 2026 8:30 PM',
    showCorrectAnswers: true,
    questions: [
      {
        id: 'q1',
        title: 'Mitochondria Function',
        earned: 2.0,
        max: 2.0,
        isCorrect: true,
        userAnswer: 'Mitochondrion',
        correctAnswer: 'Mitochondrion',
        explanation: 'Mitochondria produce ATP through oxidative phosphorylation.'
      },
      {
        id: 'q2',
        title: 'Plant Cell Structures',
        earned: 3.0,
        max: 3.0,
        isCorrect: true,
        userAnswer: 'Cell wall made of cellulose, Chloroplasts',
        correctAnswer: 'Cell wall made of cellulose, Chloroplasts',
        explanation: 'Plant cells have cellulose walls and chloroplasts.'
      },
      {
        id: 'q3',
        title: 'Cache Memory Volatility',
        earned: 1.0,
        max: 1.0,
        isCorrect: true,
        userAnswer: 'False',
        correctAnswer: 'False',
        explanation: 'SRAM is volatile.'
      },
      {
        id: 'q4',
        title: 'Protein Synthesis Organelle',
        earned: 2.0,
        max: 2.0,
        isCorrect: true,
        userAnswer: 'Ribosome',
        correctAnswer: 'Ribosome',
        explanation: 'Ribosomes translate mRNA sequences.'
      },
      {
        id: 'q5',
        title: 'Transport Layer Protocols',
        earned: 2.0,
        max: 2.0,
        isCorrect: true,
        userAnswer: '[blank1]: TCP, [blank2]: UDP',
        correctAnswer: '[blank1]: TCP, [blank2]: UDP',
        explanation: 'TCP guarantees reliability; UDP offers minimal latency.'
      },
      {
        id: 'q6',
        title: 'Network Layers Matching',
        earned: 2.0,
        max: 3.0,
        isCorrect: false,
        userAnswer: 'HTTP -> L7, TCP -> L4, IP -> L2 (Partial)',
        correctAnswer: 'HTTP -> L7, TCP -> L4, IP -> L3',
        explanation: 'IP is a Layer 3 Network protocol.'
      },
      {
        id: 'q7',
        title: 'Mitosis vs Meiosis Essay',
        earned: 4.5,
        max: 5.0,
        isCorrect: true,
        userAnswer: 'Mitosis creates 2 identical diploid cells; meiosis yields 4 diverse haploid gametes.',
        correctAnswer: 'Evaluated by Prof. Elena Rostova with Rubric',
        explanation: 'Instructor feedback: Thorough genetic diversity mechanisms cited.'
      }
    ]
  };

  const handleIssueCertificate = () => {
    setIssuedCode('CERT-QUIZ-8B3FA910');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Score Summary Card */}
      <div className="bg-white border rounded-2xl p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>Assessment Summary</span>
              <span>&bull;</span>
              <span>Attempt #{result.attemptNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {result.quizTitle}
            </h1>
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {result.timeSpent}
              </span>
              <span>Submitted: {result.submittedAt}</span>
            </div>
          </div>

          {/* Pass/Fail circular visual */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-2xl font-black text-emerald-700">
                {result.scorePercentage}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Passed
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-2 font-medium">
              Threshold: {result.passScorePercentage}%
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b text-center">
          <div>
            <span className="block text-xs text-slate-400 font-medium">Points Earned</span>
            <span className="text-xl font-bold text-slate-900">{result.totalPointsEarned}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Points Possible</span>
            <span className="text-xl font-bold text-slate-900">{result.totalPointsPossible}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Evaluation State</span>
            <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded inline-block mt-1">
              {result.status}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Negative Marks</span>
            <span className="text-sm font-semibold text-slate-700 mt-1 inline-block">Active (-0.25)</span>
          </div>
        </div>

        {/* Certificate Section */}
        {result.passed && (
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50 -mx-8 -mb-8 p-8 rounded-b-2xl border-t border-emerald-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Official Completion Credential Ready
                </h4>
                <p className="text-xs text-emerald-800">
                  You satisfied the institutional pass threshold of {result.passScorePercentage}%.
                </p>
              </div>
            </div>

            {issuedCode ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-emerald-300 font-bold text-emerald-800">
                  {issuedCode}
                </span>
                <Link
                  href={`/certificates/verify/${issuedCode}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold bg-emerald-600 text-white px-3.5 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  <span>View Public Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleIssueCertificate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim Certificate</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Answer Review Section */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b">
          Question Review & Assessment Breakdown
        </h3>

        <div className="space-y-6">
          {result.questions.map((q, idx) => (
            <div
              key={q.id}
              className={`p-5 rounded-xl border ${
                q.isCorrect ? 'border-slate-200 bg-slate-50/40' : 'border-amber-200 bg-amber-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold bg-white border px-2 py-0.5 rounded text-slate-600">
                    Q{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{q.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {q.isCorrect ? (
                    <span className="inline-flex items-center text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded">
                      <XCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Partial / Incorrect
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-700">
                    {q.earned} / {q.max} pts
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 mt-3 space-y-1">
                <div><span className="font-semibold text-slate-500">Your Answer:</span> {q.userAnswer}</div>
                <div><span className="font-semibold text-slate-500">Key Criteria:</span> {q.correctAnswer}</div>
                <div className="text-slate-600 italic mt-2 pt-2 border-t border-slate-200/60">
                  &ldquo;{q.explanation}&rdquo;
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            &larr; Back to Catalog
          </Link>
          <Link
            href="/quiz/quiz-practice-1/take"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Launch Practice Lab</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
