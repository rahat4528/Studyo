import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AuthService } from './services/auth.service';
import { EnrollmentService } from './services/enrollment.service';
import { AcademicService } from './services/academic.service';
import { FinanceService } from './services/finance.service';
import { TranscriptService } from './services/transcript.service';
import { GuardianService } from './services/guardian.service';
import { db } from './database/db';
import { Role } from './types';

export const app = express();

app.use(cors());
app.use(express.json());

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
      res.status(403).json({ error: 'Forbidden: Insufficient institutional permissions' });
      return;
    }
    next();
  };
};

/* ================= AUTHENTICATION ================= */
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

  let extraProfile: any = null;
  if (user.role === 'STUDENT') {
    for (const s of db.students.values()) {
      if (s.userId === user.id) { extraProfile = s; break; }
    }
  } else if (user.role === 'FACULTY') {
    for (const f of db.faculty.values()) {
      if (f.userId === user.id) { extraProfile = f; break; }
    }
  }

  res.json({ ...safeUser, profile: extraProfile });
});

/* ================= ACADEMIC CATALOG ================= */
app.get('/api/v1/departments', (req: Request, res: Response) => {
  res.json(Array.from(db.departments.values()));
});

app.get('/api/v1/programs', (req: Request, res: Response) => {
  res.json(Array.from(db.programs.values()));
});

app.get('/api/v1/courses', (req: Request, res: Response) => {
  res.json(Array.from(db.courses.values()));
});

app.get('/api/v1/semesters', (req: Request, res: Response) => {
  res.json(Array.from(db.semesters.values()));
});

app.get('/api/v1/sections', (req: Request, res: Response) => {
  res.json(Array.from(db.sections.values()));
});

/* ================= COURSE REGISTRATION ================= */
app.post('/api/v1/enrollments/register', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sectionId, studentId } = req.body;
    let targetStudentId = studentId;

    if (req.user!.role === 'STUDENT') {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.userId);
      if (!student) return res.status(404).json({ error: 'Student profile not found' });
      targetStudentId = student.id;
    }

    const enrollment = await EnrollmentService.registerCourse(targetStudentId, sectionId);
    res.status(201).json(enrollment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/enrollments/drop', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sectionId, studentId } = req.body;
    let targetStudentId = studentId;

    if (req.user!.role === 'STUDENT') {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.userId);
      if (!student) return res.status(404).json({ error: 'Student profile not found' });
      targetStudentId = student.id;
    }

    EnrollmentService.dropCourse(targetStudentId, sectionId);
    res.json({ success: true, message: 'Course successfully dropped' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= ATTENDANCE ================= */
app.post(
  '/api/v1/faculty/sections/:id/attendance',
  authenticate,
  requireRoles('FACULTY', 'ADMINISTRATOR'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { date, records } = req.body;
      const faculty = Array.from(db.faculty.values()).find(f => f.userId === req.user!.userId);
      const facultyId = faculty ? faculty.id : 'admin-override';

      const saved = AcademicService.recordAttendance(facultyId, req.params.id, date, records);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* ================= GRADES & EXAMS ================= */
app.post(
  '/api/v1/examinations/submit-marks',
  authenticate,
  requireRoles('FACULTY', 'ADMINISTRATOR'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { examId, marks } = req.body;
      const faculty = Array.from(db.faculty.values()).find(f => f.userId === req.user!.userId);
      const facultyId = faculty ? faculty.id : 'admin-override';

      AcademicService.submitExamMarks(facultyId, examId, marks);
      res.json({ success: true, message: 'Examination marks submitted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.post(
  '/api/v1/examinations/publish-results',
  authenticate,
  requireRoles('ADMINISTRATOR'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { examId } = req.body;
      AcademicService.publishExamResults(req.user!.userId, examId);
      res.json({ success: true, message: 'Examination results published' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.get('/api/v1/students/:id/grades', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const targetStudentId = req.params.id;

  // Enforce ownership: student can only view their own
  if (req.user!.role === 'STUDENT') {
    const student = Array.from(db.students.values()).find(s => s.userId === req.user!.userId);
    if (!student || student.id !== targetStudentId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own grades' });
    }
  }

  // Enforce guardian link approval
  if (req.user!.role === 'GUARDIAN') {
    const guardian = Array.from(db.guardians.values()).find(g => g.userId === req.user!.userId);
    if (!guardian || !GuardianService.canGuardianAccessStudent(guardian.id, targetStudentId)) {
      return res.status(403).json({ error: 'Access denied: Unapproved guardian access' });
    }
  }

  const grades = AcademicService.getStudentGrades(targetStudentId, req.user!.role);
  const gpaStats = AcademicService.calculateStudentGPA(targetStudentId);
  res.json({ grades, gpa: gpaStats.gpa, cgpa: gpaStats.cgpa, totalCredits: gpaStats.totalCredits });
});

/* ================= FINANCE & LEDGER ================= */
app.get('/api/v1/students/:id/fees', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const targetStudentId = req.params.id;

  if (req.user!.role === 'STUDENT') {
    const student = Array.from(db.students.values()).find(s => s.userId === req.user!.userId);
    if (!student || student.id !== targetStudentId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own financial records' });
    }
  }

  const summary = FinanceService.getStudentFinancialSummary(targetStudentId);
  res.json(summary);
});

app.post(
  '/api/v1/finance/payments',
  authenticate,
  requireRoles('ADMINISTRATOR'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { studentFeeId, studentId, amount, paymentMethod } = req.body;
      const payment = FinanceService.recordPayment(studentFeeId, studentId, amount, paymentMethod);
      res.status(201).json(payment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* ================= TRANSCRIPTS ================= */
app.post('/api/v1/transcripts/issue', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId } = req.body;
    let targetStudentId = studentId;

    if (req.user!.role === 'STUDENT') {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.userId);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      targetStudentId = student.id;
    }

    const transcript = TranscriptService.issueTranscript(targetStudentId, req.user!.userId);
    res.status(201).json(transcript);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/transcripts/verify/:code', (req: Request, res: Response) => {
  const result = TranscriptService.verifyTranscript(req.params.code);
  if (!result.isValid) {
    return res.status(404).json({ isValid: false, error: 'Official transcript record not found or unsealed' });
  }
  res.json(result);
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(`Studyo Student Portal System listening on port ${PORT}`);
  });
}
