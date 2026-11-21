'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Plus, Upload, Download, RefreshCw, BarChart2,
  CheckCircle, FileText, ArrowRight, ShieldCheck
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<'QUIZZES' | 'QUESTIONS' | 'GRADING' | 'ANALYTICS'>('QUIZZES');
  const [regradeNotice, setRegradeNotice] = useState<string | null>(null);

  // Mock quizzes
  const [quizzes, setQuizzes] = useState([
    {
      id: 'q-1',
      title: 'Biology & Systems Midterm Assessment',
      category: 'Cellular Biology',
      attempts: 42,
      averageScore: '81.4%',
      published: true
    },
    {
      id: 'q-2',
      title: 'Cellular Biology Practice Lab',
      category: 'Cellular Biology',
      attempts: 128,
      averageScore: '88.2%',
      published: true
    }
  ]);

  // Mock pending essays for grading
  const [pendingEssays, setPendingEssays] = useState([
    {
      id: 'ess-1',
      attemptId: 'att-101',
      studentName: 'Jordan Bell',
      quizTitle: 'Biology & Systems Midterm Assessment',
      questionTitle: 'Mitosis vs Meiosis Essay',
      response: 'Mitosis involves one division resulting in two diploid somatic cells. Meiosis consists of two successive divisions that yield four haploid gametes with genetic recombination from prophase I crossing over.',
      maxPoints: 5.0,
      awardedPoints: 4.5,
      feedback: 'Accurate biological distinction of divisions and ploidy.'
    }
  ]);

  const handleRegrade = (quizId: string) => {
    setRegradeNotice(`Regrade triggered for Quiz #${quizId}: 42 student attempts recalculated and GradeRevision audit log written.`);
    setTimeout(() => setRegradeNotice(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b mb-8 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded inline-block mb-2">
            Instructor Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Assessment Management & Grading
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Author quizzes, curate multi-type question banks, evaluate subjective essays, and inspect psychometric analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition">
            <Plus className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>
        </div>
      </div>

      {regradeNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{regradeNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b space-x-6 mb-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('QUIZZES')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'QUIZZES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quizzes & Assessments ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('QUESTIONS')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'QUESTIONS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Question Bank (7 Types)
        </button>
        <button
          onClick={() => setActiveTab('GRADING')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'GRADING'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Essay Grading Queue ({pendingEssays.length})
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'ANALYTICS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Psychometrics & Analytics
        </button>
      </div>

      {/* TAB 1: QUIZZES */}
      {activeTab === 'QUIZZES' && (
        <div className="space-y-4">
          {quizzes.map(q => (
            <div key={q.id} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {q.category}
                  </span>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    Published
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{q.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
                  <span>{q.attempts} Completed Attempts</span>
                  <span>&bull;</span>
                  <span>Avg Score: {q.averageScore}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRegrade(q.id)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Trigger Regrade</span>
                </button>
                <Link
                  href={`/quiz/${q.id}/take`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition"
                >
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'QUESTIONS' && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b mb-6 gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Type Question Bank</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports Multiple Choice, Multiple Select, True/False, Short Answer, Fill-in-the-Blanks, Matching, and Essays.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV / JSON</span>
              </button>
              <button className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Export Bank</span>
              </button>
              <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>New Question</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Mitochondria Function', type: 'MULTIPLE_CHOICE', points: 2.0, cat: 'Cellular Biology' },
              { title: 'Plant Cell Structures', type: 'MULTIPLE_SELECT', points: 3.0, cat: 'Cellular Biology' },
              { title: 'Cache Memory Volatility', type: 'TRUE_FALSE', points: 1.0, cat: 'Computer Systems' },
              { title: 'Protein Synthesis Organelle', type: 'SHORT_ANSWER', points: 2.0, cat: 'Cellular Biology' },
              { title: 'Transport Layer Protocols', type: 'FILL_IN_THE_BLANKS', points: 2.0, cat: 'Computer Systems' },
              { title: 'Network Layers Matching', type: 'MATCHING', points: 3.0, cat: 'Computer Systems' },
              { title: 'Mitosis vs Meiosis Essay', type: 'ESSAY', points: 5.0, cat: 'Cellular Biology' },
            ].map((q, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono bg-white border px-2 py-0.5 rounded text-slate-600">
                    {q.type}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{q.title}</span>
                  <span className="text-xs text-slate-400">({q.cat})</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-600">{q.points} pts</span>
                  <button className="text-xs text-indigo-600 hover:underline font-semibold">Edit Criteria</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESSAY GRADING */}
      {activeTab === 'GRADING' && (
        <div className="space-y-6">
          {pendingEssays.map(essay => (
            <div key={essay.id} className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b mb-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase">
                    {essay.quizTitle}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {essay.questionTitle}
                  </h3>
                  <span className="text-xs text-slate-500">Student: {essay.studentName}</span>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded font-semibold">
                  Pending Manual Evaluation
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-800 leading-relaxed mb-6 border border-slate-100">
                <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Submitted Student Text:
                </span>
                &ldquo;{essay.response}&rdquo;
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Score (Max {essay.maxPoints})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    max={essay.maxPoints}
                    min={0}
                    defaultValue={essay.awardedPoints}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Rubric Criteria & Constructive Feedback
                  </label>
                  <input
                    type="text"
                    defaultValue={essay.feedback}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition">
                  Finalize Essay Score & Release
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm md:col-span-1">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Score Distribution (N=42)
            </h3>
            <div className="space-y-3">
              {[
                { range: '81 - 100%', count: 24, pct: 57 },
                { range: '61 - 80%', count: 12, pct: 28 },
                { range: '41 - 60%', count: 4, pct: 10 },
                { range: '21 - 40%', count: 2, pct: 5 },
                { range: '0 - 20%', count: 0, pct: 0 },
              ].map(d => (
                <div key={d.range} className="text-xs">
                  <div className="flex justify-between text-slate-600 mb-1 font-medium">
                    <span>{d.range}</span>
                    <span>{d.count} students ({d.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm md:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Psychometric Indicators (Difficulty P & Discrimination D)
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { title: 'Mitochondria Function (MC)', p: '0.92', d: '0.35', status: 'Ideal' },
                { title: 'Plant Cell Structures (MS)', p: '0.74', d: '0.48', status: 'Strong Discriminator' },
                { title: 'Cache Memory Volatility (TF)', p: '0.85', d: '0.28', status: 'Good' },
                { title: 'Transport Layer Protocols (FIB)', p: '0.68', d: '0.52', status: 'High Discriminator' },
                { title: 'Mitosis vs Meiosis (Essay)', p: '0.71', d: '0.44', status: 'Balanced' },
              ].map(item => (
                <div key={item.title} className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                  <span className="font-semibold text-slate-800">{item.title}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-600">P = <span className="font-mono font-bold">{item.p}</span></span>
                    <span className="text-slate-600">D = <span className="font-mono font-bold text-indigo-700">{item.d}</span></span>
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
