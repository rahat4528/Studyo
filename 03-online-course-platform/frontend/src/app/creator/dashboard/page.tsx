'use client';

import React, { useState } from 'react';
import { BookOpen, DollarSign, Tag, Users, Plus, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CreatorDashboardPage() {
  const [coupons, setCoupons] = useState([
    { code: 'SAVE20', discount: '20% Off', redeemed: 14, max: 50, active: true },
    { code: 'VIPDEV', discount: '$10.00 Off', redeemed: 8, max: 20, active: true }
  ]);

  const salesMetrics = {
    grossRevenue: '$4,120.00',
    discountsApplied: '$420.00',
    refunds: '$49.00',
    netRevenue: '$3,651.00',
    totalStudents: 142
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b mb-8 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded inline-block mb-2">
            Creator Studio &bull; Fullstack Craft Academy
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Course Publishing & Revenue Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Author modular lessons, configure server-enforced drip schedules, and monitor decimal-accurate sales.
          </p>
        </div>

        <button className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition">
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border p-5 rounded-2xl shadow-sm text-center">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Gross Sales</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{salesMetrics.grossRevenue}</span>
          <span className="text-[11px] text-slate-400">Decimal arithmetic verified</span>
        </div>

        <div className="bg-white border p-5 rounded-2xl shadow-sm text-center">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Coupons & Discounts</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{salesMetrics.discountsApplied}</span>
          <span className="text-[11px] text-slate-400">Promotional codes</span>
        </div>

        <div className="bg-white border p-5 rounded-2xl shadow-sm text-center">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Refunds Processed</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{salesMetrics.refunds}</span>
          <span className="text-[11px] text-slate-400">1 access revocation</span>
        </div>

        <div className="bg-white border p-5 rounded-2xl shadow-sm text-center">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Net Creator Earnings</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{salesMetrics.netRevenue}</span>
          <span className="text-[11px] text-emerald-600 font-medium">{salesMetrics.totalStudents} Enrollments</span>
        </div>
      </div>

      {/* Coupon Manager */}
      <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Promotional Coupons & Redemptions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enforces race-safe transactional redemption counters</p>
          </div>
          <button className="text-xs font-bold text-violet-700 hover:text-violet-900 border px-3 py-1.5 rounded-lg">
            Create Code
          </button>
        </div>

        <div className="space-y-3">
          {coupons.map(cpn => (
            <div key={cpn.code} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold bg-white border px-2.5 py-1 rounded text-violet-800">
                  {cpn.code}
                </span>
                <span className="text-sm font-semibold text-slate-800">{cpn.discount}</span>
              </div>
              <div className="flex items-center space-x-6 text-xs text-slate-500">
                <span>Redeemed: <strong className="text-slate-800">{cpn.redeemed} / {cpn.max}</strong></span>
                <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
