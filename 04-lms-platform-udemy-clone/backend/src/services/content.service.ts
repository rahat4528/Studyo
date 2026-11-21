import { randomUUID, createHmac } from 'crypto';
import { db } from '../database/db';
import { Lesson, Enrollment, LessonProgress, Role } from '../types';

export class ContentService {
  public enrollStudent(courseId: string, userId: string): Enrollment {
    const existing = Array.from(db.enrollments.values()).find(
      e => e.courseId === courseId && e.userId === userId && !e.isRefunded
    );
    if (existing) return existing;

    const enrollment: Enrollment = {
      id: randomUUID(),
      courseId,
      userId,
      enrolledAt: new Date().toISOString(),
      isRefunded: false,
      progress: {},
    };

    db.enrollments.set(enrollment.id, enrollment);

    const course = db.courses.get(courseId);
    if (course) {
      course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    }

    return enrollment;
  }

  public isEnrolled(courseId: string, userId: string): boolean {
    return Array.from(db.enrollments.values()).some(
      e => e.courseId === courseId && e.userId === userId && !e.isRefunded
    );
  }

  public generateSignedVideoToken(mediaKey: string, userId: string, expiresInSec: number = 900): string {
    const expires = Math.floor(Date.now() / 1000) + expiresInSec;
    const secret = process.env.JWT_SECRET || 'studyo_lms_media_signing_secret_2026';
    const payload = `${mediaKey}:${userId}:${expires}`;
    const sig = createHmac('sha256', secret).update(payload).digest('hex');
    return `/media/stream/${mediaKey}?expires=${expires}&sig=${sig}&user=${userId}`;
  }

  public verifyLessonAccess(
    courseId: string,
    lessonId: string,
    userId?: string,
    userRole?: Role
  ): { allowed: boolean; playbackToken?: string; lesson: Lesson } {
    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    let targetLesson: Lesson | undefined;
    for (const section of course.sections) {
      const found = section.lessons.find(l => l.id === lessonId);
      if (found) {
        targetLesson = found;
        break;
      }
    }

    if (!targetLesson) throw new Error('Lesson not found');

    // Free preview lesson is accessible to everyone
    if (targetLesson.isPreview) {
      return {
        allowed: true,
        playbackToken: this.generateSignedVideoToken(targetLesson.videoMediaKey || 'sample-key', userId || 'anonymous'),
        lesson: targetLesson,
      };
    }

    // Non-preview lesson requires active enrollment, course instructor, or admin
    if (!userId) {
      throw new Error('Access denied: Authentication required for non-preview lesson');
    }

    if (userRole === 'ADMINISTRATOR' || course.instructorId === userId) {
      return {
        allowed: true,
        playbackToken: this.generateSignedVideoToken(targetLesson.videoMediaKey || 'sample-key', userId),
        lesson: targetLesson,
      };
    }

    const enrollment = Array.from(db.enrollments.values()).find(
      e => e.courseId === courseId && e.userId === userId
    );

    if (!enrollment) {
      throw new Error('Access denied: You must be enrolled to view this lesson');
    }

    if (enrollment.isRefunded) {
      throw new Error('Access denied: Enrollment is inactive or refunded');
    }

    return {
      allowed: true,
      playbackToken: this.generateSignedVideoToken(targetLesson.videoMediaKey || 'sample-key', userId),
      lesson: targetLesson,
    };
  }

  public updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    isCompleted: boolean,
    positionSec: number = 0
  ): LessonProgress {
    const enrollment = db.enrollments.get(enrollmentId);
    if (!enrollment || enrollment.isRefunded) {
      throw new Error('Enrollment not found or refunded');
    }

    const progress: LessonProgress = {
      id: randomUUID(),
      enrollmentId,
      lessonId,
      isCompleted,
      lastPositionSec: positionSec,
      updatedAt: new Date().toISOString(),
    };

    enrollment.progress[lessonId] = progress;
    return progress;
  }
}

export const contentService = new ContentService();
