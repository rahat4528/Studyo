import { db } from '../src/database/db';
import { catalogService } from '../src/services/catalog.service';
import { contentService } from '../src/services/content.service';
import { authService } from '../src/services/auth.service';
import { moderationService } from '../src/services/moderation.service';

describe('LMS Access Control & DRM Enforcement', () => {
  let instructorId: string;
  let studentId: string;
  let otherStudentId: string;
  let categoryId: string;
  let publishedCourseId: string;
  let draftCourseId: string;
  let previewLessonId: string;
  let paidLessonId: string;

  beforeEach(() => {
    db.clear();

    const admin = authService.register('admin@test.local', 'Pass123!', 'Admin', 'ADMINISTRATOR');
    const instructor = authService.register('inst@test.local', 'Pass123!', 'Instructor', 'INSTRUCTOR');
    const student = authService.register('student@test.local', 'Pass123!', 'Student', 'STUDENT');
    const otherStudent = authService.register('other@test.local', 'Pass123!', 'Other', 'STUDENT');

    instructorId = instructor.id;
    studentId = student.id;
    otherStudentId = otherStudent.id;

    moderationService.registerInstructorProfile(instructorId, 'Professor');
    moderationService.submitVerificationDocs(instructorId, 'docs-ref');
    moderationService.reviewInstructorVerification(instructorId, 'VERIFIED', admin.role);

    const cat = catalogService.createCategory('Programming', 'programming');
    categoryId = cat.id;

    // Published course
    const course = catalogService.createCourse(
      instructorId,
      categoryId,
      'Full-Stack Node.js',
      'fullstack-node',
      'Comprehensive guide',
      4999,
      'USD',
      'INTERMEDIATE'
    );
    publishedCourseId = course.id;

    const sec = catalogService.addSection(publishedCourseId, 'Section 1', instructorId, 'INSTRUCTOR');
    const l1 = catalogService.addLesson(
      publishedCourseId,
      sec.id,
      'Course Introduction',
      'Intro text',
      'media/preview-vid.mp4',
      300,
      true, // isPreview
      instructorId,
      'INSTRUCTOR'
    );
    previewLessonId = l1.id;

    const l2 = catalogService.addLesson(
      publishedCourseId,
      sec.id,
      'Deep Architecture',
      'Exclusive content',
      'media/paid-vid.mp4',
      1200,
      false, // paid only
      instructorId,
      'INSTRUCTOR'
    );
    paidLessonId = l2.id;

    moderationService.submitCourseForReview(publishedCourseId, instructorId);
    moderationService.startReview(publishedCourseId, admin.role);
    moderationService.approveCourse(publishedCourseId, admin.role);
    moderationService.publishCourse(publishedCourseId, instructorId, 'INSTRUCTOR');

    // Draft course
    const draft = catalogService.createCourse(
      instructorId,
      categoryId,
      'Unpublished Draft',
      'draft-course',
      'Draft course',
      1999,
      'USD',
      'BEGINNER'
    );
    draftCourseId = draft.id;
  });

  test('Public anonymous user can access preview lessons', () => {
    const access = contentService.verifyLessonAccess(publishedCourseId, previewLessonId, undefined, undefined);
    expect(access.allowed).toBe(true);
    expect(access.playbackToken).toBeDefined();
    expect(access.lesson.title).toBe('Course Introduction');
  });

  test('Non-enrolled user is denied access to paid non-preview lessons', () => {
    expect(() => {
      contentService.verifyLessonAccess(publishedCourseId, paidLessonId, studentId, 'STUDENT');
    }).toThrow('Access denied: You must be enrolled to view this lesson');
  });

  test('Enrolled student is granted access to paid lessons', () => {
    contentService.enrollStudent(publishedCourseId, studentId);

    const access = contentService.verifyLessonAccess(publishedCourseId, paidLessonId, studentId, 'STUDENT');
    expect(access.allowed).toBe(true);
    expect(access.playbackToken).toBeDefined();
  });

  test('Course instructor can access all lessons even without student enrollment', () => {
    const access = contentService.verifyLessonAccess(publishedCourseId, paidLessonId, instructorId, 'INSTRUCTOR');
    expect(access.allowed).toBe(true);
  });

  test('Administrator can access all lessons across any course', () => {
    const access = contentService.verifyLessonAccess(publishedCourseId, paidLessonId, 'admin-id', 'ADMINISTRATOR');
    expect(access.allowed).toBe(true);
  });

  test('Refunded enrollment revokes lesson access immediately', () => {
    const enrollment = contentService.enrollStudent(publishedCourseId, studentId);
    enrollment.isRefunded = true;

    expect(() => {
      contentService.verifyLessonAccess(publishedCourseId, paidLessonId, studentId, 'STUDENT');
    }).toThrow('Access denied: Enrollment is inactive or refunded');
  });
});
