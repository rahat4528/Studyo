'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, CheckCircle, FileText, ExternalLink, AlertCircle } from 'lucide-react';

export default function GradesPage() {
  const [transcriptCode, setTranscriptCode] = useState<string | null>(null);

  const academicRecord = {
    cgpa: 3.85,
    totalCredits: 48.0,
    academicStanding: 'Dean Honors List',
    semesters: [
      {
        term: 'Fall 2026',
        gpa: 4.0,
        credits: 7.0,
        courses: [
          { code: 'CS101', title: 'Introduction to Programming', credits: 3.0, raw: 95, grade: 'A', points: 4.0 },
          { code: 'CS102', title: 'Data Structures and Algorithms', credits: 4.0, raw: 92, grade: 'A', points: 4.0 }
        ]
      },
      {
        term: 'Spring 2026',
        gpa: 3.70,
        credits: 6.0,
        courses: [
          { code: 'MATH201', title: 'Discrete Mathematics', credits: 3.0, raw: 88, grade: 'B', points: 3.0 },
          { code: 'ENG101', title: 'Technical Communication', credits: 3.0, raw: 96, grade: 'A', points: 4.0 }
        ]
      }
    ]
  };

  const handleRequestTranscript = () => {
    setTranscriptCode('TRN-PORTAL-A7F2D84C');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Academic Standing Summary */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b gap-6">
          <div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
              Official Academic Record
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Gradebook & Unofficial Transcript
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Program: B.S. in Software Engineering &bull; Student ID: STU-2026-001
            </p>
          </div>

          <div className="text-center bg-slate-50 border p-4 rounded-xl min-w-[140px]">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative CGPA</span>
            <span className="text-3xl font-black text-emerald-800 mt-0.5 block">{academicRecord.cgpa}</span>
            <span className="text-xs text-emerald-700 font-semibold">{academicRecord.academicStanding}</span>
          </div>
        </div>

        {/* Sealed Transcript Request Banner */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-emerald-700 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Sealed Official Transcript Verification</h4>
              <p className="text-xs text-slate-500">
                All financial dues are cleared. You are eligible to generate an immutable verifiable credential.
              </p>
            </div>
          </div>

          {transcriptCode ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border">
                {transcriptCode}
              </span>
              <Link
                href={`/transcripts/verify/${transcriptCode}`}
                className="text-xs font-bold bg-emerald-700 text-white px-3.5 py-2 rounded-lg hover:bg-emerald-800 transition flex items-center space-x-1"
              >
                <span>Verify Publicly</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <button
              onClick={handleRequestTranscript}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Issue Sealed Transcript</span>
            </button>
          )}
        </div>
      </div>

      {/* Semester Grade Tables */}
      <div className="space-y-6">
        {academicRecord.semesters.map(sem => (
          <div key={sem.term} className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{sem.term}</h3>
                <span className="text-xs text-slate-500 font-medium">{sem.credits} Registered Credits</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Term GPA</span>
                <span className="text-base font-bold text-emerald-800">{sem.gpa.toFixed(2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5">Course</th>
                    <th className="py-2.5">Title</th>
                    <th className="py-2.5 text-center">Credits</th>
                    <th className="py-2.5 text-center">Marks</th>
                    <th className="py-2.5 text-center">Grade</th>
                    <th className="py-2.5 text-right">Grade Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {sem.courses.map(c => (
                    <tr key={c.code} className="hover:bg-slate-50/60">
                      <td className="py-3 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="py-3 font-medium">{c.title}</td>
                      <td className="py-3 text-center">{c.credits.toFixed(1)}</td>
                      <td className="py-3 text-center">{c.raw} / 100</td>
                      <td className="py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800">
                          {c.grade}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-semibold">{c.points.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
