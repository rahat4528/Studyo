import { db } from './db';
import { authService } from '../services/auth.service';
import { curriculumService } from '../services/curriculum.service';
import { gamificationService } from '../services/gamification.service';

export function seedCodePlatform(): void {
  db.clear();

  // 1. Initialize Default Badges
  gamificationService.registerDefaultBadges();

  // 2. Users
  const student = authService.register(
    'learner@studyo-code.local',
    'LearnerPass123!',
    'Alex Rivers',
    'STUDENT'
  );

  const author = authService.register(
    'author@studyo-code.local',
    'AuthorPass123!',
    'Dr. Maya Lin',
    'AUTHOR'
  );

  // 3. Track: Algorithms & Data Structures
  const trackAlgo = curriculumService.createTrack(
    'Algorithms & Data Structures',
    'algorithms-data-structures',
    'Master fundamental algorithmic patterns, time complexity analysis, and problem-solving strategies',
    1
  );

  // Chapter 1: Array Manipulation & Two Pointers
  const ch1 = curriculumService.createChapter(trackAlgo.id, 'Arrays & Two Pointers', 1);

  // Challenge 1: Two Sum
  const c1 = curriculumService.createChallenge(
    ch1.id,
    'Two Sum',
    'two-sum',
    'EASY',
    50,
    `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    {
      javascript: `function solution(nums, target) {
  // Your code here
  return [];
}`,
      python: `def solution(nums, target):
    # Your code here
    return []`,
    },
    3000,
    128,
    1
  );

  // Public Test Cases
  curriculumService.addTestCase(c1.id, JSON.stringify([[2, 7, 11, 15], 9]), JSON.stringify([0, 1]), true, 1);
  curriculumService.addTestCase(c1.id, JSON.stringify([[3, 2, 4], 6]), JSON.stringify([1, 2]), true, 2);

  // Hidden Test Cases (edge cases & negative numbers)
  curriculumService.addTestCase(c1.id, JSON.stringify([[3, 3], 6]), JSON.stringify([0, 1]), false, 3);
  curriculumService.addTestCase(c1.id, JSON.stringify([[-1, -2, -3, -4, -5], -8]), JSON.stringify([2, 4]), false, 4);

  // Hints
  curriculumService.addHint(c1.id, 'Can you use a Hash Map to store previously visited numbers and their indices?', 1, 10);
  curriculumService.addHint(c1.id, 'For each number x, check if (target - x) already exists in your map.', 2, 15);

  // Challenge 2: Valid Palindrome
  const c2 = curriculumService.createChallenge(
    ch1.id,
    'Valid Palindrome',
    'valid-palindrome',
    'EASY',
    50,
    `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.`,
    {
      javascript: `function solution(s) {
  // Your code here
  return false;
}`,
    },
    3000,
    128,
    2
  );

  curriculumService.addTestCase(c2.id, JSON.stringify(["A man, a plan, a canal: Panama"]), JSON.stringify(true), true, 1);
  curriculumService.addTestCase(c2.id, JSON.stringify(["race a car"]), JSON.stringify(false), true, 2);
  curriculumService.addTestCase(c2.id, JSON.stringify([" "]), JSON.stringify(true), false, 3);

  // Track 2: Core JavaScript Mastery
  const trackJS = curriculumService.createTrack(
    'JavaScript Mastery',
    'javascript-mastery',
    'Deep dive into asynchronous programming, event loop, closures, and object prototypes',
    2
  );
  const chJS1 = curriculumService.createChapter(trackJS.id, 'Closures & Scope', 1);
  const cJS1 = curriculumService.createChallenge(
    chJS1.id,
    'Counter Generator',
    'counter-generator',
    'EASY',
    50,
    `Given an integer \`n\`, return a counter function. This counter function initially returns \`n\` and then returns 1 more than the previous value every subsequent time it is called.`,
    {
      javascript: `function solution(n) {
  let count = n;
  return function() {
    return count++;
  };
}`,
    },
    3000,
    128,
    1
  );
  curriculumService.addTestCase(cJS1.id, JSON.stringify([10]), JSON.stringify(10), true, 1);

  console.log('Studyo Code Learning Platform Database Seeded Successfully!');
}

if (require.main === module) {
  seedCodePlatform();
}
