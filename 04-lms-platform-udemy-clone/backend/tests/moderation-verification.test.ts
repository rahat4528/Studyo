import { db } from '../src/database/db';
import { catalogService } from '../src/services/catalog.service';
import { moderationService } from '../src/services/moderation.service';
import { authService } from '../src/services/auth.service';

describe('LMS Instructor Verification & Course Moderation Pipeline', () => {
  let adminId: string;
  let instructorId: string;
  let otherInstructorId: string;
  let categoryId: string;

  beforeEach(() => {
    db.clear();

    const admin = authService.register('admin@test.local', 'Pass123!', 'Admin', 'ADMINISTRATOR');
    adminId = admin.id;

    const inst = authService.register('inst@test.local', 'Pass123!', 'Instructor One', 'INSTRUCTOR');
    instructorId = inst.id;

    const other = authService.register('other@test.local', 'Pass123!', 'Instructor Two', 'INSTRUCTOR');
    otherInstructorId = other.id;

    const cat = catalogService.createCategory('Design', 'design');
    categoryId = cat.id;
  });

  test('Instructor registers profile with initial UNVERIFIED state', () => {
    const profile = moderationService.registerInstructorProfile(instructorId, 'UI/UX Specialist');
    expect(profile.verificationStatus).toBe('UNVERIFIED');
  });

  test('Unverified instructor cannot submit paid courses for publication', () => {
    moderationService.registerInstructorProfile(instructorId, 'UI/UX Specialist');

    const course = catalogService.createCourse(
      instructorId,
      categoryId,
      'Figma Masterclass',
      'figma-masterclass',
      'Complete guide',
      4900, // paid
      'USD',
      'BEGINNER'
    );
    const sec = catalogService.addSection(course.id, 'Intro', instructorId, 'INSTRUCTOR');
    catalogService.addLesson(course.id, sec.id, 'Lesson 1', 'Content', 'v.mp4', 300, false, instructorId, 'INSTRUCTOR');

    expect(() => {
      moderationService.submitCourseForReview(course.id, instructorId);
    }).toThrow('Verification required: Instructor must be verified before submitting paid courses');
  });

  test('Full verification workflow: UNVERIFIED -> PENDING -> VERIFIED', () => {
    moderationService.registerInstructorProfile(instructorId, 'UI/UX Specialist');
    const pending = moderationService.submitVerificationDocs(instructorId, 'kyc-identity-proof.pdf');
    expect(pending.verificationStatus).toBe('PENDING');

    const verified = moderationService.reviewInstructorVerification(instructorId, 'VERIFIED', 'ADMINISTRATOR');
    expect(verified.verificationStatus).toBe('VERIFIED');
  });

  test('Verified instructor submits course through approval lifecycle to PUBLISHED', () => {
    moderationService.registerInstructorProfile(instructorId, 'UI/UX Specialist');
    moderationService.submitVerificationDocs(instructorId, 'kyc-identity-proof.pdf');
    moderationService.reviewInstructorVerification(instructorId, 'VERIFIED', 'ADMINISTRATOR');

    const course = catalogService.createCourse(
      instructorId,
      categoryId,
      'Figma Masterclass',
      'figma-masterclass',
      'Complete guide',
      4900,
      'USD',
      'BEGINNER'
    );
    const sec = catalogService.addSection(course.id, 'Intro', instructorId, 'INSTRUCTOR');
    catalogService.addLesson(course.id, sec.id, 'Lesson 1', 'Content', 'v.mp4', 300, false, instructorId, 'INSTRUCTOR');

    // 1. Submit
    const submitted = moderationService.submitCourseForReview(course.id, instructorId);
    expect(submitted.status).toBe('SUBMITTED');

    // 2. Start review
    const inReview = moderationService.startReview(course.id, 'ADMINISTRATOR');
    expect(inReview.status).toBe('IN_REVIEW');

    // 3. Approve
    const approved = moderationService.approveCourse(course.id, 'ADMINISTRATOR');
    expect(approved.status).toBe('APPROVED');

    // 4. Publish
    const published = moderationService.publishCourse(course.id, instructorId, 'INSTRUCTOR');
    expect(published.status).toBe('PUBLISHED');
  });

  test('Ownership guard prevents another instructor from modifying or publishing course', () => {
    const course = catalogService.createCourse(
      instructorId,
      categoryId,
      'Figma Masterclass',
      'figma-masterclass',
      'Complete guide',
      0,
      'USD',
      'BEGINNER'
    );

    expect(() => {
      catalogService.addSection(course.id, 'Hacked Section', otherInstructorId, 'INSTRUCTOR');
    }).toThrow('Forbidden: You do not own this course');

    expect(() => {
      moderationService.publishCourse(course.id, otherInstructorId, 'INSTRUCTOR');
    }).toThrow('Forbidden: You do not own this course');
  });
});
