import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Studyo Code - Interactive Code Learning Platform',
  description: 'Master computer science, algorithms, and full-stack development with hands-on coding challenges and real-time execution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3]">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-[#161b22] border-b border-[#30363d] h-14 flex items-center px-4 sm:px-6 justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-mono font-bold text-white text-lg shadow">
                &lt;/&gt;
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight leading-none">Studyo Code</span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase tracking-wider">Learning Platform</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-300">
              <Link href="/" className="hover:text-emerald-400 transition">Curriculum</Link>
              <Link href="/visualizer" className="hover:text-emerald-400 transition">Algorithm Visualizer</Link>
              <Link href="/certificates/verify/SAMPLE" className="hover:text-emerald-400 transition">Verify Certificate</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-orange-950/60 border border-orange-500/40 text-orange-400 px-2.5 py-1 rounded-full text-xs font-bold">
              <span>🔥</span>
              <span>7 Day Streak</span>
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-full text-xs font-bold">
              <span>⚡</span>
              <span>1,450 XP</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center border border-emerald-500/50">
              AR
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1">
          {children}
        </main>

        {/* Minimal Dark Footer */}
        <footer className="bg-[#161b22] border-t border-[#30363d] py-6 text-xs text-slate-500 text-center">
          <p>&copy; 2026 Studyo Educational Technology Suite. Independent Code Learning Platform.</p>
          <p className="mt-1 text-slate-600">Sandboxed Execution &middot; Read-Only Ephemeral Container Isolate &middot; Zero-Leak Test Evaluation</p>
        </footer>
      </body>
    </html>
  );
}
