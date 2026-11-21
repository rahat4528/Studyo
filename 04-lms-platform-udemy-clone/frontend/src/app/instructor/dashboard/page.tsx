import Link from 'next/link';

export default function InstructorDashboardPage() {
  const stats = [
    { label: 'Total Revenue', value: '$12,450.00', change: '+14% this month' },
    { label: 'Enrolled Students', value: '3,840', change: '+210 this week' },
    { label: 'Instructor Rating', value: '4.91', change: 'Across 620 reviews' },
    { label: 'Pending Reviews', value: '1 Course', change: 'In QA pipeline' },
  ];

  const courses = [
    {
      id: 'c1',
      title: 'Advanced TypeScript & Enterprise Architecture',
      price: '$29.99',
      status: 'PUBLISHED',
      students: 2450,
      revenue: '$8,210.00',
    },
    {
      id: 'c2',
      title: 'Docker & Container Fundamentals for Developers',
      price: 'Free',
      status: 'PUBLISHED',
      students: 1390,
      revenue: '$0.00',
    },
    {
      id: 'c3',
      title: 'Event-Driven Architectures with Kafka and RabbitMQ',
      price: '$39.99',
      status: 'IN_REVIEW',
      students: 0,
      revenue: '$0.00',
    },
    {
      id: 'c4',
      title: 'Rust for High-Performance Networking',
      price: '$49.99',
      status: 'DRAFT',
      students: 0,
      revenue: '$0.00',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Instructor Studio</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              KYC Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your courses, curriculum, student assignments, and payouts
          </p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition self-start sm:self-auto">
          + Create New Course
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</span>
            <div className="text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-xs text-purple-600 font-medium">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Course List & Moderation Lifecycle */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Courses</h2>
            <p className="text-xs text-slate-500">Monitor publication state machine and student progress</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Course Title</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Students</th>
                <th className="px-6 py-3">Earnings</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{c.title}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{c.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'IN_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{c.students.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{c.revenue}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-purple-600 hover:text-purple-800 font-semibold text-xs">
                      Edit
                    </button>
                    <button className="text-slate-500 hover:text-slate-800 font-semibold text-xs">
                      Curriculum
                    </button>
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
