import { db } from '../database/db';
import {
  CourseQuiz, CourseQuizQuestion, QuizAttempt, CourseAssignment,
  AssignmentSubmission, DiscussionThread, DiscussionPost, LessonNote,
  CourseReview, Certificate, Role
} from '../types';
import { randomUUID } from 'crypto';

export class AssessmentService {
  /**
   * Create a course quiz
   */
  public createQuiz(
    courseId: string,
    title: string,
    passPercent: number,
    questions: CourseQuizQuestion[]
  ): CourseQuiz {
    const quiz: CourseQuiz = {
      id: randomUUID(),
      courseId,
      title,
      passPercent,
      questions,
    };
    db.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  /**
   * Fetch quiz for student - hides correct answers to prevent inspection leaks
   */
  public getQuizForStudent(quizId: string): Omit<CourseQuiz, 'questions'> & {
    questions: Array<{ id: string; prompt: string; points: number; options: Array<{ id: string; label: string }> }>;
  } {
    const quiz = db.quizzes.get(quizId);
    if (!quiz) throw new Error('Quiz not found');

    return {
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      passPercent: quiz.passPercent,
      questions: quiz.questions.map(q => ({
        id: q.id,
        prompt: q.prompt,
        points: q.points,
        options: q.options.map(opt => ({
          id: opt.id,
          label: opt.label,
        })),
      })),
    };
  }

  /**
   * Submit quiz answers and grade automatically
   */
  public submitQuizAttempt(
    quizId: string,
    userId: string,
    answers: Record<string, string> // questionId -> optionId
  ): QuizAttempt {
    const quiz = db.quizzes.get(quizId);
    if (!quiz) throw new Error('Quiz not found');

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const selectedOptionId = answers[question.id];
      const correctOption = question.options.find(o => o.isCorrect);

      if (correctOption && selectedOptionId === correctOption.id) {
        earnedPoints += question.points;
      }
    }

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercent >= quiz.passPercent;

    const attempt: QuizAttempt = {
      id: randomUUID(),
      quizId,
      userId,
      scorePercent,
      passed,
      createdAt: new Date().toISOString(),
    };

    db.quizAttempts.set(attempt.id, attempt);
    return attempt;
  }

  /**
   * Create course assignment
   */
  public createAssignment(
    courseId: string,
    title: string,
    instructions: string,
    maxMarks: number
  ): CourseAssignment {
    const assignment: CourseAssignment = {
      id: randomUUID(),
      courseId,
      title,
      instructions,
      maxMarks,
    };
    db.assignments.set(assignment.id, assignment);
    return assignment;
  }

