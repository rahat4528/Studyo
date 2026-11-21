import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { db } from './database/db';
import { seedLMS } from './database/seed';
import { authService } from './services/auth.service';
import { catalogService } from './services/catalog.service';
import { contentService } from './services/content.service';
import { cartService } from './services/cart.service';
import { moderationService } from './services/moderation.service';
import { assessmentService } from './services/assessment.service';
import { Role } from './types';

export const app = express();
app.use(cors());
app.use(express.json());

// Initialize seed data
seedLMS();

// Authentication middleware helper
function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (err: any) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Role authorization guard
function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }
    next();
  };
}

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Studyo LMS Platform (Udemy Clone)',
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// Auth Routes
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    const user = authService.register(email, password, fullName, role || 'STUDENT');
    const token = authService.generateToken(user);
    res.status(201).json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = authService.authenticate(email, password);
    const token = authService.generateToken(user);
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, token });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Catalog & Public Course Routes
// ----------------------------------------------------
app.get('/api/categories', (req, res) => {
  res.json(catalogService.listCategories());
});

app.get('/api/courses', (req, res) => {
  const { categoryId, level, minRating, maxPrice, search } = req.query;
  const courses = catalogService.listPublishedCourses({
    categoryId: categoryId as string,
    level: level as any,
    minRating: minRating ? parseFloat(minRating as string) : undefined,
    maxPriceMinor: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
    searchQuery: search as string,
  });
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  try {
    const course = catalogService.getCourseById(req.params.id);
    res.json(course);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Student Course Content & Player Routes
// ----------------------------------------------------
app.get('/api/courses/:courseId/learn', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const enrolled = contentService.isEnrolled(req.params.courseId, user.userId);
    if (!enrolled) {
      res.status(403).json({ error: 'Enrollment required' });
      return;
    }
    const course = catalogService.getCourseById(req.params.courseId);
    res.json(course);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/courses/:courseId/lessons/:lessonId/access', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    let userId: string | undefined;
    let userRole: Role | undefined;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = authService.verifyToken(token);
        userId = payload.userId;
        userRole = payload.role;
      } catch (err) {}
    }

    const access = contentService.verifyLessonAccess(
      req.params.courseId,
      req.params.lessonId,
      userId,
      userRole
    );
    res.json(access);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

app.post('/api/enrollments/:enrollmentId/progress', authenticateToken, (req, res) => {
  try {
    const { lessonId, isCompleted, positionSec } = req.body;
    const progress = contentService.updateLessonProgress(
      req.params.enrollmentId,
      lessonId,
      isCompleted,
      positionSec || 0
    );
    res.json(progress);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/enrollments/my', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const enrollments = Array.from(db.enrollments.values()).filter(e => e.userId === user.userId && !e.isRefunded);
  res.json(enrollments);
});

// ----------------------------------------------------
// Cart & Checkout Routes
// ----------------------------------------------------
app.get('/api/cart', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const cart = cartService.getOrCreateCart(user.userId);
  res.json(cart);
});

app.post('/api/cart/items', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.body;
    const cart = cartService.addToCart(user.userId, courseId);
    res.status(201).json(cart);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/cart/items/:courseId', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const cart = cartService.removeFromCart(user.userId, req.params.courseId);
  res.json(cart);
});

app.post('/api/cart/pricing', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { couponCode, campaignCode } = req.body;
    const calculation = cartService.calculatePricing(user.userId, couponCode, campaignCode);
    res.json(calculation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/cart/checkout', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { couponCode, campaignCode } = req.body;
    const result = cartService.checkout(user.userId, couponCode, campaignCode);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Refund Routes
// ----------------------------------------------------
app.post('/api/purchases/:purchaseId/refund-request', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { reason } = req.body;
    const purchase = cartService.requestRefund(req.params.purchaseId, user.userId, reason);
    res.json(purchase);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/purchases/:purchaseId/refund-process', authenticateToken, requireRoles('ADMINISTRATOR'), (req, res) => {
  try {
    const user = (req as any).user;
    const { approve } = req.body;
    const purchase = cartService.processRefund(req.params.purchaseId, approve, user.role);
    res.json(purchase);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Assessment, Reviews, Notes & Discussions
// ----------------------------------------------------
app.get('/api/quizzes/:quizId', authenticateToken, (req, res) => {
  try {
    const quiz = assessmentService.getQuizForStudent(req.params.quizId);
    res.json(quiz);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/quizzes/:quizId/attempts', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { answers } = req.body;
    const attempt = assessmentService.submitQuizAttempt(req.params.quizId, user.userId, answers);
    res.status(201).json(attempt);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/assignments/:assignmentId/submissions', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { content } = req.body;
    const sub = assessmentService.submitAssignment(req.params.assignmentId, user.userId, content);
    res.status(201).json(sub);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/submissions/:submissionId/grade', authenticateToken, requireRoles('INSTRUCTOR', 'ADMINISTRATOR'), (req, res) => {
  try {
    const user = (req as any).user;
    const { marksAwarded, feedback } = req.body;
    const graded = assessmentService.gradeAssignment(req.params.submissionId, user.userId, user.role, marksAwarded, feedback);
    res.json(graded);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/courses/:courseId/reviews', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { rating, content } = req.body;
    const review = assessmentService.addCourseReview(req.params.courseId, user.userId, user.email, rating, content);
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/certificates/issue', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const { enrollmentId, recipientName } = req.body;
    const cert = assessmentService.issueCertificate(enrollmentId, recipientName || user.email);
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/certificates/verify/:code', (req, res) => {
  const cert = assessmentService.verifyCertificate(req.params.code);
  if (!cert) {
    res.status(404).json({ error: 'Certificate not found or invalid code' });
    return;
  }
  res.json({
    recipientName: cert.recipientName,
    courseTitle: cert.courseTitle,
    issuedAt: cert.issuedAt,
    verificationCode: cert.verificationCode,
    status: 'VALID',
  });
});

export const server = app;
