import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Studyo LMS - Marketplace Learning Platform',
  description: 'Global learning marketplace with multi-instructor courses, interactive quizzes, video player, and certifications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Marketplace Global Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-md">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight">Studyo LMS</span>
                  <span className="text-[10px] text-purple-600 font-semibold tracking-wider uppercase">Marketplace</span>
                </div>
              </Link>

              <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-purple-600 px-3 py-1.5 rounded-md hover:bg-slate-100 transition">
                <span>Categories</span>
              </button>
            </div>

            {/* Global Search Bar */}
            <div className="flex-1 max-w-xl hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for anything (e.g. TypeScript, Cloud, Docker, System Design)..."
                  className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Action Links */}
            <div className="flex items-center gap-3">
              <Link
                href="/instructor/dashboard"
                className="hidden lg:inline-block text-sm font-medium text-slate-700 hover:text-purple-600 px-2 py-1"
              >
                Instructor Studio
              </Link>
              <Link
                href="/cart"
                className="p-2 text-slate-700 hover:text-purple-600 hover:bg-slate-100 rounded-full transition relative"
                title="Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium border border-slate-300 hover:bg-slate-50 text-slate-800 px-3.5 py-1.5 rounded-md transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-md shadow-sm transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-sm py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-3">Studyo LMS</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Teaching</h4>
              <ul className="space-y-2">
                <li><Link href="/instructor/dashboard" className="hover:text-white transition">Become an Instructor</Link></li>
                <li><Link href="/instructor/dashboard" className="hover:text-white transition">Instructor Verification</Link></li>
                <li><Link href="/instructor/dashboard" className="hover:text-white transition">Teaching Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Verification</h4>
              <ul className="space-y-2">
                <li><Link href="/certificates/verify/SAMPLE" className="hover:text-white transition">Verify Certificate</Link></li>
                <li><Link href="/" className="hover:text-white transition">Accreditation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal & Terms</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/" className="hover:text-white transition">30-Day Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; 2026 Studyo Educational Technology Suite. Standalone LMS Platform.</p>
            <p className="mt-2 md:mt-0 text-slate-500">ISO 4217 Currency Compliance &middot; HMAC Secure DRM &middot; Zero-Leak Assessment</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
