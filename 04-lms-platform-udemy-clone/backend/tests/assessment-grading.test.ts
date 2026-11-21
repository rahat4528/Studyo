import { db } from '../src/database/db';
import { catalogService } from '../src/services/catalog.service';
import { assessmentService } from '../src/services/assessment.service';
import { contentService } from '../src/services/content.service';
import { authService } from '../src/services/auth.service';

describe('LMS Quizzes, Assignments, Reviews & Verifiable Certificates', () => {
  let instructorId: string;
  let studentId: string;
  let courseId: string;
  let lesson1Id: string;
  let lesson2Id: string;
  let enrollmentId: string;

  beforeEach(() => {
    db.clear();

    const inst = authService.register('inst@test.local', 'Pass123!', 'Instructor', 'INSTRUCTOR');
    instructorId = inst.id;

    const student = authService.register('student@test.local', 'Pass123!', 'Student', 'STUDENT');
    studentId = student.id;

    const cat = catalogService.createCategory('AI', 'ai');
    const course = catalogService.createCourse(
      instructorId,
      cat.id,
      'Machine Learning Systems',
      'ml-systems',
      'Applied ML',
      4500,
      'USD',
      'INTERMEDIATE'
    );
    courseId = course.id;

    const sec = catalogService.addSection(courseId, 'Core Concepts', instructorId, 'INSTRUCTOR');
    const l1 = catalogService.addLesson(courseId, sec.id, 'Linear Models', 'Intro', 'l1.mp4', 600, false, instructorId, 'INSTRUCTOR');
    const l2 = catalogService.addLesson(courseId, sec.id, 'Neural Networks', 'NN', 'l2.mp4', 900, false, instructorId, 'INSTRUCTOR');
    lesson1Id = l1.id;
    lesson2Id = l2.id;

    const enrollment = contentService.enrollStudent(courseId, studentId);
    enrollmentId = enrollment.id;
  });

  test('Quiz student view masks correct answers to prevent leakage', () => {
    const quiz = assessmentService.createQuiz(
      courseId,
      'Intro Quiz',
      75,
      [
        {
          id: 'q1',
          prompt: 'What is gradient descent?',
          points: 10,
          options: [
            { id: 'opt1', label: 'Optimization algorithm', isCorrect: true },
            { id: 'opt2', label: 'Activation function', isCorrect: false },
          ]
        }
      ]
    );

    const studentView = assessmentService.getQuizForStudent(quiz.id);
    expect((studentView.questions[0].options[0] as any).isCorrect).toBeUndefined();
    expect((studentView.questions[0].options[1] as any).isCorrect).toBeUndefined();
  });

  test('Quiz attempt grades answers and sets pass status based on threshold', () => {
    const quiz = assessmentService.createQuiz(
      courseId,
      'Intro Quiz',
      75,
      [
        {
          id: 'q1',
          prompt: 'Q1',
          points: 5,
          options: [
            { id: 'opt1', label: 'Correct', isCorrect: true },
            { id: 'opt2', label: 'Wrong', isCorrect: false },
          ]
        },
        {
          id: 'q2',
          prompt: 'Q2',
          points: 5,
          options: [
            { id: 'opt3', label: 'Correct', isCorrect: true },
            { id: 'opt4', label: 'Wrong', isCorrect: false },
          ]
        }
      ]
    );

    // 50% score (below 75% pass mark)
    const failAttempt = assessmentService.submitQuizAttempt(quiz.id, studentId, { q1: 'opt1', q2: 'opt4' });
    expect(failAttempt.scorePercent).toBe(50);
    expect(failAttempt.passed).toBe(false);

    // 100% score (passes)
    const passAttempt = assessmentService.submitQuizAttempt(quiz.id, studentId, { q1: 'opt1', q2: 'opt3' });
    expect(passAttempt.scorePercent).toBe(100);
    expect(passAttempt.passed).toBe(true);
  });

  test('Assignment submission and instructor grading', () => {
    const assignment = assessmentService.createAssignment(courseId, 'Homework 1', 'Submit notebook link', 100);

    const submission = assessmentService.submitAssignment(assignment.id, studentId, 'https://github.com/student/hw1');
    expect(submission.isGraded).toBe(false);

    const graded = assessmentService.gradeAssignment(submission.id, instructorId, 'INSTRUCTOR', 95, 'Well documented code');
    expect(graded.isGraded).toBe(true);
    expect(graded.marksAwarded).toBe(95);
    expect(graded.feedback).toBe('Well documented code');
  });

  test('Review gating: user cannot review until completing at least 20% of lessons', () => {
    // 0% completion
    expect(() => {
      assessmentService.addCourseReview(courseId, studentId, 'Student', 5, 'Great course');
    }).toThrow('Review blocked: You must complete at least 20% of course lessons before reviewing (current: 0%)');

    // Complete 1 of 2 lessons = 50%
    contentService.updateLessonProgress(enrollmentId, lesson1Id, true, 600);

    const review = assessmentService.addCourseReview(courseId, studentId, 'Student', 5, 'Great course');
    expect(review.rating).toBe(5);

    const course = catalogService.getCourseById(courseId);
    expect(course.ratingAverage).toBe(5);
    expect(course.ratingCount).toBe(1);
  });

  test('Certificate issuance: blocked until 100% course completion', () => {
    // 0% completion
    expect(() => {
      assessmentService.issueCertificate(enrollmentId, 'Jane Student');
    }).toThrow('Certificate criteria not met: All lessons must be completed');

    // Complete lesson 1
    contentService.updateLessonProgress(enrollmentId, lesson1Id, true, 600);
    expect(assessmentService.checkCourseCompletion(enrollmentId)).toBe(false);

    // Complete lesson 2 -> 100%
    contentService.updateLessonProgress(enrollmentId, lesson2Id, true, 900);
    expect(assessmentService.checkCourseCompletion(enrollmentId)).toBe(true);

    const cert = assessmentService.issueCertificate(enrollmentId, 'Jane Student');
    expect(cert.verificationCode).toBeDefined();
    expect(cert.recipientName).toBe('Jane Student');
    expect(cert.courseTitle).toBe('Machine Learning Systems');

    // Verify certificate publicly
    const verified = assessmentService.verifyCertificate(cert.verificationCode);
    expect(verified).not.toBeNull();
    expect(verified?.recipientName).toBe('Jane Student');
  });
});
