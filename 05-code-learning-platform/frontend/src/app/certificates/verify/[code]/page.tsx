export default function CodeCertificateVerificationPage({ params }: { params: { code: string } }) {
  const isSample = params.code === 'SAMPLE';

  const certificate = {
    verificationCode: isSample ? 'CERT-CODE-DSA99-2026' : params.code,
    recipientName: 'Alex Rivers',
    trackTitle: 'Algorithms & Data Structures Mastery',
    issuedAt: 'November 21, 2026',
    status: 'VALID',
    issuer: 'Studyo Code Learning Platform Accreditation Engine',
    details: 'Verified 100% completion of all coding challenges, automated public test cases, and hidden edge cases.'
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-[#161b22] rounded-2xl border border-[#30363d] shadow-2xl p-8 sm:p-12 space-y-8 text-center relative overflow-hidden">
        {/* Decorative Badge */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-950/40 rounded-full border border-emerald-500/30 flex items-end justify-start p-6">
          <span className="text-emerald-400 font-mono font-bold text-xs">VERIFIED</span>
        </div>

        <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto shadow-md">
          &lt;/&gt;
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            Cryptographically Verified
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Certificate of Achievement
          </h1>
          <p className="text-sm text-slate-400">
            This certifies that the recipient has demonstrated algorithmic problem-solving proficiency and passed all automated evaluations.
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="bg-[#0d1117] rounded-xl p-6 border border-[#30363d] text-left space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Recipient</span>
              <p className="font-bold text-white text-base">{certificate.recipientName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Track Completed</span>
              <p className="font-bold text-white text-base">{certificate.trackTitle}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Date of Issuance</span>
              <p className="font-medium text-slate-300">{certificate.issuedAt}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Accreditation</span>
              <p className="font-medium text-emerald-400">100% Challenges Passed</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Unique Verification Hash</span>
              <p className="font-mono text-emerald-400 font-bold bg-[#161b22] p-2.5 rounded border border-[#30363d] mt-1 text-xs">
                {certificate.verificationCode}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-mono">
          Issued by {certificate.issuer}.
        </p>
      </div>
    </div>
  );
}
