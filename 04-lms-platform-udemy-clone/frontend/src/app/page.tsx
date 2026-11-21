import Link from 'next/link';

export default function HomePage() {
  const categories = [
    { name: 'All Categories', active: true },
    { name: 'Web Development', active: false },
    { name: 'Cloud & DevOps', active: false },
    { name: 'Data Science', active: false },
    { name: 'Cybersecurity', active: false },
  ];

  const featuredCourses = [
    {
      id: 'c1',
      title: 'Advanced TypeScript & Enterprise Architecture',
      instructor: 'Dr. Alex Vance',
      rating: 4.9,
      ratingsCount: 1420,
      price: '$29.99',
      badge: 'Bestseller',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
      level: 'Intermediate',
      totalHours: '18.5 total hours',
    },
    {
      id: 'c2',
      title: 'Docker & Container Fundamentals for Developers',
      instructor: 'Dr. Alex Vance',
      rating: 4.8,
      ratingsCount: 890,
      price: 'Free',
      badge: 'Popular',
      image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600',
      level: 'Beginner',
      totalHours: '6.0 total hours',
    },
    {
      id: 'c3',
      title: 'High-Performance PostgreSQL for Microservices',
      instructor: 'Elena Rostova',
      rating: 4.95,
      ratingsCount: 520,
      price: '$34.99',
      badge: 'Highest Rated',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600',
      level: 'Expert',
      totalHours: '14.2 total hours',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Flash Promotion: 20% Off All Courses with Code FLASH2026
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Master In-Demand Skills from Industry Experts
            </h1>
            <p className="text-lg text-slate-300">
              Explore thousands of multi-instructor video courses, interactive quizzes, peer discussions, and verifiable certificates.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="#courses"
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-purple-500/30 transition"
              >
                Explore Courses
              </Link>
              <Link
                href="/instructor/dashboard"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 py-3 rounded-lg transition"
              >
                Become an Instructor
              </Link>
            </div>
          </div>
          <div className="hidden md:block w-80 h-64 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur shadow-2xl relative">
            <div className="space-y-4">
              <div className="h-4 bg-purple-400/30 rounded w-3/4"></div>
              <div className="h-4 bg-purple-400/20 rounded w-1/2"></div>
              <div className="pt-4 border-t border-purple-400/20 flex justify-between items-center">
                <span className="text-xs text-purple-200">Enrolled Students</span>
                <span className="text-sm font-bold text-white">45,000+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-200">Verified Instructors</span>
                <span className="text-sm font-bold text-white">1,200+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-200">Verifiable Credentials</span>
                <span className="text-sm font-bold text-white">100% On-Chain / HMAC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills & Courses */}
      <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Broad selection of courses</h2>
          <p className="text-sm text-slate-500">Choose from top courses with new additions published every month</p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {categories.map((c, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                c.active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {featuredCourses.map(course => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              {/* Course Thumbnail */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-yellow-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded shadow">
                  {course.badge}
                </span>
              </div>

              {/* Course Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500">{course.instructor}</p>
                </div>

                <div className="space-y-2">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-amber-700">{course.rating}</span>
                    <div className="flex text-amber-500">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-slate-400">({course.ratingsCount.toLocaleString()})</span>
                  </div>

                  {/* Level & Length */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{course.level}</span>
                    <span>&middot;</span>
                    <span>{course.totalHours}</span>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900">{course.price}</span>
                    <span className="text-xs font-medium text-purple-600 group-hover:underline">View Course &rarr;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Verified Instructors Only</h3>
              <p className="text-sm text-slate-600 mt-1">
                Every paid course is created by KYC-verified instructors and thoroughly reviewed by administrators before publication.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900">30-Day Money-Back Guarantee</h3>
              <p className="text-sm text-slate-600 mt-1">
                Risk-free learning. If a course doesn't meet your expectations, request a full refund within 30 days of purchase.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Verifiable Certificates</h3>
              <p className="text-sm text-slate-600 mt-1">
                Earn verifiable completion credentials with tamper-proof unique codes valid for employers and academic credit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
