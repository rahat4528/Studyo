import { db } from '../src/database/db';
import { catalogService } from '../src/services/catalog.service';
import { moderationService } from '../src/services/moderation.service';

describe('LMS Catalog Search, Facets & Filtering Engine', () => {
  beforeEach(() => {
    db.clear();

    // Register and verify instructor
    moderationService.registerInstructorProfile('inst-1', 'Lead Instructor');
    moderationService.submitVerificationDocs('inst-1', 'kyc-verified-docs.pdf');
    moderationService.reviewInstructorVerification('inst-1', 'VERIFIED', 'ADMINISTRATOR');

    const catDev = catalogService.createCategory('Development', 'dev');
    const catDesign = catalogService.createCategory('Design', 'design');

    // Helper to create & publish
    const publish = (title: string, catId: string, price: number, level: any, desc: string, rating: number) => {
      const c = catalogService.createCourse('inst-1', catId, title, title.toLowerCase().replace(/\s+/g, '-'), desc, price, 'USD', level);
      const sec = catalogService.addSection(c.id, 'Intro', 'inst-1', 'INSTRUCTOR');
      catalogService.addLesson(c.id, sec.id, 'L1', 'Content', 'v.mp4', 300, true, 'inst-1', 'INSTRUCTOR');
      moderationService.submitCourseForReview(c.id, 'inst-1');
      moderationService.startReview(c.id, 'ADMINISTRATOR');
      moderationService.approveCourse(c.id, 'ADMINISTRATOR');
      moderationService.publishCourse(c.id, 'inst-1', 'INSTRUCTOR');
      c.ratingAverage = rating;
      c.ratingCount = 10;
      return c;
    };

    publish('Python Masterclass 2026', catDev.id, 1999, 'BEGINNER', 'Learn Python from scratch with data structures', 4.8);
    publish('Advanced React Architecture', catDev.id, 4999, 'EXPERT', 'Micro-frontends, state machines, and concurrency', 4.6);
    publish('UI/UX Design Systems in Figma', catDesign.id, 2999, 'INTERMEDIATE', 'Component libraries, design tokens, and accessibility', 4.9);
    publish('Free Git & GitHub Crash Course', catDev.id, 0, 'ALL_LEVELS', 'Version control essentials for every developer', 4.5);
  });

  test('Lists all published courses when no filters are provided', () => {
    const courses = catalogService.listPublishedCourses();
    expect(courses.length).toBe(4);
  });

  test('Filters courses by category', () => {
    const catDesign = Array.from(db.categories.values()).find(c => c.slug === 'design');
    const courses = catalogService.listPublishedCourses({ categoryId: catDesign?.id });
    expect(courses.length).toBe(1);
    expect(courses[0].title).toBe('UI/UX Design Systems in Figma');
  });

  test('Filters courses by level', () => {
    const courses = catalogService.listPublishedCourses({ level: 'EXPERT' });
    expect(courses.length).toBe(1);
    expect(courses[0].title).toBe('Advanced React Architecture');
  });

  test('Filters courses by maximum price (e.g. Free courses only)', () => {
    const freeCourses = catalogService.listPublishedCourses({ maxPriceMinor: 0 });
    expect(freeCourses.length).toBe(1);
    expect(freeCourses[0].title).toBe('Free Git & GitHub Crash Course');
  });

  test('Filters courses by minimum rating', () => {
    const highRated = catalogService.listPublishedCourses({ minRating: 4.8 });
    expect(highRated.length).toBe(2); // 4.8 and 4.9
  });

  test('Searches courses across title and description keywords', () => {
    const results = catalogService.listPublishedCourses({ searchQuery: 'tokens' });
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('UI/UX Design Systems in Figma');
  });
});
