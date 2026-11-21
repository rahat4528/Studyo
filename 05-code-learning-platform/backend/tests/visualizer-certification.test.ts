import { db } from '../src/database/db';
import { authService } from '../src/services/auth.service';
import { curriculumService } from '../src/services/curriculum.service';
import { submissionService } from '../src/services/submission.service';
import { visualizerService } from '../src/services/visualizer.service';
import { certificateService } from '../src/services/certificate.service';

describe('Algorithm Visualizer & Track Certifications', () => {
  let userId: string;
  let trackId: string;
  let challenge1Id: string;
  let challenge2Id: string;

  beforeEach(() => {
    db.clear();

    const user = authService.register('student@test.local', 'Pass123!', 'Dev Student', 'STUDENT');
    userId = user.id;

    const track = curriculumService.createTrack('DSA Track', 'dsa-track', 'Data structures');
    trackId = track.id;

    const ch = curriculumService.createChapter(trackId, 'Sorting & Searching');
    const c1 = curriculumService.createChallenge(ch.id, 'C1', 'c1', 'EASY', 50, 'Desc 1', { javascript: 'function solution(x) { return x; }' });
    const c2 = curriculumService.createChallenge(ch.id, 'C2', 'c2', 'EASY', 50, 'Desc 2', { javascript: 'function solution(x) { return x; }' });
    challenge1Id = c1.id;
    challenge2Id = c2.id;

    curriculumService.addTestCase(challenge1Id, JSON.stringify([1]), JSON.stringify(1), true, 1);
    curriculumService.addTestCase(challenge2Id, JSON.stringify([2]), JSON.stringify(2), true, 1);
  });

  test('Visualizer generates ordered state frames for Bubble Sort', () => {
    const input = [4, 1, 3];
    const frames = visualizerService.generateSortingTrace('bubble', input);

    expect(frames.length).toBeGreaterThan(3);
    expect(frames[0].description).toBe('Initial array state');
    expect(frames[frames.length - 1].description).toContain('Sorting complete');
    expect(frames[frames.length - 1].array).toEqual([1, 3, 4]);
  });

  test('Visualizer generates ordered state frames for Selection Sort', () => {
    const input = [9, 2, 5];
    const frames = visualizerService.generateSortingTrace('selection', input);

    expect(frames.length).toBeGreaterThan(3);
    expect(frames[frames.length - 1].array).toEqual([2, 5, 9]);
  });

  test('Track certificate cannot be claimed if incomplete', () => {
    expect(() => {
      certificateService.claimTrackCertificate(trackId, userId, 'Dev Student');
    }).toThrow('Track completion criteria not met: All challenges must have accepted solutions');
  });

  test('Track certificate can be claimed after 100% challenges are accepted', async () => {
    // Solve C1
    await submissionService.submitCode(challenge1Id, userId, 'javascript', 'function solution(x) { return x; }');
    expect(certificateService.verifyTrackCompletion(trackId, userId)).toBe(false);

    // Solve C2
    await submissionService.submitCode(challenge2Id, userId, 'javascript', 'function solution(x) { return x; }');
    expect(certificateService.verifyTrackCompletion(trackId, userId)).toBe(true);

    // Claim certificate
    const cert = certificateService.claimTrackCertificate(trackId, userId, 'Dev Student');
    expect(cert.verificationCode).toBeDefined();
    expect(cert.trackTitle).toBe('DSA Track');
    expect(cert.recipientName).toBe('Dev Student');

    // Verify certificate
    const verified = certificateService.verifyCertificate(cert.verificationCode);
    expect(verified).not.toBeNull();
    expect(verified?.recipientName).toBe('Dev Student');
  });
});
