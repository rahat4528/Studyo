import { db } from '../src/database/db';
import { authService } from '../src/services/auth.service';
import { curriculumService } from '../src/services/curriculum.service';
import { submissionService } from '../src/services/submission.service';
import { gamificationService } from '../src/services/gamification.service';

describe('Gamification, Streaks & Achievement Badges', () => {
  let userId: string;
  let challengeId: string;

  beforeEach(() => {
    db.clear();
    gamificationService.registerDefaultBadges();

    const user = authService.register('coder@test.local', 'Pass123!', 'Coder', 'STUDENT');
    userId = user.id;

    const track = curriculumService.createTrack('Track 1', 't1', 'Desc');
    const ch = curriculumService.createChapter(track.id, 'Ch 1');
    const challenge = curriculumService.createChallenge(
      ch.id,
      'Identity Function',
      'id-func',
      'EASY',
      75, // 75 XP reward
      'Return input',
      { javascript: 'function solution(x) { return x; }' }
    );
    challengeId = challenge.id;

    curriculumService.addTestCase(challengeId, JSON.stringify([42]), JSON.stringify(42), true, 1);
  });

  test('First accepted submission awards XP to user', async () => {
    const userBefore = db.users.get(userId)!;
    expect(userBefore.xp).toBe(0);

    const sub = await submissionService.submitCode(
      challengeId,
      userId,
      'javascript',
      'function solution(x) { return x; }'
    );

    expect(sub.verdict).toBe('ACCEPTED');

    const userAfter = db.users.get(userId)!;
    expect(userAfter.xp).toBe(75);
  });

  test('Subsequent accepted submission does not double-award XP', async () => {
    await submissionService.submitCode(
      challengeId,
      userId,
      'javascript',
      'function solution(x) { return x; }'
    );
    expect(db.users.get(userId)!.xp).toBe(75);

    // Resubmit same solved challenge
    await submissionService.submitCode(
      challengeId,
      userId,
      'javascript',
      'function solution(x) { return x; }'
    );
    expect(db.users.get(userId)!.xp).toBe(75);
  });

  test('Daily consecutive activity tracks streaks accurately', () => {
    // Day 1
    const d1 = gamificationService.recordDailyActivity(userId, '2026-11-10');
    expect(d1.currentStreak).toBe(1);

    // Day 2 (consecutive)
    const d2 = gamificationService.recordDailyActivity(userId, '2026-11-11');
    expect(d2.currentStreak).toBe(2);

    // Day 3 (consecutive)
    const d3 = gamificationService.recordDailyActivity(userId, '2026-11-12');
    expect(d3.currentStreak).toBe(3);
    expect(d3.longestStreak).toBe(3);

    // Day 5 (broken streak, skipped Day 4)
    const d5 = gamificationService.recordDailyActivity(userId, '2026-11-14');
    expect(d5.currentStreak).toBe(1);
    expect(d5.longestStreak).toBe(3); // preserved!
  });

  test('7-Day streak automatically unlocks STREAK_7 achievement badge with XP bonus', () => {
    for (let day = 1; day <= 7; day++) {
      const dateStr = `2026-11-${day < 10 ? '0' + day : day}`;
      gamificationService.recordDailyActivity(userId, dateStr);
    }

    const user = db.users.get(userId)!;
    expect(user.currentStreak).toBe(7);

    const badges = gamificationService.getUserBadges(userId);
    const streakBadge = badges.find(b => b.code === 'STREAK_7');
    expect(streakBadge).toBeDefined();
    expect(user.xp).toBeGreaterThanOrEqual(200); // 200 XP bonus for badge
  });
});
