import { seedPortalDatabase } from '../src/database/seed';
import { EnrollmentService } from '../src/services/enrollment.service';
import { db } from '../src/database/db';
import { Grade, Examination } from '../src/types';

describe('Enrollment Rule Engine & Conflict Detection Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedPortalDatabase();
  });

  it('should block registration when prerequisite course is not completed', async () => {
    const student = seeded.students.student1;
    const secCS102 = seeded.sections.secCS102; // Prerequisite is CS101

    await expect(
      EnrollmentService.registerCourse(student.id, secCS102.id)
    ).rejects.toThrow(/Prerequisite not satisfied/);
  });

  it('should allow registration after prerequisite course has been passed', async () => {
    const student = seeded.students.student1;
    const secCS101 = seeded.sections.secCS101;
    const secCS102 = seeded.sections.secCS102;

    // Simulate student passing CS101 with grade A (4.0)
    const exam: Examination = {
      id: 'exam-cs101-final',
      sectionId: secCS101.id,
      semesterId: seeded.semester.id,
      name: 'Final Exam',
      maxMarks: 100,
      weight: 1.0,
      status: 'PUBLISHED'
    };
    db.examinations.set(exam.id, exam);

    const grade: Grade = {
      id: 'grd-cs101-1',
      examinationId: exam.id,
      studentId: student.id,
      rawMarks: 92,
      letter: 'A',
      gradePoints: 4.0,
      isRepeat: false,
      updatedAt: new Date().toISOString()
    };
    db.grades.set(grade.id, grade);

    // Now registering for CS102 should succeed
    const enrollment = await EnrollmentService.registerCourse(student.id, secCS102.id);
    expect(enrollment.status).toBe('ENROLLED');
    expect(enrollment.sectionId).toBe(secCS102.id);
  });

  it('should detect schedule conflicts between overlapping classes', async () => {
    const student = seeded.students.student1;
    const secCS101 = seeded.sections.secCS101; // Mon 09:00-10:30
    const secMathConflict = seeded.sections.secMathConflict; // Mon 09:30-11:00 (Overlaps!)

    // Register CS101
    await EnrollmentService.registerCourse(student.id, secCS101.id);

    // Attempt to register overlapping MATH201
    await expect(
      EnrollmentService.registerCourse(student.id, secMathConflict.id)
    ).rejects.toThrow(/Schedule conflict on MONDAY/);
  });

  it('should enforce seat capacity limits and reject registrations when full', async () => {
    const secCS101 = seeded.sections.secCS101; // capacity = 2
    const stu1 = seeded.students.student1;
    const stu2 = seeded.students.student2;

    await EnrollmentService.registerCourse(stu1.id, secCS101.id);
    await EnrollmentService.registerCourse(stu2.id, secCS101.id);

    expect(secCS101.enrolled).toBe(2);

    // Third student registration attempt
    const stu3 = { ...stu1, id: 'stu-3', studentIdNumber: 'STU-003' };
    db.students.set(stu3.id, stu3);

    await expect(
      EnrollmentService.registerCourse(stu3.id, secCS101.id)
    ).rejects.toThrow(/Section seat capacity reached/);
  });

  it('should block registration when student has an active administrative hold', async () => {
    const student = seeded.students.student1;
    const secCS101 = seeded.sections.secCS101;

    // Place financial hold
    db.holds.set('hold-1', {
      id: 'hold-1',
      studentId: student.id,
      type: 'FINANCIAL_HOLD',
      reason: 'Unpaid tuition balance of $1,200',
      isActive: true,
      placedAt: new Date().toISOString()
    });

    await expect(
      EnrollmentService.registerCourse(student.id, secCS101.id)
    ).rejects.toThrow(/Active administrative hold: FINANCIAL_HOLD/);
  });
});
