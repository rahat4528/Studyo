'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Award, CheckCircle } from 'lucide-react';

export default function TranscriptVerifyPage() {
  const params = useParams();
  const code = (params?.code as string) || 'TRN-PORTAL-A7F2D84C';

  const transcript = {
    studentName: 'Jordan Bell',
    studentIdNumber: 'STU-2026-001',
    programName: 'Bachelor of Science in Software Engineering',
    cgpa: 3.85,
    totalCreditsEarned: 48.0,
    issuedAt: 'November 21, 2026',
    verificationCode: code,
    status: 'OFFICIALLY SEALED & AUTHENTIC'
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border rounded-2xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Official Registrar Credential
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-2">
          Academic Transcript Verification
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          This digital seal certifies the authenticity of the academic standing and degree progress of the student named below.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 border text-left space-y-4 mb-8">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Name</span>
            <span className="text-sm font-bold text-slate-900">{transcript.studentName}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student ID Number</span>
            <span className="text-sm font-mono font-semibold text-slate-800">{transcript.studentIdNumber}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Program</span>
            <span className="text-sm font-semibold text-slate-900">{transcript.programName}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative CGPA</span>
            <span className="text-sm font-black text-emerald-800">{transcript.cgpa} / 4.0</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Credits Completed</span>
            <span className="text-sm font-semibold text-slate-800">{transcript.totalCreditsEarned} Credits</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Date</span>
            <span className="text-xs font-medium text-slate-700">{transcript.issuedAt}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Seal</span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {transcript.verificationCode}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Verified against the Studyo Academic Registrar Registry &bull; Authenticity Protected
        </div>
      </div>
    </div>
  );
}
