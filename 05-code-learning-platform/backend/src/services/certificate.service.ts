import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { Certificate } from '../types';

export class CertificateService {
  /**
   * Verifies if a user has solved 100% of the challenges in a track
   */
  public verifyTrackCompletion(trackId: string, userId: string): boolean {
    const track = db.tracks.get(trackId);
    if (!track) return false;

    // Collect all challenge IDs in the track
    const challengeIds: string[] = [];
    for (const chapter of track.chapters) {
      for (const challenge of chapter.challenges) {
        challengeIds.push(challenge.id);
      }
    }

    if (challengeIds.length === 0) return false;

    // Check if user has an ACCEPTED submission for every challenge
    for (const cId of challengeIds) {
      const hasAccepted = Array.from(db.submissions.values()).some(
        s => s.userId === userId && s.challengeId === cId && s.verdict === 'ACCEPTED'
      );
      if (!hasAccepted) {
        return false;
      }
    }

    return true;
  }

  /**
   * Issues verifiable certificate upon track completion
   */
  public claimTrackCertificate(trackId: string, userId: string, recipientName: string): Certificate {
    const isComplete = this.verifyTrackCompletion(trackId, userId);
    if (!isComplete) {
      throw new Error('Track completion criteria not met: All challenges must have accepted solutions');
    }

    const track = db.tracks.get(trackId);
    if (!track) throw new Error('Track not found');

    const existing = Array.from(db.certificates.values()).find(
      c => c.trackId === trackId && c.userId === userId
    );
    if (existing) return existing;

    const verificationCode = `CERT-CODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const cert: Certificate = {
      id: randomUUID(),
      userId,
      trackId,
      verificationCode,
      recipientName,
      trackTitle: track.title,
      issuedAt: new Date().toISOString(),
    };

    db.certificates.set(cert.id, cert);
    return cert;
  }

  public verifyCertificate(verificationCode: string): Certificate | null {
    return Array.from(db.certificates.values()).find(c => c.verificationCode === verificationCode) || null;
  }
}

export const certificateService = new CertificateService();