  /**
   * Submit assignment
   */
  public submitAssignment(assignmentId: string, userId: string, content: string): AssignmentSubmission {
    const assignment = db.assignments.get(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const submission: AssignmentSubmission = {
      id: randomUUID(),
      assignmentId,
      userId,
      content,
      isGraded: false,
      submittedAt: new Date().toISOString(),
    };

    db.submissions.set(submission.id, submission);
    return submission;
  }

  /**
   * Grade assignment (Instructor or Admin)
   */
  public gradeAssignment(
    submissionId: string,
    instructorUserId: string,
    role: Role,
    marksAwarded: number,
    feedback?: string
  ): AssignmentSubmission {
    const submission = db.submissions.get(submissionId);
    if (!submission) throw new Error('Submission not found');

    const assignment = db.assignments.get(submission.assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const course = db.courses.get(assignment.courseId);
    if (!course) throw new Error('Course not found');

    if (role !== 'ADMINISTRATOR' && course.instructorId !== instructorUserId) {
      throw new Error('Forbidden: Only the course instructor or admin can grade this assignment');
    }

    if (marksAwarded < 0 || marksAwarded > assignment.maxMarks) {
      throw new Error(`Marks awarded must be between 0 and ${assignment.maxMarks}`);
    }

    submission.marksAwarded = marksAwarded;
    submission.feedback = feedback;
    submission.isGraded = true;

    return submission;
  }

  /**
   * Create discussion thread
   */
  public createDiscussionThread(
    courseId: string,
    userId: string,
    authorName: string,
    title: string,
    content: string
  ): DiscussionThread {
    const thread: DiscussionThread = {
      id: randomUUID(),
      courseId,
      userId,
      authorName,
      title,
      content,
      upvotes: 0,
      isResolved: false,
      posts: [],
      createdAt: new Date().toISOString(),
    };
    db.discussions.set(thread.id, thread);
    return thread;
  }

  /**
   * Add reply post to discussion thread
   */
  public addDiscussionPost(
    threadId: string,
    userId: string,
    authorName: string,
    content: string,
    isAnswer: boolean = false
  ): DiscussionPost {
    const thread = db.discussions.get(threadId);
    if (!thread) throw new Error('Discussion thread not found');

    const post: DiscussionPost = {
      id: randomUUID(),
      threadId,
      userId,
      authorName,
      content,
      isAnswer,
      createdAt: new Date().toISOString(),
    };

    thread.posts.push(post);
    if (isAnswer) {
      thread.isResolved = true;
    }

    return post;
  }

  /**
   * Upvote discussion thread
   */
  public upvoteDiscussion(threadId: string): DiscussionThread {
    const thread = db.discussions.get(threadId);
    if (!thread) throw new Error('Discussion thread not found');
    thread.upvotes += 1;
    return thread;
  }

  /**
   * Add timestamped video note
   */
  public addLessonNote(
    courseId: string,
    lessonId: string,
    userId: string,
    timestampSec: number,
    text: string
  ): LessonNote {
    const note: LessonNote = {
      id: randomUUID(),
      courseId,
      lessonId,
      userId,
      timestampSec,
      text,
      createdAt: new Date().toISOString(),
    };
    db.notes.set(note.id, note);
    return note;
  }

  public getLessonNotes(courseId: string, lessonId: string, userId: string): LessonNote[] {
    return Array.from(db.notes.values())
      .filter(n => n.courseId === courseId && n.lessonId === lessonId && n.userId === userId)
      .sort((a, b) => a.timestampSec - b.timestampSec);
  }

  /**
   * Submit Course Review
   * Review gating: User must have an active (non-refunded) enrollment AND at least 20% lesson completion.
   */
  public addCourseReview(
    courseId: string,
    userId: string,
    authorName: string,
    rating: number,
    content?: string
  ): CourseReview {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    const enrollment = Array.from(db.enrollments.values()).find(
      e => e.courseId === courseId && e.userId === userId && !e.isRefunded
    );

    if (!enrollment) {
      throw new Error('Review blocked: You must be actively enrolled to review this course');
    }

    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    let totalLessons = 0;
    for (const section of course.sections) {
      totalLessons += section.lessons.length;
    }

    let completedLessons = 0;
    for (const progress of Object.values(enrollment.progress)) {
      if (progress.isCompleted) completedLessons++;
    }

    const completionPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    if (completionPercent < 20) {
      throw new Error(`Review blocked: You must complete at least 20% of course lessons before reviewing (current: ${Math.round(completionPercent)}%)`);
    }

    const existingReview = Array.from(db.reviews.values()).find(
      r => r.courseId === courseId && r.userId === userId
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.content = content;
      this.recalculateCourseRating(courseId);
      return existingReview;
    }

    const review: CourseReview = {
      id: randomUUID(),
      courseId,
      userId,
      authorName,
      rating,
      content,
      createdAt: new Date().toISOString(),
    };

    db.reviews.set(review.id, review);
    this.recalculateCourseRating(courseId);
    return review;
  }

  private recalculateCourseRating(courseId: string): void {
    const course = db.courses.get(courseId);
    if (!course) return;

    const courseReviews = Array.from(db.reviews.values()).filter(r => r.courseId === courseId);
    if (courseReviews.length === 0) {
      course.ratingAverage = 0;
      course.ratingCount = 0;
      return;
    }

    const total = courseReviews.reduce((sum, r) => sum + r.rating, 0);
    course.ratingCount = courseReviews.length;
    course.ratingAverage = Math.round((total / courseReviews.length) * 10) / 10;
  }

  /**
   * Certificate verification & issuance
   */
  public checkCourseCompletion(enrollmentId: string): boolean {
    const enrollment = db.enrollments.get(enrollmentId);
    if (!enrollment || enrollment.isRefunded) return false;

    const course = db.courses.get(enrollment.courseId);
    if (!course) return false;

    let totalLessons = 0;
    for (const section of course.sections) {
      totalLessons += section.lessons.length;
    }

    if (totalLessons === 0) return false;

    let completedLessons = 0;
    for (const progress of Object.values(enrollment.progress)) {
      if (progress.isCompleted) completedLessons++;
    }

    return completedLessons === totalLessons;
  }

  public issueCertificate(enrollmentId: string, recipientName: string): Certificate {
    const enrollment = db.enrollments.get(enrollmentId);
    if (!enrollment || enrollment.isRefunded) {
      throw new Error('Enrollment not found or refunded');
    }

    const isComplete = this.checkCourseCompletion(enrollmentId);
    if (!isComplete) {
      throw new Error('Certificate criteria not met: All lessons must be completed');
    }

    const course = db.courses.get(enrollment.courseId);
    if (!course) throw new Error('Course not found');

    const existingCert = Array.from(db.certificates.values()).find(
      c => c.enrollmentId === enrollmentId
    );
    if (existingCert) return existingCert;

    const code = `CERT-LMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const cert: Certificate = {
      id: randomUUID(),
      enrollmentId,
      courseId: course.id,
      userId: enrollment.userId,
      recipientName,
      courseTitle: course.title,
      verificationCode: code,
      issuedAt: new Date().toISOString(),
    };

    db.certificates.set(cert.id, cert);
    return cert;
  }

  public verifyCertificate(verificationCode: string): Certificate | null {
    return Array.from(db.certificates.values()).find(c => c.verificationCode === verificationCode) || null;
  }
}

export const assessmentService = new AssessmentService();
