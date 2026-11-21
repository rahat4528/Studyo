import Link from 'next/link';

export default function CurriculumMapPage() {
  const tracks = [
    {
      id: 't1',
      title: 'Algorithms & Data Structures',
      description: 'Master two pointers, hash maps, binary search, trees, and dynamic programming patterns.',
      progress: 65,
      chapters: [
        {
          title: 'Chapter 1: Arrays & Two Pointers',
          challenges: [
            { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', xp: 50, completed: true },
            { id: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', xp: 50, completed: true },
            { id: '3sum', title: '3Sum Zero Sum Triplets', difficulty: 'Medium', xp: 100, completed: false },
            { id: 'container-water', title: 'Container With Most Water', difficulty: 'Medium', xp: 100, completed: false },
          ]
        },
        {
          title: 'Chapter 2: Sliding Window & Hash Maps',
          challenges: [
            { id: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', xp: 100, completed: false },
            { id: 'min-window', title: 'Minimum Window Substring', difficulty: 'Hard', xp: 250, completed: false },
          ]
        }
      ]
    },
    {
      id: 't2',
      title: 'JavaScript & Node.js Mastery',
      description: 'Deep dive into asynchronous runtimes, promises, event loops, prototypes, and memory leaks.',
      progress: 30,
      chapters: [
        {
          title: 'Chapter 1: Closures, Currying & Generators',
          challenges: [
            { id: 'counter-generator', title: 'Counter Generator', difficulty: 'Easy', xp: 50, completed: true },
            { id: 'memoize-cache', title: 'Memoize Pure Functions', difficulty: 'Medium', xp: 100, completed: false },
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#161b22] to-slate-900 border border-[#30363d] rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              Interactive CS Track
            </span>
            <span className="text-xs text-slate-400">Multi-Language Sandbox (JS, TS, Python, C++)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Learn By Writing Real Code
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Solve progressive coding challenges, verify logic against automated public & hidden edge cases in a disposable sandboxed container, and visualize algorithms step-by-step.
          </p>
        </div>
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 w-full md:w-72 space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-300 font-bold">
            <span>Overall Progress</span>
            <span className="text-emerald-400">45%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[45%]"></div>
          </div>
          <div className="flex justify-between text-slate-400 pt-1">
            <span>Challenges Solved</span>
            <span className="text-white font-bold">12 / 28</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Active Streak</span>
            <span className="text-orange-400 font-bold">🔥 7 Days</span>
          </div>
        </div>
      </div>

      {/* Tracks Curriculum List */}
      <div className="space-y-8">
        {tracks.map(track => (
          <div key={track.id} className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow">
            {/* Track Header */}
            <div className="p-6 border-b border-[#30363d] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{track.title}</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{track.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{track.progress}% Completed</span>
                <Link
                  href="/certificates/verify/SAMPLE"
                  className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600/30 transition"
                >
                  Track Certificate
                </Link>
              </div>
            </div>

            {/* Chapters & Challenges */}
            <div className="divide-y divide-[#30363d]">
              {track.chapters.map((ch, idx) => (
                <div key={idx} className="p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                    {ch.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {ch.challenges.map(c => (
                      <Link
                        key={c.id}
                        href={`/challenge/${c.id}`}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between group ${
                          c.completed
                            ? 'bg-[#0d1117] border-emerald-900/50 hover:border-emerald-500/50'
                            : 'bg-[#0d1117] border-[#30363d] hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            c.completed ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {c.completed ? '✓' : '○'}
                          </span>
                          <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition">
                            {c.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            c.difficulty === 'Easy'
                              ? 'bg-emerald-950 text-emerald-400'
                              : c.difficulty === 'Medium'
                              ? 'bg-amber-950 text-amber-400'
                              : 'bg-rose-950 text-rose-400'
                          }`}>
                            {c.difficulty}
                          </span>
                          <span className="text-[11px] font-mono text-purple-400">+{c.xp} XP</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
