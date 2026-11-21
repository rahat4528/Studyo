import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Studyo Quiz - Dedicated Assessment & Evaluation Platform',
  description: 'High-integrity assessment engine with multi-strategy scoring and teacher analytics.',
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
                <span className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  SQ
                </span>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Studyo <span className="text-indigo-600">Quiz</span>
                </span>
              </Link>
              <span className="hidden md:inline-block text-xs uppercase tracking-wider font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                Assessment System
              </span>
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-slate-600 hover:text-indigo-600 transition">
                Assessments
              </Link>
              <Link href="/teacher/dashboard" className="text-slate-600 hover:text-indigo-600 transition">
                Teacher Studio
              </Link>
              <Link href="/certificates/verify/CERT-QUIZ-DEMO" className="text-slate-600 hover:text-indigo-600 transition">
                Verify Credential
              </Link>
              <div className="flex items-center pl-4 border-l border-slate-200">
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono">
                  Role: Student (Demo)
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
            Studyo Quiz & Assessment Engine &bull; Standalone High-Integrity Evaluation Platform
          </div>
        </footer>
      </body>
    </html>
  );
}
