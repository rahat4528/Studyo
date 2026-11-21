'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Video, Clock, CheckCircle, Tag, ShieldCheck, ArrowRight, Play, BookOpen } from 'lucide-react';

export default function SchoolStorefrontPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'fullstack-academy';

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const school = {
    name: 'Fullstack Craft Academy',
    slug,
    primaryColor: '#4f46e5',
    heroTitle: 'Master Production Microservices & Distributed Architecture',
    heroSubtitle: 'Build robust event-driven backends with domain-driven design, transactional outbox queues, and PostgreSQL.',
    courses: [
      {
        id: 'c-micro-1',
        title: 'Advanced Microservices Architecture',
        slug: 'advanced-microservices',
        description: 'Comprehensive curriculum featuring 12 modules, signed video lessons, and automated completion verification.',
        priceMinor: 4900, // $49.00
        currency: 'USD',
        lessonsCount: 16,
        previewLesson: 'System Decomposition & Domain-Driven Design'
      }
    ]
  };

  const course = school.courses[0];
  const grossPrice = (course.priceMinor / 100).toFixed(2);
  const finalPrice = appliedDiscount
    ? ((course.priceMinor * (1 - appliedDiscount / 100)) / 100).toFixed(2)
    : grossPrice;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SAVE20') {
      setAppliedDiscount(20);
      setCouponMessage('Coupon SAVE20 applied: 20% discount applied to checkout!');
    } else {
      setCouponMessage('Invalid or expired coupon code.');
      setAppliedDiscount(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Branded Academy Hero Header */}
      <div
        className="py-16 sm:py-24 text-white px-4 sm:px-6 lg:px-8 text-center"
        style={{ backgroundColor: school.primaryColor }}
      >
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1 rounded-full border border-white/20 inline-block mb-4">
            Official Storefront &bull; {school.name}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            {school.heroTitle}
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            {school.heroSubtitle}
          </p>
        </div>
      </div>

      {/* Main Storefront Catalog */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Available Programs & Courses</h2>

        <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded">
                Self-Paced with Drip Schedule
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {course.lessonsCount} Video & Text Lessons
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{course.title}</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">{course.description}</p>

            {/* Free Preview Banner */}
            <div className="bg-slate-50 border rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Play className="w-5 h-5 text-violet-700" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Free Preview Available</span>
                  <span className="text-xs text-slate-500">{course.previewLesson}</span>
                </div>
              </div>
              <Link
                href={`/s/${slug}/learn/${course.id}`}
                className="text-xs font-bold text-violet-700 hover:underline"
              >
                Watch Preview
              </Link>
            </div>
          </div>

          {/* Pricing & Checkout Card */}
          <div className="bg-slate-50 border rounded-xl p-6 flex flex-col justify-between min-w-[280px]">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                One-Time Enrollment
              </span>
              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-3xl font-black text-slate-900">${finalPrice}</span>
                {appliedDiscount && (
                  <span className="text-sm text-slate-400 line-through">${grossPrice}</span>
                )}
                <span className="text-xs text-slate-500 font-semibold">{course.currency}</span>
              </div>

              {/* Coupon Form */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1">Coupon Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="e.g. SAVE20"
                    className="flex-1 px-3 py-1.5 border rounded-lg text-xs font-mono uppercase focus:ring-violet-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] mt-1.5 ${appliedDiscount ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={`/s/${slug}/learn/${course.id}`}
              className="w-full text-center py-3 bg-violet-700 hover:bg-violet-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 mt-4"
            >
              <span>Enroll & Access Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
