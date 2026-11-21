'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, AlertTriangle, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';

interface AvailableSection {
  id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  sectionCode: string;
  faculty: string;
  capacity: number;
  enrolled: number;
  schedule: string;
  prerequisite?: string;
  isEnrolled: boolean;
  hasConflict?: boolean;
}

const mockCatalog: AvailableSection[] = [
  {
    id: 'sec-1',
    courseCode: 'CS101',
    courseTitle: 'Introduction to Programming',
    credits: 3.0,
    sectionCode: 'Section 01',
    faculty: 'Dr. Alan Turing',
    capacity: 30,
    enrolled: 28,
    schedule: 'Mon/Wed 09:00 - 10:30',
    isEnrolled: true
  },
  {
    id: 'sec-2',
    courseCode: 'CS102',
    courseTitle: 'Data Structures and Algorithms',
    credits: 4.0,
    sectionCode: 'Section 01',
    faculty: 'Dr. Alan Turing',
    capacity: 30,
    enrolled: 18,
    schedule: 'Tue/Thu 14:00 - 15:30',
    prerequisite: 'CS101',
    isEnrolled: true
  },
  {
    id: 'sec-3',
    courseCode: 'MATH201',
    courseTitle: 'Discrete Mathematics',
    credits: 3.0,
    sectionCode: 'Section 01',
    faculty: 'Dr. Ada Lovelace',
    capacity: 30,
    enrolled: 24,
    schedule: 'Mon 09:30 - 11:00',
    isEnrolled: false,
    hasConflict: true // Overlaps with CS101!
  },
  {
    id: 'sec-4',
    courseCode: 'SE301',
    courseTitle: 'Software Architecture and Design',
    credits: 3.0,
    sectionCode: 'Section 01',
    faculty: 'Dr. Ada Lovelace',
    capacity: 25,
    enrolled: 25, // Full capacity!
    schedule: 'Fri 10:00 - 13:00',
    prerequisite: 'CS102',
    isEnrolled: false
  }
];

export default function CourseRegistrationPage() {
  const [sections, setSections] = useState(mockCatalog);
  const [notification, setNotification] = useState<{ type: 'SUCCESS' | 'ERROR'; msg: string } | null>(null);

  const handleRegister = (section: AvailableSection) => {
    if (section.enrolled >= section.capacity) {
      setNotification({ type: 'ERROR', msg: `Registration failed: ${section.courseCode} section capacity has been reached (${section.capacity}/${section.capacity}).` });
      return;
    }
    if (section.hasConflict) {
      setNotification({ type: 'ERROR', msg: `Schedule conflict detected: ${section.courseCode} (${section.schedule}) overlaps with enrolled class CS101 (Mon/Wed 09:00-10:30).` });
      return;
    }

    setSections(prev =>
      prev.map(s => (s.id === section.id ? { ...s, isEnrolled: true, enrolled: s.enrolled + 1 } : s))
    );
    setNotification({ type: 'SUCCESS', msg: `Successfully registered for ${section.courseCode}: ${section.courseTitle}!` });
  };

  const handleDrop = (sectionId: string) => {
    setSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, isEnrolled: false, enrolled: Math.max(0, s.enrolled - 1) } : s))
    );
    setNotification({ type: 'SUCCESS', msg: 'Course section successfully dropped from your semester schedule.' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b mb-8 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
            Fall 2026 Academic Term
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Course Registration & Enrollment Terminal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse open course sections, verify prerequisite eligibility, and add/drop classes within the semester registration window.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Registration Open &bull; Window Closes Dec 05</span>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 mb-6 animate-in fade-in ${
            notification.type === 'SUCCESS'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'SUCCESS' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="space-y-4">
        {sections.map(sec => {
          const isFull = sec.enrolled >= sec.capacity;

          return (
            <div
              key={sec.id}
              className={`p-6 bg-white border rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                sec.isEnrolled ? 'border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20' : ''
              }`}
            >
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {sec.courseCode}
                  </span>
                  <span className="text-xs text-slate-500">
                    {sec.sectionCode} &bull; {sec.credits} Credits
                  </span>
                  {sec.prerequisite && (
                    <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">
                      Prereq: {sec.prerequisite}
                    </span>
                  )}
                  {sec.hasConflict && (
                    <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" /> Schedule Overlap
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900">{sec.courseTitle}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Instructor: <span className="font-semibold text-slate-700">{sec.faculty}</span></span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {sec.schedule}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Seats: {sec.enrolled} / {sec.capacity} {isFull ? '(FULL)' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {sec.isEnrolled ? (
                  <button
                    onClick={() => handleDrop(sec.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition"
                  >
                    Drop Course
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(sec)}
                    disabled={isFull}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                    }`}
                  >
                    <span>{isFull ? 'Capacity Reached' : 'Register Section'}</span>
                    {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
