import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Enrollment, CourseSection, ClassSchedule, Semester } from '../types';

export class EnrollmentService {
  private static seatLocks: Set<string> = new Set();

  /**
   * Evaluates if two class schedules overlap
   */
  public static doSchedulesOverlap(s1: ClassSchedule, s2: ClassSchedule): boolean {
    if (s1.dayOfWeek !== s2.dayOfWeek) return false;
    // Format "HH:MM" comparison
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const s1Start = toMinutes(s1.startTime);
    const s1End = toMinutes(s1.endTime);
    const s2Start = toMinutes(s2.startTime);
    const s2End = toMinutes(s2.endTime);

    return Math.max(s1Start, s2Start) < Math.min(s1End, s2End);
  }

  /**
   * Registers a student for a course section with atomic validation:
   * 1. Registration window check
   * 2. Active holds check
   * 3. Prerequisite check
   * 4. Seat capacity check (race-safe)
   * 5. Semester credit limits check
   * 6. Schedule conflict check
   */
  public static async registerCourse(studentId: string, sectionId: string): Promise<Enrollment> {
    const lockKey = `seat-lock:${sectionId}`;
    if (this.seatLocks.has(lockKey)) {
      throw new Error('Section seat reservation is temporarily locked by another transaction. Please retry.');
    }
    this.seatLocks.add(lockKey);

    try {
      const student = db.students.get(studentId);
      if (!student) {
        throw new Error('Student record not found');
      }

      const section = db.sections.get(sectionId);
      if (!section) {
        throw new Error('Course section not found');
      }

      const course = db.courses.get(section.courseId);
      if (!course) {
        throw new Error('Associated course catalog entry not found');
      }

      const semester = db.semesters.get(section.semesterId);
      if (!semester) {
        throw new Error('Semester term not found');
      }

      // 1. Check Registration Window
      const now = new Date();
      if (now < new Date(semester.regStartDate) || now > new Date(semester.regEndDate)) {
        throw new Error(`Registration is closed for semester: ${semester.name}`);
      }

      // 2. Check Active Holds
      const activeHolds = Array.from(db.holds.values()).filter(
        h => h.studentId === studentId && h.isActive
      );
      if (activeHolds.length > 0) {
        throw new Error(`Cannot register. Active administrative hold: ${activeHolds[0].type} (${activeHolds[0].reason})`);
      }

      // 3. Check Prerequisites
      if (course.prerequisiteId) {
        const prereqCourse = db.courses.get(course.prerequisiteId);
        const hasPassedPrereq = this.hasPassedPrerequisite(studentId, course.prerequisiteId);
        if (!hasPassedPrereq) {
          throw new Error(
            `Prerequisite not satisfied. Must successfully complete ${prereqCourse?.code || 'prerequisite'} before registering.`
          );
        }
      }

      // 4. Check Duplicate Registration
      for (const enr of db.enrollments.values()) {
        if (enr.studentId === studentId && enr.sectionId === sectionId && enr.status === 'ENROLLED') {
          throw new Error('Already enrolled in this course section');
        }
      }

      // 5. Check Seat Capacity (Race-Safe)
      if (section.enrolled >= section.capacity) {
        throw new Error(`Section seat capacity reached (${section.capacity}/${section.capacity})`);
      }

      // 6. Check Semester Credit Limit (Max 18.0 Credits)
      let currentSemesterCredits = 0;
      const enrolledSections: CourseSection[] = [];

      for (const enr of db.enrollments.values()) {
        if (enr.studentId === studentId && enr.semesterId === semester.id && enr.status === 'ENROLLED') {
          const sec = db.sections.get(enr.sectionId);
          if (sec) {
            enrolledSections.push(sec);
            const c = db.courses.get(sec.courseId);
            if (c) currentSemesterCredits += c.credits;
          }
        }
      }

      if (currentSemesterCredits + course.credits > 18.0) {
        throw new Error(
          `Exceeds maximum allowable credits (18.0). Current: ${currentSemesterCredits}, Requested: ${course.credits}`
        );
      }

      // 7. Check Schedule Conflicts
      for (const targetSchedule of section.schedules) {
        for (const existingSec of enrolledSections) {
          for (const existingSchedule of existingSec.schedules) {
            if (this.doSchedulesOverlap(targetSchedule, existingSchedule)) {
              const conflictCourse = db.courses.get(existingSec.courseId);
              throw new Error(
                `Schedule conflict on ${targetSchedule.dayOfWeek} with ${conflictCourse?.code || 'existing class'} (${targetSchedule.startTime}-${targetSchedule.endTime})`
              );
            }
          }
        }
      }

      // Execute enrollment atomically
      section.enrolled += 1;
      db.sections.set(section.id, section);

      const enrollment: Enrollment = {
        id: uuidv4(),
        studentId,
        sectionId,
        semesterId: semester.id,
        status: 'ENROLLED',
        enrolledAt: new Date().toISOString()
      };

      db.enrollments.set(enrollment.id, enrollment);
      return enrollment;
    } finally {
      this.seatLocks.delete(lockKey);
    }
  }

  public static dropCourse(studentId: string, sectionId: string): void {
    let targetEnrollment: Enrollment | undefined;
    for (const enr of db.enrollments.values()) {
      if (enr.studentId === studentId && enr.sectionId === sectionId && enr.status === 'ENROLLED') {
        targetEnrollment = enr;
        break;
      }
    }

    if (!targetEnrollment) {
      throw new Error('No active enrollment found for this section');
    }

    const section = db.sections.get(sectionId);
    if (section && section.enrolled > 0) {
      section.enrolled -= 1;
      db.sections.set(section.id, section);
    }

    targetEnrollment.status = 'DROPPED';
    db.enrollments.set(targetEnrollment.id, targetEnrollment);
  }

  public static hasPassedPrerequisite(studentId: string, prerequisiteCourseId: string): boolean {
    for (const grade of db.grades.values()) {
      if (grade.studentId === studentId) {
        const exam = db.examinations.get(grade.examinationId);
        if (exam && exam.status === 'PUBLISHED') {
          const sec = db.sections.get(exam.sectionId);
          if (sec && sec.courseId === prerequisiteCourseId && grade.gradePoints >= 2.0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
