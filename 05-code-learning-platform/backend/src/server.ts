import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { db } from './database/db';
import { seedCodePlatform } from './database/seed';
import { authService } from './services/auth.service';
import { curriculumService } from './services/curriculum.service';
import { submissionService } from './services/submission.service';
import { gamificationService } from './services/gamification.service';
import { visualizerService } from './services/visualizer.service';
import { certificateService } from './services/certificate.service';
import { Role } from './types';

export const app = express();
app.use(cors());
app.use(express.json());

// Initialize default seed state
seedCodePlatform();

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

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Studyo Code Learning Platform',
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
    res.status(201).json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, xp: user.xp }, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = authService.authenticate(email, password);
    const token = authService.generateToken(user);
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, xp: user.xp }, token });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const payload = (req as any).user;
  const user = db.users.get(payload.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    xp: user.xp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  });
});

// ----------------------------------------------------
// Curriculum & Challenges Routes
// ----------------------------------------------------
app.get('/api/tracks', (req, res) => {
  res.json(curriculumService.listTracks());
});

app.get('/api/tracks/:slug', (req, res) => {
  try {
    const track = curriculumService.getTrackBySlug(req.params.slug);
    res.json(track);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.get('/api/challenges/:id', (req, res) => {
  try {
    // Sanitized: Never leaks hidden test cases or solution code
    const challenge = curriculumService.getChallengePublic(req.params.id);
    res.json(challenge);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Submissions & Execution Routes
// ----------------------------------------------------
app.post('/api/challenges/:id/submit', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { language, code } = req.body;

    const submission = await submissionService.submitCode(
      req.params.id,
      user.userId,
      language || 'javascript',
      code
    );

    res.status(201).json(submission);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/challenges/:id/submissions', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const submissions = submissionService.getSubmissionsByUser(user.userId, req.params.id);
  res.json(submissions);
});

// ----------------------------------------------------
// Gamification, Streaks & Badges
// ----------------------------------------------------
app.get('/api/users/profile/badges', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json(gamificationService.getUserBadges(user.userId));
});

// ----------------------------------------------------
// Visualizer Route
// ----------------------------------------------------
app.post('/api/visualizer/trace', (req, res) => {
  try {
    const { algorithm, array } = req.body;
    const trace = visualizerService.generateSortingTrace(
      algorithm || 'bubble',
      Array.isArray(array) && array.length > 0 ? array : [5, 2, 8, 1, 9]
    );
    res.json({ frames: trace });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Certification Routes
// ----------------------------------------------------
app.post('/api/tracks/:id/claim-certificate', authenticateToken, (req, res) => {
  try {
    const user = (req as any).user;
    const dbUser = db.users.get(user.userId);
    const cert = certificateService.claimTrackCertificate(
      req.params.id,
      user.userId,
      dbUser ? dbUser.fullName : user.email
    );
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/certificates/verify/:code', (req, res) => {
  const cert = certificateService.verifyCertificate(req.params.code);
  if (!cert) {
    res.status(404).json({ error: 'Certificate not found or invalid' });
    return;
  }
  res.json({
    recipientName: cert.recipientName,
    trackTitle: cert.trackTitle,
    verificationCode: cert.verificationCode,
    issuedAt: cert.issuedAt,
    status: 'VALID',
  });
});

export const server = app;
