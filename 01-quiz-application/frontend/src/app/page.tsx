'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, Award, ShieldAlert, BookOpen, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface QuizCardProps {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  maxAttempts: number;
  passPercentage: number;
  isPractice: boolean;
  hasNegativeMarks: boolean;
  questionCount: number;
  description: string;
}

const mockQuizzes: QuizCardProps[] = [
  {
    id: 'quiz-formal-1',
    title: 'Biology & Systems Midterm Assessment',
    category: 'Cellular Biology & Computer Systems',
    difficulty: 'INTERMEDIATE',
    timeLimit: 30,
    maxAttempts: 2,
    passPercentage: 70,
    isPractice: false,
    hasNegativeMarks: true,
    questionCount: 7,
    description: 'Comprehensive high-stakes examination across 7 question types including multiple-choice, matching, fill-in-the-blanks, and essay.'
  },
  {
    id: 'quiz-practice-1',
    title: 'Cellular Biology Practice Lab',
    category: 'Cellular Biology',
    difficulty: 'BEGINNER',
    timeLimit: 0,
    maxAttempts: 0,
    passPercentage: 60,
    isPractice: true,
    hasNegativeMarks: false,
    questionCount: 3,
    description: 'Self-paced formative practice quiz featuring instant validation, detailed explanations, and unlimited attempts.'
  }
];

export default function CatalogPage() {
  const [filter, setFilter] = useState<'ALL' | 'FORMAL' | 'PRACTICE'>('ALL');

  const filtered = mockQuizzes.filter(q => {
    if (filter === 'FORMAL') return !q.isPractice;
    if (filter === 'PRACTICE') return q.isPractice;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg mb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/30 text-indigo-200 text-xs px-3 py-1 rounded-full font-semibold mb-4 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Integrity Assessment Environment</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-3">
            Academic Assessment & Evaluation
          </h1>
          <p className="text-indigo-100 text-base leading-relaxed">
            Welcome to the Studyo Quiz system. Formal assessments enforce server-side timer authority, tamper-resistant randomized question sequences, and multi-criteria scoring. Practice quizzes offer instant feedback for conceptual mastery.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b pb-4 mb-8">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border'
            }`}
          >
            All Quizzes ({mockQuizzes.length})
          </button>
          <button
            onClick={() => setFilter('FORMAL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === 'FORMAL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border'
            }`}
          >
            Formal Assessments
          </button>
          <button
            onClick={() => setFilter('PRACTICE')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === 'PRACTICE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border'
            }`}
          >
            Practice Labs
          </button>
        </div>

        <Link
          href="/teacher/dashboard"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
        >
          <span>Open Teacher Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(quiz => (
          <div
            key={quiz.id}
            className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                  {quiz.category}
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                  {quiz.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {quiz.title}
              </h2>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {quiz.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {quiz.timeLimit > 0 ? `${quiz.timeLimit} Minutes` : 'Untimed Practice'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{quiz.questionCount} Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span>Pass: {quiz.passPercentage}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  {quiz.hasNegativeMarks ? (
                    <span className="flex items-center text-amber-700">
                      <ShieldAlert className="w-4 h-4 mr-1 text-amber-500" /> Negative Marks
                    </span>
                  ) : (
                    <span className="flex items-center text-emerald-700">
                      <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> No Penalties
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {quiz.isPractice ? 'Unlimited Attempts' : `Max Attempts: ${quiz.maxAttempts}`}
              </span>

              <Link
                href={`/quiz/${quiz.id}/take`}
                className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  quiz.isPractice
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <span>{quiz.isPractice ? 'Start Practice Lab' : 'Begin Assessment'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
