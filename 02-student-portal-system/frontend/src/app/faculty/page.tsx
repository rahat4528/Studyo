'use client';

import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Save, FileCheck } from 'lucide-react';

export default function FacultyHubPage() {
  const [activeSection, setActiveSection] = useState('sec-cs101');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const roster = [
    { studentId: 'STU-2026-001', name: 'Jordan Bell', status: 'PRESENT', midtermMarks: 94 },
    { studentId: 'STU-2026-002', name: 'Morgan Reed', status: 'PRESENT', midtermMarks: 86 },
    { studentId: 'STU-2026-003', name: 'Casey Taylor', status: 'LATE', midtermMarks: 78 }
  ];

  const handleSaveAttendance = () => {
    setSaveStatus('Daily session attendance recorded and synced to institutional audit log.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b mb-8 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
            Faculty Instructional Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Section Rosters & Grade Entry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Instructor: Dr. Alan Turing &bull; Department of Computer Science & Engineering
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 mb-6">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Roster Card */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">CS101: Introduction to Programming</h2>
            <span className="text-xs text-slate-500">Section 01 &bull; Mon/Wed 09:00 - 10:30 (Hall A)</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-mono">
              Session: Today (72h Window Active)
            </span>
            <button
              onClick={handleSaveAttendance}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Session</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5">Student ID</th>
                <th className="py-2.5">Student Name</th>
                <th className="py-2.5 text-center">Session Status</th>
                <th className="py-2.5 text-right">Midterm Exam (Max 100)</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {roster.map(r => (
                <tr key={r.studentId} className="hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-bold text-slate-900">{r.studentId}</td>
                  <td className="py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="py-3 text-center">
                    <div className="inline-flex rounded-lg border p-0.5 bg-slate-50">
                      {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(st => (
                        <button
                          key={st}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                            r.status === st ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <input
                      type="number"
                      defaultValue={r.midtermMarks}
                      className="w-20 px-2 py-1 border rounded text-right font-mono font-bold text-xs focus:ring-emerald-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
