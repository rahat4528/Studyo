import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = {
    id: params.id,
    title: 'Advanced TypeScript & Enterprise Architecture',
    subtitle: 'Master production-grade TypeScript, domain-driven design, and scalable backend patterns',
    instructor: 'Dr. Alex Vance',
    instructorBio: 'Senior Software Architect & Distributed Systems Specialist with 15+ years experience building enterprise systems.',
    rating: 4.9,
    ratingCount: 1420,
    studentsCount: 9850,
    price: '$29.99',
    updatedAt: 'November 2026',
    sections: [
      {
        title: 'Module 1: Type Systems & Advanced Generics',
        lessonsCount: 5,
        duration: '2h 15m',
        lessons: [
          { title: 'Conditional Types & Template Literal Types', duration: '10:00', isPreview: true },
          { title: 'Distributive Conditional Types in Practice', duration: '12:30', isPreview: false },
          { title: 'Infer Keyword Mastery', duration: '15:45', isPreview: false },
        ]
      },
      {
        title: 'Module 2: Clean Architecture in Node.js',
        lessonsCount: 6,
        duration: '3h 40m',
        lessons: [
          { title: 'Decoupling Core Domain from External I/O', duration: '15:00', isPreview: false },
          { title: 'Repository Pattern & Dependency Injection', duration: '18:20', isPreview: false },
        ]
      }
    ],
    reviews: [
      { author: 'Jordan K.', rating: 5, comment: 'The section on template literal types completely transformed how we write our API clients!' },
      { author: 'Samantha W.', rating: 5, comment: 'Clear explanations, practical enterprise examples, and responsive Q&A discussions.' },
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Course Hero Banner */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Development &gt; Software Architecture
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300">
              {course.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
              <span className="bg-yellow-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded">Bestseller</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <span>{course.rating}</span>
                <span>{'★'.repeat(5)}</span>
                <span className="text-slate-400 font-normal">({course.ratingCount.toLocaleString()} ratings)</span>
              </div>
              <span className="text-slate-400">{course.studentsCount.toLocaleString()} students</span>
            </div>

            <div className="text-xs text-slate-400 pt-1">
              <span>Created by <span className="text-purple-300 font-semibold">{course.instructor}</span></span>
              <span className="mx-2">&middot;</span>
              <span>Last updated {course.updatedAt}</span>
              <span className="mx-2">&middot;</span>
              <span>English [Auto-generated Captions]</span>
            </div>
          </div>

          {/* Sticky Purchase Card (Desktop) */}
          <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="aspect-video bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600"
                  alt="Thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-purple-600 shadow-lg group-hover:scale-110 transition">
                    ▶
                  </div>
                </div>
                <span className="absolute bottom-2 text-white text-xs font-bold bg-slate-950/80 px-2 py-1 rounded">
                  Preview this course
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{course.price}</span>
                <span className="text-sm line-through text-slate-400">$84.99</span>
                <span className="text-xs font-bold text-purple-600">65% off</span>
              </div>

              <div className="space-y-2">
                <Link
                  href={`/learn/${course.id}`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-center block shadow hover:shadow-purple-500/25 transition"
                >
                  Go to Course / Enroll
                </Link>
                <button className="w-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-2.5 rounded-lg transition">
                  Add to Cart
                </button>
              </div>

              <p className="text-center text-xs text-slate-500">
                30-Day Money-Back Guarantee &middot; Full Lifetime Access
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">✔ 18.5 hours on-demand video</div>
              <div className="flex items-center gap-2">✔ 12 downloadable resources</div>
              <div className="flex items-center gap-2">✔ Assignments & interactive quizzes</div>
              <div className="flex items-center gap-2">✔ Certificate of completion</div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">What you'll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="flex gap-2"><span>✔</span><span>Build production TypeScript enterprise applications</span></div>
              <div className="flex gap-2"><span>✔</span><span>Model domain entities with clean architectural boundaries</span></div>
              <div className="flex gap-2"><span>✔</span><span>Implement mapped types, conditional types, and tuple manipulation</span></div>
              <div className="flex gap-2"><span>✔</span><span>Automate unit and integration testing pipelines</span></div>
            </div>
          </div>

          {/* Course Content Accordion */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Course content</h2>
              <span className="text-xs text-slate-500">2 sections &middot; 11 lectures &middot; 5h 55m total</span>
            </div>

            <div className="space-y-3">
              {course.sections.map((sec, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex justify-between items-center cursor-pointer font-semibold text-sm text-slate-800">
                    <span>{sec.title}</span>
                    <span className="text-xs text-slate-500 font-normal">{sec.duration}</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {sec.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="px-4 py-2.5 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">▶</span>
                          <span className="text-slate-800 font-medium">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {lesson.isPreview && (
                            <span className="text-purple-600 font-bold underline cursor-pointer">Preview</span>
                          )}
                          <span className="text-slate-400">{lesson.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Bio */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Instructor</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white font-bold text-2xl flex items-center justify-center flex-shrink-0">
                AV
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900">{course.instructor}</h3>
                <p className="text-xs text-purple-600 font-medium">Verified Instructor &middot; 4.9 Instructor Rating</p>
                <p className="text-sm text-slate-600 pt-2">{course.instructorBio}</p>
              </div>
            </div>
          </div>

          {/* Student Reviews */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Featured Reviews</h2>
            <div className="space-y-4">
              {course.reviews.map((rev, rIdx) => (
                <div key={rIdx} className="border-b border-slate-100 pb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">{rev.author}</span>
                    <span className="text-amber-500 text-xs">{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
