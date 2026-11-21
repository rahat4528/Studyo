import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { CourseProgress, Certificate } from '../types';

export class ProgressService {
  /**
   * Idempotently saves lesson playback position and completion flag
   */
  public static saveLessonProgress(
    courseId: string,
    userId: string,
    lessonId: string,
    isCompleted: boolean,
    lastPositionSec: number
  ): CourseProgress {
    const enrollmentKey = `${courseId}:${userId}`;
    const enrollment = db.enrollments.get(enrollmentKey);
    if (!enrollment) {
      throw new Error('Student is not enrolled in this course');
    }

    let progress = enrollment.progress[lessonId];
    if (!progress) {
      progress = {
        id: uuidv4(),
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted,
        lastPositionSec,
        updatedAt: new Date().toISOString()
      };
    } else {
      progress.isCompleted = isCompleted || progress.isCompleted;
      progress.lastPositionSec = lastPositionSec;
      progress.updatedAt = new Date().toISOString();
    }

    enrollment.progress[lessonId] = progress;
    db.enrollments.set(enrollmentKey, enrollment);
    return progress;
  }

  /**
   * Issues a certificate strictly after server-side validation that 100% of lessons are completed
   */
  public static issueCertificate(courseId: string, userId: string): Certificate {
    const course = db.courses.get(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const enrollmentKey = `${courseId}:${userId}`;
    const enrollment = db.enrollments.get(enrollmentKey);
    if (!enrollment) {
      throw new Error('Student is not enrolled in this course');
    }

    const school = db.schools.get(course.schoolId);
    if (!school) {
      throw new Error('School not found');
    }

    // Collect all lessons in the course
    const allLessons = course.modules.flatMap(m => m.lessons);
    if (allLessons.length === 0) {
      throw new Error('Course contains no lessons');
    }

    let completedCount = 0;
    for (const lesson of allLessons) {
      const prog = enrollment.progress[lesson.id];
      if (prog && prog.isCompleted) {
        completedCount++;
      }
    }

    if (completedCount < allLessons.length) {
      throw new Error(
        `Completion criteria not met: ${completedCount} of ${allLessons.length} lessons completed (${Math.round((completedCount / allLessons.length) * 100)}%)`
      );
    }

    // Check if certificate already exists
    for (const cert of db.certificates.values()) {
      if (cert.enrollmentId === enrollment.id) {
        return cert;
      }
    }

    const user = db.users.get(userId);
    const verificationCode = `CERT-ACADEMY-${uuidv4().substring(0, 8).toUpperCase()}`;

    const certificate: Certificate = {
      id: uuidv4(),
      enrollmentId: enrollment.id,
      schoolId: school.id,
      courseId: course.id,
      userId,
      recipientName: user ? user.fullName : 'Verified Learner',
      courseTitle: course.title,
      schoolName: school.name,
      verificationCode,
      issuedAt: new Date().toISOString()
    };

    db.certificates.set(certificate.id, certificate);
    return certificate;
  }

  /**
   * Public verification of course completion certificate
   */
  public static verifyCertificate(code: string): {
    isValid: boolean;
    certificate?: {
      recipientName: string;
      courseTitle: string;
      schoolName: string;
      issuedAt: string;
      verificationCode: string;
      status: 'AUTHENTIC' | 'INVALID';
    };
  } {
    const norm = code.trim().toUpperCase();
    for (const cert of db.certificates.values()) {
      if (cert.verificationCode.toUpperCase() === norm) {
        return {
          isValid: true,
          certificate: {
            recipientName: cert.recipientName,
            courseTitle: cert.courseTitle,
            schoolName: cert.schoolName,
            issuedAt: cert.issuedAt,
            verificationCode: cert.verificationCode,
            status: 'AUTHENTIC'
          }
        };
      }
    }

    return { isValid: false };
  }
}
