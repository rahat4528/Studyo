'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap, Calendar, Clock, CheckCircle2, ShieldCheck,
  AlertCircle, BookOpen, User, FileText, ArrowRight
} from 'lucide-react';

export default function StudentDashboardPage() {
  const student = {
    name: 'Jordan Bell',
    studentId: 'STU-2026-001',
    program: 'B.S. in Software Engineering',
    semester: 'Fall 2026',
    creditsEnrolled: 15.0,
    creditsCompleted: 48.0,
    creditsTotal: 128.0,
    cgpa: 3.85,
    attendanceRate: 96.4,
    financialCleared: true,
    enrolledCourses: [
      {
        code: 'CS101',
        title: 'Introduction to Programming',
        section: 'Section 01',
        credits: 3.0,
        faculty: 'Dr. Alan Turing',
        schedule: 'Mon/Wed 09:00 - 10:30',
        room: 'Hall A',
        attendance: '95%'
      },
      {
        code: 'CS102',
        title: 'Data Structures and Algorithms',
        section: 'Section 01',
        credits: 4.0,
        faculty: 'Dr. Alan Turing',
        schedule: 'Tue/Thu 14:00 - 15:30',
        room: 'Lab 3',
        attendance: '98%'
      },
      {
        code: 'MATH201',
        title: 'Discrete Mathematics',
        section: 'Section 02',
        credits: 3.0,
        faculty: 'Dr. Ada Lovelace',
        schedule: 'Tue/Thu 10:00 - 11:30',
        room: 'Room 204',
        attendance: '96%'
      }
    ]
  };

  const progressPercentage = Math.round((student.creditsCompleted / student.creditsTotal) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Student Profile Card */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-inner">
              JB
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{student.name}</h1>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-semibold px-2.5 py-0.5 rounded border border-emerald-200">
                  {student.studentId}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {student.program} &bull; <span className="text-slate-700 font-medium">{student.semester}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/registration"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Registration</span>
            </Link>
            <Link
              href="/grades"
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Official Records</span>
            </Link>
          </div>
        </div>

        {/* High-Level Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative CGPA</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block">{student.cgpa}</span>
            <span className="text-[11px] text-slate-400">Scale: 4.0</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Credits</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{student.creditsEnrolled}</span>
            <span className="text-[11px] text-slate-400">Max limit: 18.0</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{student.attendanceRate}%</span>
            <span className="text-[11px] text-emerald-600 font-medium">Good Standing</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Financial Clearance</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded inline-block mt-2">
              Cleared (No Dues)
            </span>
          </div>
        </div>
      </div>

      {/* Degree Progress Bar */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Degree Progress: {student.program}
          </span>
          <span className="text-xs font-bold text-slate-800">
            {student.creditsCompleted} / {student.creditsTotal} Credits ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Enrolled Courses & Schedule */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enrolled Courses & Class Timetable</h2>
            <p className="text-xs text-slate-500 mt-0.5">Academic sessions for {student.semester}</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            3 Active Sections
          </span>
        </div>

        <div className="space-y-4">
          {student.enrolledCourses.map(course => (
            <div
              key={course.code}
              className="p-5 border rounded-xl hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {course.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {course.section} &bull; {course.credits} Credits
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {course.faculty}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {course.schedule} ({course.room})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <span className="block text-[11px] text-slate-400 font-medium">Attendance</span>
                  <span className="text-sm font-bold text-emerald-700">{course.attendance}</span>
                </div>
                <button className="text-xs text-slate-600 hover:text-emerald-700 font-semibold border px-3 py-1.5 rounded-lg bg-white">
                  View Syllabus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
