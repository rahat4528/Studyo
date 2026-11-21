'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Play, CheckCircle2, Lock, Award, Clock, ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';

export default function CourseLearningPlayerPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'fullstack-academy';
  const courseId = (params?.courseId as string) || 'advanced-microservices';

  const [activeLessonId, setActiveLessonId] = useState('les-1');
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({ 'les-1': true });
  const [certCode, setCertCode] = useState<string | null>(null);

  const modules = [
    {
      id: 'mod-1',
      title: 'Module 1: Domain-Driven Architecture',
      lessons: [
        {
          id: 'les-1',
          title: 'System Decomposition & Bounding Contexts',
          duration: '20 mins',
          isDripLocked: false,
          isPreview: true,
          videoUrl: '/media/stream/intro-ddd.mp4?expires=1732204800&signature=a8f9c12b7'
        },
        {
          id: 'les-2',
          title: 'Transactional Outbox & Distributed Events',
          duration: '30 mins',
          isDripLocked: true, // Drip locked for 7 days
          dripNotice: 'Unlocks 7 days post-enrollment',
          isPreview: false
        }
      ]
    }
  ];

  const totalLessonsCount = modules.flatMap(m => m.lessons).length;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const isAllComplete = completedCount === totalLessonsCount;

  const toggleComplete = (id: string) => {
    setCompletedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClaimCertificate = () => {
    setCertCode('CERT-ACADEMY-7E3B1C94');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Learning Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href={`/s/${slug}`} className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span className="text-slate-600">&bull;</span>
          <span className="text-xs font-bold text-slate-200">
            Advanced Microservices Architecture
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-400 font-medium">
            Progress: {completedCount}/{totalLessonsCount} Lessons ({Math.round((completedCount / totalLessonsCount) * 100)}%)
          </span>
          {isAllComplete && (
            <button
              onClick={handleClaimCertificate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Claim Certificate</span>
            </button>
          )}
        </div>
      </div>

      {certCode && (
        <div className="bg-emerald-950 border-b border-emerald-800 p-4 text-center text-xs text-emerald-200 flex items-center justify-center space-x-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Certificate Issued! Verification code: <strong className="font-mono text-white">{certCode}</strong></span>
          <Link href={`/certificates/verify/${certCode}`} className="underline font-bold text-emerald-300">
            View Public Verification
          </Link>
        </div>
      )}

      {/* Main Split Player */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4">
        {/* Left: Video Player & Content Area (3 Cols) */}
        <div className="lg:col-span-3 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* HTML5 Video Box */}
            <div className="aspect-video bg-black rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden shadow-2xl mb-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center mx-auto mb-3 border border-violet-500/40">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-sm font-semibold text-slate-200 block">
                  Secure Video Stream: System Decomposition & Bounding Contexts
                </span>
                <span className="text-xs font-mono text-slate-500 block mt-1">
                  Signed Token Authenticated &bull; Expiring in 14m 50s
                </span>
              </div>
            </div>

            {/* Lesson Title & Completion Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1 block">
                  Module 1 &bull; Lesson 1
                </span>
                <h1 className="text-2xl font-extrabold text-white">
                  System Decomposition & Bounding Contexts
                </h1>
              </div>

              <button
                onClick={() => toggleComplete(activeLessonId)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  completedLessons[activeLessonId]
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-violet-700 hover:bg-violet-800 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLessons[activeLessonId] ? 'Completed' : 'Mark Lesson Complete'}</span>
              </button>
            </div>

            {/* Lesson Text Content */}
            <div className="pt-6 text-sm text-slate-300 leading-relaxed space-y-4 max-w-3xl">
              <p>
                In distributed systems, effective domain decomposition separates transactions along distinct aggregate boundaries. Rather than orchestrating wide database locks across microservices, aggregate boundaries encapsulate invariants locally.
              </p>
              <p>
                Next lesson explores the Transactional Outbox pattern, ensuring atomicity between PostgreSQL mutations and asynchronous Redis message publication.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Curriculum Navigation Sidebar (1 Col) */}
        <div className="lg:col-span-1 bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Curriculum & Drip Modules
            </h3>

            {modules.map(mod => (
              <div key={mod.id} className="space-y-2 mb-6">
                <span className="text-xs font-bold text-slate-300 block mb-2">{mod.title}</span>
                {mod.lessons.map(les => {
                  const isActive = les.id === activeLessonId;
                  const isDone = completedLessons[les.id];

                  return (
                    <button
                      key={les.id}
                      disabled={les.isDripLocked}
                      onClick={() => setActiveLessonId(les.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start justify-between ${
                        les.isDripLocked
                          ? 'opacity-50 cursor-not-allowed bg-slate-900/40 border-slate-800 text-slate-500'
                          : isActive
                          ? 'bg-violet-900/30 border-violet-600 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {les.isDripLocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                        ) : isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold block">{les.title}</span>
                          <span className="text-[10px] text-slate-500">{les.duration}</span>
                          {les.isDripLocked && (
                            <span className="text-[10px] text-amber-400 block mt-0.5 font-medium">
                              {les.dripNotice}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500">
            Drip schedules calculated server-side based on enrollment date.
          </div>
        </div>
      </div>
    </div>
  );
}
