import { seedPortalDatabase } from '../src/database/seed';
import { TranscriptService } from '../src/services/transcript.service';
import { FinanceService } from '../src/services/finance.service';
import { db } from '../src/database/db';
import { Examination, Grade } from '../src/types';

describe('Official Transcript & Public Verification Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedPortalDatabase();
  });

  it('should block transcript issuance when student has outstanding financial dues', () => {
    const student = seeded.students.student1;
    const admin = seeded.users.adminUser.user;

    // Add unpaid tuition fee
    FinanceService.createFeeCharge(student.id, seeded.semester.id, 'Tuition Fall 2026', 2500.0);

    expect(() => {
      TranscriptService.issueTranscript(student.id, admin.id);
    }).toThrow(/Transcript issuance blocked: Student has uncleared financial dues/);
  });

  it('should generate sealed immutable transcript with verification code upon clearance', () => {
    const student = seeded.students.student1;
    const admin = seeded.users.adminUser.user;

    // Satisfy academic records: CS101 Grade A
    const exam: Examination = {
      id: 'ex-trn-1',
      sectionId: seeded.sections.secCS101.id,
      semesterId: seeded.semester.id,
      name: 'Final',
      maxMarks: 100,
      weight: 1.0,
      status: 'PUBLISHED'
    };
    db.examinations.set(exam.id, exam);
    db.grades.set('g-trn-1', {
      id: 'g-trn-1',
      examinationId: exam.id,
      studentId: student.id,
      rawMarks: 95,
      letter: 'A',
      gradePoints: 4.0,
      isRepeat: false,
      updatedAt: ''
    });

    // Clear fees
    const fee = FinanceService.createFeeCharge(student.id, seeded.semester.id, 'Tuition Fee', 1000.0);
    FinanceService.recordPayment(fee.id, student.id, 1000.0);

    // Issue sealed transcript
    const transcript = TranscriptService.issueTranscript(student.id, admin.id);
    expect(transcript.verificationCode).toMatch(/^TRN-PORTAL-[A-Z0-9]{8}$/);
    expect(transcript.isSealed).toBe(true);
    expect(transcript.cgpa).toBe(4.0);

    // Public verification
    const verified = TranscriptService.verifyTranscript(transcript.verificationCode);
    expect(verified.isValid).toBe(true);
    expect(verified.transcript?.studentName).toBe('Jordan Bell');
    expect(verified.transcript?.cgpa).toBe(4.0);
    expect(verified.transcript?.status).toBe('AUTHENTIC');
  });
});
