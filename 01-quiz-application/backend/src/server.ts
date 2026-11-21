import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AuthService } from './services/auth.service';
import { QuizService } from './services/quiz.service';
import { AttemptService } from './services/attempt.service';
import { GradingService } from './services/grading.service';
import { AnalyticsService } from './services/analytics.service';
import { CertificateService } from './services/certificate.service';
import { ImportExportService } from './services/import-export.service';
import { db } from './database/db';
import { Role } from './types';

export const app = express();

app.use(cors());
app.use(express.json());

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
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

export const requireRoles = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};

/* ================= AUTHENTICATION ROUTES ================= */
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and fullName are required' });
    }
    const result = await AuthService.register(email, password, fullName, role || 'STUDENT');
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/v1/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.get(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

/* ================= QUIZ MANAGEMENT ROUTES ================= */
app.get('/api/v1/quizzes', (req: Request, res: Response) => {
  const { categoryId, difficulty, isPractice } = req.query;
  const list = Array.from(db.quizzes.values()).filter(q => {
    if (categoryId && q.categoryId !== categoryId) return false;
    if (difficulty && q.difficulty !== difficulty) return false;
    if (isPractice !== undefined && String(q.isPractice) !== String(isPractice)) return false;
    return true;
  });
  res.json(list);
});

app.post(
  '/api/v1/quizzes',
  authenticate,
  requireRoles('TEACHER', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const quiz = QuizService.createQuiz(req.body, req.user!.userId, req.user!.role);
      res.status(201).json(quiz);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.get('/api/v1/quizzes/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const quiz = QuizService.getQuizById(req.params.id, req.user!.role);
    res.json(quiz);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.put('/api/v1/quizzes/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = QuizService.updateQuiz(req.params.id, req.body, req.user!.userId, req.user!.role);
    res.json(updated);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

app.delete('/api/v1/quizzes/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    QuizService.deleteQuiz(req.params.id, req.user!.userId, req.user!.role);
    res.json({ success: true });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

app.post(
  '/api/v1/quizzes/:id/regrade',
  authenticate,
  requireRoles('TEACHER', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reason } = req.body;
      const result = GradingService.regradeQuiz(req.params.id, req.user!.userId, reason);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.get('/api/v1/quizzes/:id/analytics', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = AnalyticsService.getQuizAnalytics(req.params.id);
    res.json(analytics);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= QUESTION BANK ROUTES ================= */
app.get('/api/v1/questions', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { categoryId } = req.query;
  const questions = Array.from(db.questions.values()).filter(q => {
    if (categoryId && q.categoryId !== categoryId) return false;
    return true;
  });
  res.json(questions);
});

app.post(
  '/api/v1/questions',
  authenticate,
  requireRoles('TEACHER', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const q = QuizService.createQuestion(req.body, req.user!.userId, req.user!.role);
      res.status(201).json(q);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.post(
  '/api/v1/questions/import',
  authenticate,
  requireRoles('TEACHER', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { items, csvContent, categoryId } = req.body;
      let result;
      if (csvContent) {
        result = ImportExportService.importQuestionsFromCSV(csvContent, categoryId || 'general', req.user!.userId);
      } else if (items) {
        result = ImportExportService.importQuestionsFromJSON(items, categoryId || 'general', req.user!.userId);
      } else {
        return res.status(400).json({ error: 'Provide either items (JSON array) or csvContent (string)' });
      }
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.get('/api/v1/questions/export', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { categoryId } = req.query;
  const items = ImportExportService.exportQuestions(categoryId as string);
  res.json(items);
});

/* ================= ASSESSMENT ATTEMPT ROUTES ================= */
app.post('/api/v1/quizzes/:id/attempts', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attempt = await AttemptService.startAttempt(req.params.id, req.user!.userId);
    res.status(201).json(attempt);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/attempts/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const attempt = db.attempts.get(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  if (req.user!.role === 'STUDENT' && attempt.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Unauthorized to view this attempt' });
  }

  const quiz = db.quizzes.get(attempt.quizId);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const response = AttemptService.serializeAttemptForStudent(attempt, quiz);
  res.json(response);
});

app.put('/api/v1/attempts/:id/answers', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { questionId, version, ...answerData } = req.body;
    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }
    const saved = AttemptService.saveAnswer(
      req.params.id,
      req.user!.userId,
      questionId,
      answerData,
      version || 1
    );
    res.json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/attempts/:id/submit', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const attempt = AttemptService.submitAttempt(req.params.id, req.user!.userId);
    const quiz = db.quizzes.get(attempt.quizId)!;
    const response = AttemptService.serializeAttemptForStudent(attempt, quiz);
    res.json(response);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/attempts/:id/revisions', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const attempt = db.attempts.get(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }
  if (req.user!.role === 'STUDENT' && attempt.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const revisions = GradingService.getRevisions(req.params.id);
  res.json(revisions);
});

/* ================= MANUAL GRADING ================= */
app.post(
  '/api/v1/grading/essay',
  authenticate,
  requireRoles('TEACHER', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { attemptId, questionId, pointsAwarded, feedback } = req.body;
      const updated = GradingService.gradeEssay(
        attemptId,
        questionId,
        pointsAwarded,
        feedback,
        req.user!.userId
      );
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* ================= CERTIFICATES ================= */
app.post('/api/v1/certificates/:attemptId/issue', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const cert = CertificateService.issueCertificate(req.params.attemptId, req.user!.userId);
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/certificates/verify/:code', (req: Request, res: Response) => {
  const result = CertificateService.verifyCertificate(req.params.code);
  if (!result.isValid) {
    return res.status(404).json({ isValid: false, error: 'Certificate not found or revoked' });
  }
  res.json(result);
});

// Server listener when run directly
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`Studyo Quiz Application backend listening on port ${PORT}`);
  });
}
