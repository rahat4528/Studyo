'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CoursePlayerPage({ params }: { params: { courseId: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa' | 'reviews'>('overview');
  const [currentLesson, setCurrentLesson] = useState('Conditional Types & Template Literal Types');
  const [notes, setNotes] = useState([
    { id: 'n1', timestamp: '04:12', text: 'Important rule: distributive conditional types only occur on naked type parameters.' },
  ]);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([...notes, { id: Date.now().toString(), timestamp: '05:40', text: newNote }]);
    setNewNote('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950 text-white">
      {/* Top Learning Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1 font-medium">
            &larr; Back to Marketplace
          </Link>
          <span className="text-slate-600">|</span>
          <span className="font-semibold text-slate-200 truncate max-w-md">
            Advanced TypeScript & Enterprise Architecture
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-1/3"></div>
            </div>
            <span className="text-slate-400">33% completed</span>
          </div>
          <Link
            href="/certificates/verify/SAMPLE"
            className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded font-semibold hover:bg-purple-600/30 transition"
          >
            Claim Certificate
          </Link>
        </div>
      </div>

      {/* Main Player Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Video + Tabs Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* HTML5 Video Player Frame */}
          <div className="relative aspect-video bg-black flex items-center justify-center border-b border-slate-800">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-600/80 text-white flex items-center justify-center mx-auto text-2xl cursor-pointer hover:bg-purple-600 transition shadow-lg">
                ▶
              </div>
              <p className="text-sm font-semibold text-slate-300">{currentLesson}</p>
              <p className="text-xs text-slate-500">Secured via short-lived HMAC token &middot; DRM active</p>
            </div>
          </div>

          {/* Player Tab Navigation */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 flex gap-6 text-sm">
            {(['overview', 'notes', 'qa', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 font-semibold uppercase tracking-wider text-xs border-b-2 transition ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'qa' ? 'Q&A Discussions' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content Panes */}
          <div className="p-6 text-slate-300 space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">About this lesson</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  In this lesson, we explore how TypeScript models conditional type distribution across union types.
                  We contrast distributive behavior with non-distributive types using tuple wrapping `[T] extends [any]`.
                </p>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
                  <span className="font-bold text-purple-400">Exercise Code Sample:</span>
                  <pre className="bg-slate-950 p-3 rounded font-mono text-emerald-400">
{`type ToArray<Type> = Type extends any ? Type[] : never;
type StrOrNumArr = ToArray<string | number>; // string[] | number[]`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-xl font-bold text-white">Timestamped Notes</h2>
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Create a new note at 05:40..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                    >
                      Save Note at 05:40
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-2">
                  {notes.map(n => (
                    <div key={n.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-sm flex gap-3">
                      <span className="bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded text-xs font-mono font-bold self-start">
                        {n.timestamp}
                      </span>
                      <p className="text-slate-300">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Questions & Answers</h2>
                  <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition">
                    Ask a Question
                  </button>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2 text-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white">Does infer work inside nested tuple structures?</h3>
                    <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded font-semibold">Resolved</span>
                  </div>
                  <p className="text-xs text-slate-400">Asked by Tyler M. &middot; 2 days ago</p>
                  <div className="mt-2 pl-3 border-l-2 border-purple-500 text-xs text-slate-300">
                    <span className="font-bold text-purple-400">Dr. Alex Vance (Instructor):</span> Yes! TypeScript can unpack recursive nested tuples using pattern matching.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-xl font-bold text-white">Leave a Review</h2>
                <p className="text-xs text-slate-400">
                  Reviews are gated to verified students who have completed at least 20% of course content.
                </p>
                <div className="flex items-center gap-2 text-amber-400 text-xl">
                  {'★'.repeat(5)}
                </div>
                <textarea
                  placeholder="Share your experience with this course..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  rows={3}
                />
                <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition">
                  Submit Verified Review
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Curriculum Sidebar */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
            Course Content
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800 text-xs">
            <div className="p-3 bg-slate-850 font-semibold text-slate-400">
              Module 1: Type Systems & Advanced Generics
            </div>
            {[
              { title: 'Conditional Types & Template Literal Types', duration: '10:00', done: true },
              { title: 'Distributive Conditional Types in Practice', duration: '12:30', done: false },
              { title: 'Infer Keyword Mastery', duration: '15:45', done: false },
              { title: 'Module 1 Knowledge Check (Quiz)', duration: '10 Questions', done: false },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentLesson(item.title)}
                className={`p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition ${
                  currentLesson === item.title ? 'bg-purple-950/40 border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={item.done}
                    readOnly
                    className="rounded bg-slate-800 border-slate-700 text-purple-600"
                  />
                  <span className={`font-medium ${currentLesson === item.title ? 'text-purple-300' : 'text-slate-300'}`}>
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{item.duration}</span>
              </div>
            ))}

            <div className="p-3 bg-slate-850 font-semibold text-slate-400">
              Module 2: Clean Architecture in Node.js
            </div>
            {[
              { title: 'Decoupling Core Domain from External I/O', duration: '15:00', done: false },
              { title: 'Repository Pattern & Dependency Injection', duration: '18:20', done: false },
              { title: 'Capstone Project Assignment', duration: 'Submission', done: false },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentLesson(item.title)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <input type="checkbox" readOnly className="rounded bg-slate-800 border-slate-700 text-purple-600" />
                  <span className="font-medium text-slate-300">{item.title}</span>
                </div>
                <span className="text-[10px] text-slate-500">{item.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
