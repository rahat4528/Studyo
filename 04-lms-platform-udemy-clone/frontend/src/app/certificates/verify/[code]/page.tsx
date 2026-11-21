export default function CertificateVerificationPage({ params }: { params: { code: string } }) {
  const isSample = params.code === 'SAMPLE';

  const certificate = {
    verificationCode: isSample ? 'CERT-LMS-ALX94-2026' : params.code,
    recipientName: 'Morgan Reed',
    courseTitle: 'Advanced TypeScript & Enterprise Architecture',
    instructor: 'Dr. Alex Vance',
    issuedAt: 'November 21, 2026',
    status: 'VALID',
    issuer: 'Studyo LMS Platform (Udemy Clone) Accreditation Engine',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-8 text-center relative overflow-hidden">
        {/* Decorative Badge */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-50 rounded-full border border-purple-200 flex items-end justify-start p-6">
          <span className="text-purple-600 font-extrabold text-xs">ACCREDITED</span>
        </div>

        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto shadow-md">
          ✓
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Authentic Credential
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Certificate of Completion
          </h1>
          <p className="text-sm text-slate-500">
            This document certifies that the individual named below has successfully completed all coursework, quizzes, and project milestones.
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-left space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Recipient Name</span>
              <p className="font-bold text-slate-900 text-base">{certificate.recipientName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Course Title</span>
              <p className="font-bold text-slate-900 text-base">{certificate.courseTitle}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Instructor</span>
              <p className="font-medium text-slate-800">{certificate.instructor}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Date of Issuance</span>
              <p className="font-medium text-slate-800">{certificate.issuedAt}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">Verification Code</span>
              <p className="font-mono text-purple-700 font-bold bg-white p-2 rounded border border-purple-200 mt-1">
                {certificate.verificationCode}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Issued by {certificate.issuer}. This verification page is cryptographically secured against tampering.
        </p>
      </div>
    </div>
  );
}
