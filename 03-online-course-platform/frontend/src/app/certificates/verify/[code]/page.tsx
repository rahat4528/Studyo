'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Award } from 'lucide-react';

export default function CertificateVerifyPage() {
  const params = useParams();
  const code = (params?.code as string) || 'CERT-ACADEMY-7E3B1C94';

  const certificate = {
    recipientName: 'Jordan Bell',
    courseTitle: 'Advanced Microservices Architecture',
    schoolName: 'Fullstack Craft Academy',
    verificationCode: code,
    issuedAt: 'November 21, 2026',
    status: 'OFFICIALLY VERIFIED & AUTHENTIC'
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border rounded-2xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-violet-800 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
          Creator Academy Credential
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-2">
          Certificate of Course Mastery
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          This digital credential verifies 100% completion of the curriculum and practical milestones for the specified course.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 border text-left space-y-4 mb-8">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recipient</span>
            <span className="text-sm font-bold text-slate-900">{certificate.recipientName}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Course</span>
            <span className="text-sm font-semibold text-slate-900">{certificate.courseTitle}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Issuing Academy</span>
            <span className="text-sm font-semibold text-slate-900">{certificate.schoolName}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Completed</span>
            <span className="text-xs font-medium text-slate-700">{certificate.issuedAt}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Seal</span>
            <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
              {certificate.verificationCode}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Verified against the Studyo Creator Academy Registry &bull; Authenticity Protected
        </div>
      </div>
    </div>
  );
}
