import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { Track, Chapter, Challenge, TestCase, Hint, Difficulty } from '../types';

export class CurriculumService {
  public createTrack(title: string, slug: string, description: string, orderIndex: number = 1): Track {
    const track: Track = {
      id: randomUUID(),
      title,
      slug,
      description,
      orderIndex,
      chapters: [],
    };
    db.tracks.set(track.id, track);
    return track;
  }

  public listTracks(): Track[] {
    return Array.from(db.tracks.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public getTrackBySlug(slug: string): Track {
    const track = Array.from(db.tracks.values()).find(t => t.slug === slug);
    if (!track) throw new Error('Track not found');
    return track;
  }

  public createChapter(trackId: string, title: string, orderIndex: number = 1): Chapter {
    const track = db.tracks.get(trackId);
    if (!track) throw new Error('Track not found');

    const chapter: Chapter = {
      id: randomUUID(),
      trackId,
      title,
      orderIndex,
      challenges: [],
    };

    db.chapters.set(chapter.id, chapter);
    track.chapters.push(chapter);
    return chapter;
  }

  public createChallenge(
    chapterId: string,
    title: string,
    slug: string,
    difficulty: Difficulty,
    xpReward: number,
    description: string,
    starterCode: Record<string, string>,
    timeLimitMs: number = 3000,
    memoryLimitMb: number = 128,
    orderIndex: number = 1
  ): Challenge {
    const chapter = db.chapters.get(chapterId);
    if (!chapter) throw new Error('Chapter not found');

    const challenge: Challenge = {
      id: randomUUID(),
      chapterId,
      title,
      slug,
      difficulty,
      xpReward,
      description,
      starterCode,
      timeLimitMs,
      memoryLimitMb,
      orderIndex,
      testCases: [],
      hints: [],
    };

    db.challenges.set(challenge.id, challenge);
    chapter.challenges.push(challenge);
    return challenge;
  }

  public addTestCase(
    challengeId: string,
    input: string,
    expected: string,
    isPublic: boolean = false,
    orderIndex: number = 1
  ): TestCase {
    const challenge = db.challenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const testCase: TestCase = {
      id: randomUUID(),
      challengeId,
      input,
      expected,
      isPublic,
      orderIndex,
    };

    db.testCases.set(testCase.id, testCase);
    challenge.testCases.push(testCase);
    return testCase;
  }

  public addHint(
    challengeId: string,
    content: string,
    orderIndex: number = 1,
    xpCost: number = 10
  ): Hint {
    const challenge = db.challenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const hint: Hint = {
      id: randomUUID(),
      challengeId,
      content,
      orderIndex,
      xpCost,
    };

    db.hints.set(hint.id, hint);
    challenge.hints.push(hint);
    return hint;
  }

  /**
   * Sanitizer: Zero-leak delivery of challenge to students.
   * Strips all hidden test cases and private solution code!
   */
  public getChallengePublic(challengeId: string): Omit<Challenge, 'testCases' | 'solutionCode'> & {
    testCases: Array<{ id: string; input: string; expected: string; isPublic: true }>;
  } {
    const challenge = db.challenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    return {
      id: challenge.id,
      chapterId: challenge.chapterId,
      title: challenge.title,
      slug: challenge.slug,
      difficulty: challenge.difficulty,
      xpReward: challenge.xpReward,
      description: challenge.description,
      starterCode: challenge.starterCode,
      timeLimitMs: challenge.timeLimitMs,
      memoryLimitMb: challenge.memoryLimitMb,
      orderIndex: challenge.orderIndex,
      hints: challenge.hints,
      testCases: challenge.testCases
        .filter(tc => tc.isPublic)
        .map(tc => ({
          id: tc.id,
          input: tc.input,
          expected: tc.expected,
          isPublic: true,
        })),
    };
  }
}

export const curriculumService = new CurriculumService();
