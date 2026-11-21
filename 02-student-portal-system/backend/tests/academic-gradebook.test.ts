import { seedPortalDatabase } from '../src/database/seed';
import { AcademicService } from '../src/services/academic.service';
import { db } from '../src/database/db';
import { Examination, Grade } from '../src/types';

describe('Academic Gradebook, GPA Engine & Audit Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedPortalDatabase();
  });

  it('should gate examination marks until approved and published by administrators', () => {
    const student = seeded.students.student1;
    const sec = seeded.sections.secCS101;

    const exam: Examination = {
      id: 'exam-draft-1',
      sectionId: sec.id,
      semesterId: seeded.semester.id,
      name: 'Midterm Exam',
      maxMarks: 100,
      weight: 1.0,
      status: 'DRAFT'
    };
    db.examinations.set(exam.id, exam);

    const grade: Grade = {
      id: 'g-draft-1',
      examinationId: exam.id,
      studentId: student.id,
      rawMarks: 88,
      letter: 'B',
      gradePoints: 3.0,
      isRepeat: false,
      updatedAt: new Date().toISOString()
    };
    db.grades.set(grade.id, grade);

    // Student request: must be filtered out
    const studentGrades = AcademicService.getStudentGrades(student.id, 'STUDENT');
    expect(studentGrades.length).toBe(0);

    // Administrator request: can view draft marks
    const adminGrades = AcademicService.getStudentGrades(student.id, 'ADMINISTRATOR');
    expect(adminGrades.length).toBe(1);

    // Now administrator publishes results
    AcademicService.publishExamResults(seeded.users.adminUser.user.id, exam.id);

    // Student can now view published grade
    const studentPublished = AcademicService.getStudentGrades(student.id, 'STUDENT');
    expect(studentPublished.length).toBe(1);
    expect(studentPublished[0].letter).toBe('B');
  });

  it('should accurately calculate credit-weighted GPA and CGPA', () => {
    const student = seeded.students.student1;

    // Course 1: CS101 (3.0 credits), Grade A (4.0 grade points) -> 12.0 quality points
    const exam1: Examination = {
      id: 'ex-1',
      sectionId: seeded.sections.secCS101.id,
      semesterId: seeded.semester.id,
      name: 'Final',
      maxMarks: 100,
      weight: 1.0,
      status: 'PUBLISHED'
    };
    db.examinations.set(exam1.id, exam1);
    db.grades.set('g-1', {
      id: 'g-1',
      examinationId: exam1.id,
      studentId: student.id,
      rawMarks: 95,
      letter: 'A',
      gradePoints: 4.0,
      isRepeat: false,
      updatedAt: ''
    });

    // Course 2: CS102 (4.0 credits), Grade B (3.0 grade points) -> 12.0 quality points
    const exam2: Examination = {
      id: 'ex-2',
      sectionId: seeded.sections.secCS102.id,
      semesterId: seeded.semester.id,
      name: 'Final',
      maxMarks: 100,
      weight: 1.0,
      status: 'PUBLISHED'
    };
    db.examinations.set(exam2.id, exam2);
    db.grades.set('g-2', {
      id: 'g-2',
      examinationId: exam2.id,
      studentId: student.id,
      rawMarks: 82,
      letter: 'B',
      gradePoints: 3.0,
      isRepeat: false,
      updatedAt: ''
    });

    // Total Quality Points = 12 + 12 = 24. Total Credits = 3 + 4 = 7. GPA = 24 / 7 = 3.43
    const stats = AcademicService.calculateStudentGPA(student.id);
    expect(stats.cgpa).toBe(3.43);
    expect(stats.totalCredits).toBe(7.0);
  });

  it('should apply course retake repeat policy and replace prior lower grade in CGPA', () => {
    const student = seeded.students.student1;

    // 1. First attempt in CS101: Grade D (1.0 points)
    const examAttempt1: Examination = {
      id: 'ex-attempt-1',
      sectionId: seeded.sections.secCS101.id,
      semesterId: seeded.semester.id,
      name: 'Attempt 1',
      maxMarks: 100,
      weight: 1.0,
      status: 'PUBLISHED'
    };
    db.examinations.set(examAttempt1.id, examAttempt1);
    db.grades.set('g-att-1', {
      id: 'g-att-1',
      examinationId: examAttempt1.id,
      studentId: student.id,
      rawMarks: 62,
      letter: 'D',
      gradePoints: 1.0,
      isRepeat: false,
      updatedAt: ''
    });

    let stats = AcademicService.calculateStudentGPA(student.id);
    expect(stats.cgpa).toBe(1.0);

    // 2. Student retakes CS101 in a later section and earns Grade A (4.0 points)
    const examAttempt2: Examination = {
      id: 'ex-attempt-2',
      sectionId: seeded.sections.secCS101.id,
      semesterId: seeded.semester.id,
      name: 'Attempt 2 Retake',
      maxMarks: 100,
      weight: 1.0,
      status: 'PUBLISHED'
    };
    db.examinations.set(examAttempt2.id, examAttempt2);
    db.grades.set('g-att-2', {
      id: 'g-att-2',
      examinationId: examAttempt2.id,
      studentId: student.id,
      rawMarks: 94,
      letter: 'A',
      gradePoints: 4.0,
      isRepeat: true,
      updatedAt: ''
    });

    // Retake replaces the prior lower grade
    stats = AcademicService.calculateStudentGPA(student.id);
    expect(stats.cgpa).toBe(4.0);
    expect(stats.totalCredits).toBe(3.0); // Credits counted once, not duplicated
  });

  it('should record an immutable AuditLog entry upon post-publication grade revision', () => {
    const admin = seeded.users.adminUser.user;
    const student = seeded.students.student1;

    const exam: Examination = {
      id: 'ex-rev',
      sectionId: seeded.sections.secCS101.id,
      semesterId: seeded.semester.id,
      name: 'Midterm',
      maxMarks: 100,
      weight: 1.0,
      status: 'PUBLISHED'
    };
    db.examinations.set(exam.id, exam);

    const grade: Grade = {
      id: 'g-rev-1',
      examinationId: exam.id,
      studentId: student.id,
      rawMarks: 78,
      letter: 'C',
      gradePoints: 2.0,
      isRepeat: false,
      updatedAt: new Date().toISOString()
    };
    db.grades.set(grade.id, grade);

    // Registrar revises grade following regrade appeal
    AcademicService.revisePublishedGrade(
      admin.id,
      grade.id,
      88,
      'Grade recalculated following official regrade review committee decision'
    );

    const updated = db.grades.get(grade.id)!;
    expect(updated.rawMarks).toBe(88);
    expect(updated.letter).toBe('B');
    expect(updated.gradePoints).toBe(3.0);

    const logs = Array.from(db.auditLogs.values()).filter(l => l.action === 'REVISE_PUBLISHED_GRADE');
    expect(logs.length).toBe(1);
    expect(logs[0].details).toContain('official regrade review');
    expect(logs[0].userId).toBe(admin.id);
  });
});
