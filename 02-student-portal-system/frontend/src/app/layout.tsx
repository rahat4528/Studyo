import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Studyo Student Portal - Academic Information & Registrar System',
  description: 'Enterprise institutional administration, course registration, gradebook, and student records.',
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
                <span className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  SP
                </span>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Studyo <span className="text-emerald-700">Portal</span>
                </span>
              </Link>
              <span className="hidden md:inline-block text-xs uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Registrar Platform
              </span>
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-slate-600 hover:text-emerald-700 transition">
                Student Desk
              </Link>
              <Link href="/registration" className="text-slate-600 hover:text-emerald-700 transition">
                Registration
              </Link>
              <Link href="/grades" className="text-slate-600 hover:text-emerald-700 transition">
                Grades & Transcript
              </Link>
              <Link href="/faculty" className="text-slate-600 hover:text-emerald-700 transition">
                Faculty Hub
              </Link>
              <div className="flex items-center pl-4 border-l border-slate-200">
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                  ID: STU-2026-001
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
            Studyo Student Portal System &bull; Institutional Academic Administration & Student Information System
          </div>
        </footer>
      </body>
    </html>
  );
}
