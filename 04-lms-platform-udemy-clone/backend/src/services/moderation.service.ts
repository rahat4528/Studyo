import { db } from '../database/db';
import { InstructorProfile, VerificationStatus, CourseStatus, Course, Role } from '../types';
import { randomUUID } from 'crypto';

export class ModerationService {
  /**
   * Register or update an instructor profile
   */
  public registerInstructorProfile(userId: string, title: string, bio?: string): InstructorProfile {
    const existing = Array.from(db.instructors.values()).find(i => i.userId === userId);
    if (existing) {
      existing.title = title;
      if (bio !== undefined) existing.bio = bio;
      return existing;
    }

    const profile: InstructorProfile = {
      id: randomUUID(),
      userId,
      title,
      bio,
      verificationStatus: 'UNVERIFIED',
    };
    db.instructors.set(profile.id, profile);
    return profile;
  }

  /**
   * Submit identity and credential verification documents
   */
  public submitVerificationDocs(userId: string, docsReference: string): InstructorProfile {
    const profile = Array.from(db.instructors.values()).find(i => i.userId === userId);
    if (!profile) {
      throw new Error('Instructor profile not found for user');
    }
    profile.verificationDocs = docsReference;
    profile.verificationStatus = 'PENDING';
    return profile;
  }

  /**
   * Administrator reviews instructor verification
   */
  public reviewInstructorVerification(
    instructorUserId: string,
    status: 'VERIFIED' | 'REJECTED',
    adminRole: Role
  ): InstructorProfile {
    if (adminRole !== 'ADMINISTRATOR') {
      throw new Error('Unauthorized: Only administrators can review instructor verification');
    }

    const profile = Array.from(db.instructors.values()).find(i => i.userId === instructorUserId);
    if (!profile) {
      throw new Error('Instructor profile not found');
    }

    profile.verificationStatus = status;
    return profile;
  }

  /**
   * Verify ownership guard for course operations
   */
  public verifyCourseOwnership(courseId: string, userId: string, role: Role): Course {
    const course = db.courses.get(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (role === 'ADMINISTRATOR') {
      return course;
    }

    if (course.instructorId !== userId) {
      throw new Error('Forbidden: You do not own this course');
    }

    return course;
  }

  /**
   * Submit course for review.
   * Gating rule: Paid courses (priceMinor > 0) require instructor verification.
   */
  public submitCourseForReview(courseId: string, instructorUserId: string): Course {
    const course = db.courses.get(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== instructorUserId) {
      throw new Error('Forbidden: You can only submit courses you own');
    }

    if (course.status !== 'DRAFT' && course.status !== 'REJECTED') {
      throw new Error(`Cannot submit course with status ${course.status}`);
    }

    // Minimum content requirement: at least one section with at least one lesson
    if (!course.sections || course.sections.length === 0 || course.sections.every(s => s.lessons.length === 0)) {
      throw new Error('Course must have at least one section with lessons before submission');
    }

    // Verification check for paid courses
    if (course.priceMinor > 0) {
      const instructorProfile = Array.from(db.instructors.values()).find(i => i.userId === instructorUserId);
      if (!instructorProfile || instructorProfile.verificationStatus !== 'VERIFIED') {
        throw new Error('Verification required: Instructor must be verified before submitting paid courses');
      }
    }

    course.status = 'SUBMITTED';
    return course;
  }

  /**
   * Administrator starts review of a submitted course
   */
  public startReview(courseId: string, adminRole: Role): Course {
    if (adminRole !== 'ADMINISTRATOR') {
      throw new Error('Unauthorized: Only administrators can start reviews');
    }

    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    if (course.status !== 'SUBMITTED') {
      throw new Error(`Course status must be SUBMITTED to start review, current: ${course.status}`);
    }

    course.status = 'IN_REVIEW';
    return course;
  }

  /**
   * Administrator approves course
   */
  public approveCourse(courseId: string, adminRole: Role): Course {
    if (adminRole !== 'ADMINISTRATOR') {
      throw new Error('Unauthorized: Only administrators can approve courses');
    }

    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    if (course.status !== 'IN_REVIEW' && course.status !== 'SUBMITTED') {
      throw new Error(`Cannot approve course with status ${course.status}`);
    }

    course.status = 'APPROVED';
    return course;
  }

  /**
   * Administrator rejects course with reason
   */
  public rejectCourse(courseId: string, adminRole: Role, reason: string): Course {
    if (adminRole !== 'ADMINISTRATOR') {
      throw new Error('Unauthorized: Only administrators can reject courses');
    }

    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    course.status = 'REJECTED';
    return course;
  }

  /**
   * Instructor or Admin publishes an approved course
   */
  public publishCourse(courseId: string, userId: string, role: Role): Course {
    const course = this.verifyCourseOwnership(courseId, userId, role);

    if (course.status !== 'APPROVED') {
      throw new Error(`Cannot publish course that is not approved (current status: ${course.status})`);
    }

    course.status = 'PUBLISHED';
    return course;
  }

  /**
   * Instructor or Admin unpublishes a course
   */
  public unpublishCourse(courseId: string, userId: string, role: Role): Course {
    const course = this.verifyCourseOwnership(courseId, userId, role);

    if (course.status !== 'PUBLISHED') {
      throw new Error('Course is not currently published');
    }

    course.status = 'UNPUBLISHED';
    return course;
  }
}

export const moderationService = new ModerationService();
