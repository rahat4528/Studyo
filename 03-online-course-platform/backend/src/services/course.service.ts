import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Course, CourseModule, Lesson, Enrollment } from '../types';

export class CourseService {
  /**
   * Generates a tamper-proof time-expiring signed URL for private video playback
   */
  public static generateSignedVideoUrl(
    mediaKey: string,
    userId: string,
    expiresInSeconds: number = 900 // 15 mins
  ): string {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const secret = process.env.JWT_SECRET || 'studyo_course_media_signing_secret_2026';
    const payload = `${mediaKey}:${userId}:${expires}`;
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return `/media/stream/${mediaKey}?expires=${expires}&signature=${signature}&user=${userId}`;
  }

  /**
   * Evaluates lesson accessibility: enforces enrollment, active subscription, and server drip schedules
   */
  public static getLessonAccess(
    lessonId: string,
    userId: string,
    schoolId: string
  ): { lesson: Lesson; signedVideoUrl?: string; isPreview: boolean } {
    let targetLesson: Lesson | undefined;
    let targetCourse: Course | undefined;

    // Locate lesson and verify tenant boundary
    for (const course of db.courses.values()) {
      if (course.schoolId === schoolId) {
        for (const mod of course.modules) {
          for (const les of mod.lessons) {
            if (les.id === lessonId) {
              targetLesson = les;
              targetCourse = course;
              break;
            }
          }
        }
      }
    }

    if (!targetLesson || !targetCourse) {
      throw new Error('Lesson not found within the specified school domain');
    }

    // 1. Free preview check
    if (targetLesson.isPreview) {
      const signedUrl = targetLesson.videoMediaKey
        ? this.generateSignedVideoUrl(targetLesson.videoMediaKey, userId)
        : undefined;
      return { lesson: targetLesson, signedVideoUrl: signedUrl, isPreview: true };
    }

    // 2. Enrollment & Subscription check
    const enrollment = db.enrollments.get(`${targetCourse.id}:${userId}`);
    if (!enrollment) {
      throw new Error('Access denied: You must be enrolled in this course to view this lesson');
    }

    if (
      enrollment.subscriptionStatus === 'CANCELED' ||
      enrollment.subscriptionStatus === 'EXPIRED' ||
      enrollment.subscriptionStatus === 'PAST_DUE'
    ) {
      throw new Error(`Access denied: Course subscription is ${enrollment.subscriptionStatus}`);
    }

    // 3. Server Drip Schedule Enforcement
    const now = Date.now();
    const enrolledAt = new Date(enrollment.enrolledAt).getTime();

    if (targetLesson.dripType === 'DAYS_AFTER_ENROLLMENT' && targetLesson.dripDays > 0) {
      const unlockTime = enrolledAt + targetLesson.dripDays * 24 * 60 * 60 * 1000;
      if (now < unlockTime) {
        const unlockDate = new Date(unlockTime).toISOString().split('T')[0];
        throw new Error(`Lesson locked under drip schedule until ${unlockDate} (${targetLesson.dripDays} days post-enrollment)`);
      }
    } else if (targetLesson.dripType === 'SPECIFIC_DATE' && targetLesson.dripDate) {
      const unlockTime = new Date(targetLesson.dripDate).getTime();
      if (now < unlockTime) {
        throw new Error(`Lesson locked under drip schedule until scheduled release date: ${targetLesson.dripDate}`);
      }
    }

    const signedUrl = targetLesson.videoMediaKey
      ? this.generateSignedVideoUrl(targetLesson.videoMediaKey, userId)
      : undefined;

    return { lesson: targetLesson, signedVideoUrl: signedUrl, isPreview: false };
  }

  public static createCourse(
    schoolId: string,
    authorId: string,
    data: Omit<Course, 'id' | 'schoolId' | 'modules'>
  ): Course {
    const cleanSlug = data.slug.trim().toLowerCase();
    for (const c of db.courses.values()) {
      if (c.schoolId === schoolId && c.slug === cleanSlug) {
        throw new Error('Course slug already exists in this school');
      }
    }

    const course: Course = {
      ...data,
      id: uuidv4(),
      schoolId,
      slug: cleanSlug,
      modules: []
    };

    db.courses.set(course.id, course);
    return course;
  }
}
