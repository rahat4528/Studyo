import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Studyo Online Course Platform - Creator-Owned Academies',
  description: 'Independent creator schools with branded storefronts, drip lessons, and secure streaming.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <span className="w-9 h-9 rounded-lg bg-violet-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  CP
                </span>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Studyo <span className="text-violet-700">Course Platform</span>
                </span>
              </Link>
              <span className="hidden md:inline-block text-xs uppercase tracking-wider font-semibold bg-violet-50 text-violet-800 px-2.5 py-1 rounded-full border border-violet-200">
                Creator Academies
              </span>
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-slate-600 hover:text-violet-700 transition">
                Academies
              </Link>
              <Link href="/s/fullstack-academy" className="text-slate-600 hover:text-violet-700 transition">
                Storefront Demo
              </Link>
              <Link href="/creator/dashboard" className="text-slate-600 hover:text-violet-700 transition">
                Creator Studio
              </Link>
              <div className="flex items-center pl-4 border-l border-slate-200">
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                  Role: Creator / Student
                </span>
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t bg-white py-6 mt-12 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            Studyo Online Course Platform &bull; Independent Creator-Owned Academy Infrastructure
          </div>
        </footer>
      </body>
    </html>
  );
}
