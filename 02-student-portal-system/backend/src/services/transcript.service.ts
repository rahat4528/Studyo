import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Transcript } from '../types';
import { AcademicService } from './academic.service';
import { FinanceService } from './finance.service';

export class TranscriptService {
  /**
   * Issues a sealed immutable official transcript gated by financial clearance
   */
  public static issueTranscript(studentId: string, issuerUserId: string): Transcript {
    const student = db.students.get(studentId);
    if (!student) {
      throw new Error('Student record not found');
    }

    // 1. Check Financial Clearance
    if (!FinanceService.isStudentFinanciallyCleared(studentId)) {
      throw new Error('Transcript issuance blocked: Student has uncleared financial dues');
    }

    // 2. Check Academic Holds
    const activeHolds = Array.from(db.holds.values()).filter(
      h => h.studentId === studentId && h.isActive
    );
    if (activeHolds.length > 0) {
      throw new Error(`Transcript issuance blocked by active administrative hold: ${activeHolds[0].type}`);
    }

    // 3. Compute immutable GPA & Credits
    const { cgpa, totalCredits } = AcademicService.calculateStudentGPA(studentId);
    const verificationCode = `TRN-PORTAL-${uuidv4().substring(0, 8).toUpperCase()}`;

    const transcript: Transcript = {
      id: uuidv4(),
      studentId,
      verificationCode,
      gpa: cgpa,
      cgpa,
      totalCreditsEarned: totalCredits,
      isSealed: true,
      issuedAt: new Date().toISOString()
    };

    db.transcripts.set(transcript.id, transcript);
    return transcript;
  }

  /**
   * Public verification of transcript authenticity returning minimal verifiable data
   */
  public static verifyTranscript(code: string): {
    isValid: boolean;
    transcript?: {
      studentName: string;
      studentIdNumber: string;
      programName: string;
      cgpa: number;
      totalCreditsEarned: number;
      issuedAt: string;
      verificationCode: string;
      status: 'AUTHENTIC' | 'REVOKED';
    };
  } {
    const norm = code.trim().toUpperCase();
    for (const trn of db.transcripts.values()) {
      if (trn.verificationCode.toUpperCase() === norm) {
        const student = db.students.get(trn.studentId);
        const user = student ? db.users.get(student.userId) : null;
        const program = student ? db.programs.get(student.programId) : null;

        return {
          isValid: true,
          transcript: {
            studentName: user ? user.fullName : 'Verified Graduate',
            studentIdNumber: student ? student.studentIdNumber : 'STU-000',
            programName: program ? program.name : 'Degree Program',
            cgpa: trn.cgpa,
            totalCreditsEarned: trn.totalCreditsEarned,
            issuedAt: trn.issuedAt,
            verificationCode: trn.verificationCode,
            status: 'AUTHENTIC'
          }
        };
      }
    }

    return { isValid: false };
  }
}
