import { seedQuizDatabase } from '../src/database/seed';
import { AttemptService } from '../src/services/attempt.service';
import { CertificateService } from '../src/services/certificate.service';
import { db } from '../src/database/db';

describe('Certificate Generation and Public Verification Suite', () => {
  let seededData: any;

  beforeEach(async () => {
    seededData = await seedQuizDatabase();
  });

  it('should issue a verifiable certificate when formal assessment pass criteria are met', async () => {
    const student = seededData.users.student1.user;
    const quiz = seededData.quizzes[0]; // Formal assessment (pass threshold 70%)

    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    const rawAttempt = db.attempts.get(attemptView.id)!;

    // Simulate high score meeting criteria
    rawAttempt.status = 'FINALIZED';
    rawAttempt.totalPointsEarned = 18.0;
    rawAttempt.totalPointsPossible = 20.0;
    rawAttempt.scorePercentage = 90.0;
    rawAttempt.passed = true;
    db.attempts.set(rawAttempt.id, rawAttempt);

    // Issue certificate
    const cert = CertificateService.issueCertificate(rawAttempt.id, student.id);
    expect(cert.verificationCode).toMatch(/^CERT-QUIZ-[A-Z0-9]{8}$/);
    expect(cert.recipientName).toBe(student.fullName);

    // Public verification
    const verified = CertificateService.verifyCertificate(cert.verificationCode);
    expect(verified.isValid).toBe(true);
    expect(verified.certificate?.recipientName).toBe(student.fullName);
    expect(verified.certificate?.scorePercentage).toBe(90.0);
    expect(verified.certificate?.status).toBe('VALID');
  });

  it('should reject certificate issuance for practice mode quizzes', async () => {
    const student = seededData.users.student1.user;
    const practiceQuiz = seededData.quizzes[1]; // isPractice = true

    const attemptView = await AttemptService.startAttempt(practiceQuiz.id, student.id);
    const rawAttempt = db.attempts.get(attemptView.id)!;
    rawAttempt.status = 'FINALIZED';
    rawAttempt.passed = true;
    rawAttempt.scorePercentage = 100.0;
    db.attempts.set(rawAttempt.id, rawAttempt);

    expect(() => {
      CertificateService.issueCertificate(rawAttempt.id, student.id);
    }).toThrow(/Certificates cannot be issued for practice mode/);
  });

  it('should reject certificate issuance when score fails pass threshold', async () => {
    const student = seededData.users.student1.user;
    const quiz = seededData.quizzes[0];

    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    const rawAttempt = db.attempts.get(attemptView.id)!;
    rawAttempt.status = 'FINALIZED';
    rawAttempt.passed = false;
    rawAttempt.scorePercentage = 45.0; // below 70% threshold
    db.attempts.set(rawAttempt.id, rawAttempt);

    expect(() => {
      CertificateService.issueCertificate(rawAttempt.id, student.id);
    }).toThrow(/Passing criteria not met/);
  });

  it('should accurately report revoked certificates', async () => {
    const student = seededData.users.student1.user;
    const quiz = seededData.quizzes[0];

    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    const rawAttempt = db.attempts.get(attemptView.id)!;
    rawAttempt.status = 'FINALIZED';
    rawAttempt.passed = true;
    rawAttempt.scorePercentage = 85.0;
    db.attempts.set(rawAttempt.id, rawAttempt);

    const cert = CertificateService.issueCertificate(rawAttempt.id, student.id);
    CertificateService.revokeCertificate(cert.id, 'Academic misconduct investigation');

    const verified = CertificateService.verifyCertificate(cert.verificationCode);
    expect(verified.isValid).toBe(false);
    expect(verified.certificate?.status).toBe('REVOKED');
    expect(verified.certificate?.revokedReason).toBe('Academic misconduct investigation');
  });
});
