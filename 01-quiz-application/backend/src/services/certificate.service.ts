import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Certificate } from '../types';

export class CertificateService {
  /**
   * Issues a certificate if the attempt meets the formal passing criteria
   */
  public static issueCertificate(attemptId: string, userId: string): Certificate {
    const attempt = db.attempts.get(attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new Error('Unauthorized attempt certificate request');
    }

    const quiz = db.quizzes.get(attempt.quizId);
    if (!quiz) {
      throw new Error('Associated quiz not found');
    }

    if (quiz.isPractice) {
      throw new Error('Certificates cannot be issued for practice mode quizzes');
    }

    if (attempt.status !== 'FINALIZED' && attempt.status !== 'AUTO_GRADED') {
      throw new Error('Certificates can only be issued for finalized assessments');
    }

    if (!attempt.passed) {
      throw new Error(
        `Passing criteria not met. Required: ${quiz.passScorePercentage}%, achieved: ${attempt.scorePercentage}%`
      );
    }

    // Check if certificate already exists
    for (const cert of db.certificates.values()) {
      if (cert.attemptId === attemptId) {
        return cert;
      }
    }

    const user = db.users.get(userId);
    const recipientName = user ? user.fullName : 'Verified Student';
    const verificationCode = `CERT-QUIZ-${uuidv4().substring(0, 8).toUpperCase()}`;

    const certificate: Certificate = {
      id: uuidv4(),
      attemptId,
      userId,
      recipientName,
      quizTitle: quiz.title,
      scorePercentage: attempt.scorePercentage,
      verificationCode,
      issuedAt: new Date().toISOString(),
      isRevoked: false
    };

    db.certificates.set(certificate.id, certificate);
    return certificate;
  }

  /**
   * Public verification returning minimal verifiable details
   */
  public static verifyCertificate(code: string): {
    isValid: boolean;
    certificate?: {
      recipientName: string;
      quizTitle: string;
      scorePercentage: number;
      issuedAt: string;
      verificationCode: string;
      status: 'VALID' | 'REVOKED';
      revokedReason?: string;
    };
  } {
    const normalized = code.trim().toUpperCase();
    for (const cert of db.certificates.values()) {
      if (cert.verificationCode.toUpperCase() === normalized) {
        return {
          isValid: !cert.isRevoked,
          certificate: {
            recipientName: cert.recipientName,
            quizTitle: cert.quizTitle,
            scorePercentage: cert.scorePercentage,
            issuedAt: cert.issuedAt,
            verificationCode: cert.verificationCode,
            status: cert.isRevoked ? 'REVOKED' : 'VALID',
            revokedReason: cert.revokedReason
          }
        };
      }
    }

    return { isValid: false };
  }

  public static revokeCertificate(certificateId: string, reason: string): Certificate {
    const cert = db.certificates.get(certificateId);
    if (!cert) {
      throw new Error('Certificate not found');
    }

    cert.isRevoked = true;
    cert.revokedReason = reason;
    db.certificates.set(cert.id, cert);
    return cert;
  }
}
