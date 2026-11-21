'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, Users, ArrowRight, ShieldCheck, Palette, Video } from 'lucide-react';

export default function AcademiesIndexPage() {
  const academies = [
    {
      slug: 'fullstack-academy',
      name: 'Fullstack Craft Academy',
      creator: 'Sarah Connor',
      tagline: 'Master Production Microservices & Distributed Architecture',
      themeColor: '#4f46e5',
      courseCount: 3,
      studentsCount: 1420,
      featuredCourse: {
        id: 'c-micro-1',
        title: 'Advanced Microservices Architecture',
        price: '$49.00',
        dripEnabled: true
      }
    },
    {
      slug: 'design-mastery',
      name: 'Design Mastery Lab',
      creator: 'Alex Rivera',
      tagline: 'Systematic Design Systems, Figma Tokens & Component Architecture',
      themeColor: '#ec4899',
      courseCount: 2,
      studentsCount: 890,
      featuredCourse: {
        id: 'c-design-1',
        title: 'Enterprise Design Systems with Tokens',
        price: '$39.00',
        dripEnabled: false
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-purple-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-violet-500/20 text-violet-300 text-xs px-3.5 py-1 rounded-full font-semibold mb-4 border border-violet-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator-Owned Sovereign Academies</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            Independent Online Schools & Academies
          </h1>
          <p className="text-violet-200 text-base sm:text-lg leading-relaxed mb-6">
            Empowering expert educators to deliver branded curriculum with drip schedules, secure expiring video tokens, and direct checkout funnels.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-violet-400" />
              Tenant Isolated Stores
            </span>
            <span className="flex items-center">
              <Video className="w-4 h-4 mr-1.5 text-violet-400" />
              Expiring Signed Video URLs
            </span>
            <span className="flex items-center">
              <Palette className="w-4 h-4 mr-1.5 text-violet-400" />
              Custom Creator Themes
            </span>
          </div>
        </div>
      </div>

      {/* Academies Directory */}
      <div className="flex items-center justify-between pb-4 border-b mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Featured Creator Academies</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore branded learning storefronts hosted on sovereign sub-routes</p>
        </div>
        <Link
          href="/creator/dashboard"
          className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center space-x-1"
        >
          <span>Creator Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {academies.map(school => (
          <div
            key={school.slug}
            className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                  style={{ backgroundColor: school.themeColor }}
                >
                  {school.name.substring(0, 2).toUpperCase()}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2.5 py-1 rounded-md font-semibold">
                  /s/{school.slug}
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">{school.name}</h3>
              <p className="text-xs font-semibold text-slate-500 mb-3">By {school.creator}</p>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{school.tagline}</p>

              {/* Featured Course Callout */}
              <div className="bg-slate-50 border rounded-xl p-4 mb-6">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Featured Course
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">{school.featuredCourse.title}</span>
                  <span className="text-sm font-black text-violet-700">{school.featuredCourse.price}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {school.courseCount} Courses
                </span>
                <span>&bull;</span>
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {school.studentsCount} Learners
                </span>
              </div>

              <Link
                href={`/s/${school.slug}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition shadow-sm"
                style={{ backgroundColor: school.themeColor }}
              >
                <span>Visit Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
