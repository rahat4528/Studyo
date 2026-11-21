import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { Badge, UserBadge, ActivityLog, User } from '../types';

export class GamificationService {
  /**
   * Initializes default achievement badges
   */
  public registerDefaultBadges(): void {
    const defaultBadges: Array<Omit<Badge, 'id'>> = [
      {
        code: 'FIRST_BLOOD',
        name: 'First Submission',
        description: 'Successfully submitted your first accepted solution',
        icon: '⚔️',
        xpBonus: 50,
      },
      {
        code: 'STREAK_7',
        name: 'Week-Long Streak',
        description: 'Maintained a daily coding streak for 7 consecutive days',
        icon: '🔥',
        xpBonus: 200,
      },
      {
        code: 'ALGO_MASTER',
        name: 'Algorithm Pioneer',
        description: 'Solved all challenges in the Data Structures track',
        icon: '🧠',
        xpBonus: 500,
      },
    ];

    for (const b of defaultBadges) {
      if (!Array.from(db.badges.values()).some(existing => existing.code === b.code)) {
        const badge: Badge = { id: randomUUID(), ...b };
        db.badges.set(badge.id, badge);
      }
    }
  }

  /**
   * Records daily activity and computes current/longest streaks
   */
  public recordDailyActivity(userId: string, targetDateStr?: string): { currentStreak: number; longestStreak: number } {
    const user = db.users.get(userId);
    if (!user) throw new Error('User not found');

    const todayStr = targetDateStr || new Date().toISOString().split('T')[0];
    const logKey = `${userId}:${todayStr}`;

    const existingLog = Array.from(db.activityLogs.values()).find(
      l => l.userId === userId && l.date === todayStr
    );

    if (existingLog) {
      existingLog.count += 1;
      return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
    }

    // New active day
    const log: ActivityLog = {
      id: randomUUID(),
      userId,
      date: todayStr,
      count: 1,
    };
    db.activityLogs.set(log.id, log);

    // Calculate streak continuity
    if (!user.lastActiveDate) {
      user.currentStreak = 1;
    } else {
      const lastActive = new Date(user.lastActiveDate);
      const currentDay = new Date(todayStr);
      const diffMs = currentDay.getTime() - lastActive.getTime();
      const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

      if (diffDays === 1) {
        user.currentStreak += 1;
      } else if (diffDays === 0) {
        // Same day, streak unchanged
      } else {
        // Gap > 1 day, streak resets
        user.currentStreak = 1;
      }
    }

    user.lastActiveDate = todayStr;
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    // Check for streak badge
    if (user.currentStreak >= 7) {
      this.awardBadge(userId, 'STREAK_7');
    }

    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
  }

  /**
   * Awards an achievement badge if not already awarded
   */
  public awardBadge(userId: string, badgeCode: string): UserBadge | null {
    const badge = Array.from(db.badges.values()).find(b => b.code === badgeCode);
    if (!badge) return null;

    const alreadyAwarded = Array.from(db.userBadges.values()).some(
      ub => ub.userId === userId && ub.badgeId === badge.id
    );
    if (alreadyAwarded) return null;

    const userBadge: UserBadge = {
      id: randomUUID(),
      userId,
      badgeId: badge.id,
      awardedAt: new Date().toISOString(),
    };

    db.userBadges.set(userBadge.id, userBadge);

    // Bonus XP
    const user = db.users.get(userId);
    if (user) {
      user.xp += badge.xpBonus;
    }

    return userBadge;
  }

  public getUserBadges(userId: string): Array<Badge & { awardedAt: string }> {
    const userBadges = Array.from(db.userBadges.values()).filter(ub => ub.userId === userId);
    return userBadges.map(ub => {
      const badge = db.badges.get(ub.badgeId)!;
      return {
        ...badge,
        awardedAt: ub.awardedAt,
      };
    });
  }
}

export const gamificationService = new GamificationService();
