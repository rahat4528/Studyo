import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Attendance, AttendanceStatus, Grade, Examination, AuditLog, Role } from '../types';

export class AcademicService {
  /**
   * Faculty records section attendance with 72-hour window and faculty ownership check
   */
  public static recordAttendance(
    facultyId: string,
    sectionId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus }[]
  ): Attendance[] {
    const section = db.sections.get(sectionId);
    if (!section) {
      throw new Error('Course section not found');
    }

    if (section.facultyId !== facultyId) {
      throw new Error('Unauthorized: You are not assigned to instruct this section');
    }

    // 72-hour edit window check
    const sessionTime = new Date(date).getTime();
    const now = Date.now();
    const diffHours = (now - sessionTime) / (1000 * 60 * 60);
    if (diffHours > 72) {
      throw new Error('Attendance edit window expired (72 hours elapsed since session date)');
    }

    const saved: Attendance[] = [];
    for (const item of records) {
      const existingId = `${sectionId}:${item.studentId}:${date}`;
      const att: Attendance = {
        id: existingId,
        sectionId,
        studentId: item.studentId,
        date,
        status: item.status,
        markedById: facultyId,
        markedAt: new Date().toISOString()
      };
      db.attendances.set(att.id, att);
      saved.push(att);
    }

    return saved;
  }

  /**
   * Approves student leave and automatically updates overlapping attendance to EXCUSED
   */
  public static reviewLeaveApplication(
    applicationId: string,
    reviewerId: string,
    decision: 'APPROVED' | 'REJECTED'
  ): void {
    const app = db.leaveApplications.get(applicationId);
    if (!app) {
      throw new Error('Leave application not found');
    }

    app.status = decision;
    app.reviewedAt = new Date().toISOString();
    app.reviewedById = reviewerId;
    db.leaveApplications.set(app.id, app);

    if (decision === 'APPROVED') {
      const start = new Date(app.startDate).getTime();
      const end = new Date(app.endDate).getTime();

      for (const att of db.attendances.values()) {
        if (att.studentId === app.studentId) {
          const attTime = new Date(att.date).getTime();
          if (attTime >= start && attTime <= end) {
            att.status = 'EXCUSED';
            db.attendances.set(att.id, att);
          }
        }
      }
    }
  }

  /**
   * Submits exam marks by faculty (DRAFT -> SUBMITTED)
   */
  public static submitExamMarks(
    facultyId: string,
    examId: string,
    marks: { studentId: string; rawMarks: number }[]
  ): void {
    const exam = db.examinations.get(examId);
    if (!exam) {
      throw new Error('Examination not found');
    }

    const section = db.sections.get(exam.sectionId);
    if (!section || section.facultyId !== facultyId) {
      throw new Error('Unauthorized: Only assigned faculty can submit marks for this examination');
    }

    for (const item of marks) {
      const letter = this.calculateLetterGrade(item.rawMarks);
      const gradePoints = this.calculateGradePoints(letter);

      const grade: Grade = {
        id: `${examId}:${item.studentId}`,
        examinationId: examId,
        studentId: item.studentId,
        rawMarks: item.rawMarks,
        letter,
        gradePoints,
        isRepeat: false,
        updatedAt: new Date().toISOString()
      };
      db.grades.set(grade.id, grade);
    }

    exam.status = 'SUBMITTED';
    db.examinations.set(exam.id, exam);
  }

  /**
   * Administrator approves and publishes exam marks
   */
  public static publishExamResults(adminId: string, examId: string): void {
    const exam = db.examinations.get(examId);
    if (!exam) {
      throw new Error('Examination not found');
    }

    exam.status = 'PUBLISHED';
    db.examinations.set(exam.id, exam);

    const log: AuditLog = {
      id: uuidv4(),
      userId: adminId,
      action: 'PUBLISH_EXAM_RESULTS',
      entityType: 'EXAMINATION',
      entityId: examId,
      details: `Published results for examination ${exam.name}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.set(log.id, log);
  }

  /**
   * Retrieves student grades, strictly enforcing publication gating for students and guardians
   */
  public static getStudentGrades(studentId: string, requesterRole: Role): Grade[] {
    const result: Grade[] = [];
    for (const g of db.grades.values()) {
      if (g.studentId === studentId) {
        const exam = db.examinations.get(g.examinationId);
        if (exam) {
          // If requester is student or guardian, hide unpublished marks
          if ((requesterRole === 'STUDENT' || requesterRole === 'GUARDIAN') && exam.status !== 'PUBLISHED') {
            continue;
          }
          result.push(g);
        }
      }
    }
    return result;
  }

  /**
   * Computes GPA and CGPA accounting for course retakes (repeat policy)
   */
  public static calculateStudentGPA(studentId: string): { gpa: number; cgpa: number; totalCredits: number } {
    const publishedGrades: { courseId: string; credits: number; gradePoints: number; isRepeat: boolean }[] = [];

    // Course ID -> best grade points map
    const courseBestGrade: Map<string, { credits: number; gradePoints: number }> = new Map();

    for (const g of db.grades.values()) {
      if (g.studentId === studentId) {
        const exam = db.examinations.get(g.examinationId);
        if (exam && exam.status === 'PUBLISHED') {
          const section = db.sections.get(exam.sectionId);
          if (section) {
            const course = db.courses.get(section.courseId);
            if (course) {
              const existing = courseBestGrade.get(course.id);
              if (!existing || g.gradePoints > existing.gradePoints) {
                courseBestGrade.set(course.id, { credits: course.credits, gradePoints: g.gradePoints });
              }
            }
          }
        }
      }
    }

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    for (const item of courseBestGrade.values()) {
      totalWeightedPoints += item.credits * item.gradePoints;
      totalCredits += item.credits;
    }

    const cgpa = totalCredits > 0 ? Math.round((totalWeightedPoints / totalCredits) * 100) / 100 : 0.0;
    return { gpa: cgpa, cgpa, totalCredits };
  }

  /**
   * Post-publication grade revision with mandatory audit trail
   */
  public static revisePublishedGrade(
    adminId: string,
    gradeId: string,
    newRawMarks: number,
    justification: string
  ): Grade {
    const grade = db.grades.get(gradeId);
    if (!grade) {
      throw new Error('Grade record not found');
    }

    const previousMarks = grade.rawMarks;
    const newLetter = this.calculateLetterGrade(newRawMarks);
    const newPoints = this.calculateGradePoints(newLetter);

    grade.rawMarks = newRawMarks;
    grade.letter = newLetter;
    grade.gradePoints = newPoints;
    grade.updatedAt = new Date().toISOString();
    db.grades.set(grade.id, grade);

    const log: AuditLog = {
      id: uuidv4(),
      userId: adminId,
      action: 'REVISE_PUBLISHED_GRADE',
      entityType: 'GRADE',
      entityId: gradeId,
      details: `Grade revised from ${previousMarks} to ${newRawMarks}. Reason: ${justification}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.set(log.id, log);

    return grade;
  }

  public static calculateLetterGrade(marks: number): string {
    if (marks >= 90) return 'A';
    if (marks >= 80) return 'B';
    if (marks >= 70) return 'C';
    if (marks >= 60) return 'D';
    return 'F';
  }

  public static calculateGradePoints(letter: string): number {
    switch (letter) {
      case 'A': return 4.0;
      case 'B': return 3.0;
      case 'C': return 2.0;
      case 'D': return 1.0;
      default: return 0.0;
    }
  }
}
