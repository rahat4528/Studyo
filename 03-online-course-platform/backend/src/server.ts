import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AuthService } from './services/auth.service';
import { SchoolService } from './services/school.service';
import { CourseService } from './services/course.service';
import { PaymentService } from './services/payment.service';
import { ProgressService } from './services/progress.service';
import { db } from './database/db';
import { School, SchoolRole } from './types';

export const app = express();

app.use(cors());
app.use(express.json());

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  school?: School;
  schoolRole?: SchoolRole | null;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Unauthorized' });
  }
};

export const resolveSchool = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const { slug } = req.params;
  if (!slug) {
    res.status(400).json({ error: 'School slug parameter is required' });
    return;
  }

  try {
    const school = SchoolService.getSchoolBySlug(slug);
    req.school = school;
    if (req.user) {
      req.schoolRole = SchoolService.getMemberRole(school.id, req.user.userId);
    }
    next();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

/* ================= AUTHENTICATION ================= */
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    const result = await AuthService.register(email, password, fullName);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/v1/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.get(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

/* ================= SCHOOL STOREFRONTS ================= */
app.post('/api/v1/schools', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug, name, theme, landingPage } = req.body;
    const school = SchoolService.createSchool(req.user!.userId, slug, name, theme, landingPage);
    res.status(201).json(school);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/schools/:slug', resolveSchool, (req: AuthenticatedRequest, res: Response) => {
  res.json(req.school);
});

app.put('/api/v1/schools/:slug/theme', authenticate, resolveSchool, (req: AuthenticatedRequest, res: Response) => {
  if (req.schoolRole !== 'OWNER' && req.schoolRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Only school owners or admins can update branding theme' });
  }
  const { theme } = req.body;
  req.school!.theme = { ...req.school!.theme, ...theme };
  db.schools.set(req.school!.id, req.school!);
  res.json(req.school!.theme);
});

/* ================= COURSES & LESSONS ================= */
app.get('/api/v1/schools/:slug/courses', resolveSchool, (req: AuthenticatedRequest, res: Response) => {
  const courses = Array.from(db.courses.values()).filter(c => c.schoolId === req.school!.id && c.isPublished);
  res.json(courses);
});

app.post('/api/v1/schools/:slug/courses', authenticate, resolveSchool, (req: AuthenticatedRequest, res: Response) => {
  if (req.schoolRole !== 'OWNER' && req.schoolRole !== 'ADMIN' && req.schoolRole !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Insufficient permissions to author courses in this academy' });
  }
  try {
    const course = CourseService.createCourse(req.school!.id, req.user!.userId, req.body);
    res.status(201).json(course);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/schools/:slug/courses/:id', resolveSchool, (req: AuthenticatedRequest, res: Response) => {
  const course = db.courses.get(req.params.id);
  if (!course || course.schoolId !== req.school!.id) {
    return res.status(404).json({ error: 'Course not found in this academy' });
  }
  res.json(course);
});

app.get('/api/v1/schools/:slug/lessons/:id', authenticate, resolveSchool, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = CourseService.getLessonAccess(req.params.id, req.user!.userId, req.school!.id);
    res.json(result);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

/* ================= CHECKOUT & WEBHOOKS ================= */
app.post('/api/v1/schools/:slug/checkout', authenticate, resolveSchool, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, couponCode } = req.body;
    const course = db.courses.get(courseId);
    if (!course || course.schoolId !== req.school!.id) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const priceCalc = PaymentService.calculatePrice(course, couponCode);
    res.json({
      courseId: course.id,
      title: course.title,
      currency: course.currency,
      ...priceCalc
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/webhooks/payment', (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-payment-signature'] as string;
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_studyo_course_platform_signature_secret_2026';

    if (signature) {
      const isValid = PaymentService.verifyWebhookSignature(JSON.stringify(req.body), signature, secret);
      if (!isValid) return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const result = PaymentService.processPaymentWebhook(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= PROGRESS & CERTIFICATES ================= */
app.put('/api/v1/schools/:slug/lessons/:id/progress', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, isCompleted, lastPositionSec } = req.body;
    const prog = ProgressService.saveLessonProgress(
      courseId,
      req.user!.userId,
      req.params.id,
      isCompleted,
      lastPositionSec || 0
    );
    res.json(prog);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/schools/:slug/courses/:id/certificate', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const cert = ProgressService.issueCertificate(req.params.id, req.user!.userId);
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/certificates/verify/:code', (req: Request, res: Response) => {
  const result = ProgressService.verifyCertificate(req.params.code);
  if (!result.isValid) {
    return res.status(404).json({ isValid: false, error: 'Certificate not found or invalid' });
  }
  res.json(result);
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4003;
  app.listen(PORT, () => {
    console.log(`Studyo Online Course Platform listening on port ${PORT}`);
  });
}
