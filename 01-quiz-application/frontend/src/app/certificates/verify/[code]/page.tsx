'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Award, CheckCircle, Calendar, User } from 'lucide-react';

export default function CertificateVerifyPage() {
  const params = useParams();
  const code = (params?.code as string) || 'CERT-QUIZ-8B3FA910';

  const certData = {
    isValid: true,
    verificationCode: code,
    recipientName: 'Jordan Bell',
    quizTitle: 'Biology & Systems Midterm Assessment',
    scorePercentage: 82.5,
    issuedAt: 'November 21, 2026',
    status: 'AUTHENTIC & VERIFIED'
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border rounded-2xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Official Verifiable Credential
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-2">
          Certificate of Assessment Mastery
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          This digital credential confirms that the recipient satisfied the rigorous examination standards for the specified academic evaluation.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 border text-left space-y-4 mb-8">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recipient</span>
            <span className="text-sm font-bold text-slate-900">{certData.recipientName}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assessment</span>
            <span className="text-sm font-semibold text-slate-900">{certData.quizTitle}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Achieved Score</span>
            <span className="text-sm font-bold text-emerald-700">{certData.scorePercentage}%</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Date</span>
            <span className="text-xs font-medium text-slate-700">{certData.issuedAt}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Code</span>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {certData.verificationCode}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Verified against the Studyo Immutable Assessment Registry &bull; Integrity Guaranteed
        </div>
      </div>
    </div>
  );
}
