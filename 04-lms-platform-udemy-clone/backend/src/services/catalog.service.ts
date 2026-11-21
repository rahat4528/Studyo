import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { Course, CourseCategory, CourseSection, Lesson, Role } from '../types';

export interface SearchFilters {
  categoryId?: string;
  categorySlug?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  minRating?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'ALL_LEVELS';
  searchQuery?: string;
}

export class CatalogService {
  public createCategory(name: string, slug: string, description?: string): CourseCategory {
    const category: CourseCategory = {
      id: randomUUID(),
      name,
      slug,
      description,
    };
    db.categories.set(category.id, category);
    return category;
  }

  public listCategories(): CourseCategory[] {
    return Array.from(db.categories.values());
  }

  public createCourse(
    instructorId: string,
    categoryId: string,
    title: string,
    slug: string,
    description: string,
    priceMinor: number,
    currency: string = 'USD',
    level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'ALL_LEVELS' = 'ALL_LEVELS',
    thumbnailUrl?: string
  ): Course {
    const course: Course = {
      id: randomUUID(),
      instructorId,
      categoryId,
      title,
      slug,
      description,
      priceMinor,
      currency,
      level,
      status: 'DRAFT',
      thumbnailUrl,
      ratingAverage: 0,
      ratingCount: 0,
      enrollmentCount: 0,
      sections: [],
    };
    db.courses.set(course.id, course);
    return course;
  }

  public getCourseById(id: string): Course {
    const course = db.courses.get(id);
    if (!course) throw new Error('Course not found');
    return course;
  }

  public addSection(courseId: string, title: string, instructorUserId: string, role: Role): CourseSection {
    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    if (role !== 'ADMINISTRATOR' && course.instructorId !== instructorUserId) {
      throw new Error('Forbidden: You do not own this course');
    }

    const section: CourseSection = {
      id: randomUUID(),
      courseId,
      title,
      orderIndex: course.sections.length + 1,
      lessons: [],
    };

    course.sections.push(section);
    return section;
  }

  public addLesson(
    courseId: string,
    sectionId: string,
    title: string,
    content: string | undefined,
    videoMediaKey: string | undefined,
    durationSeconds: number,
    isPreview: boolean,
    instructorUserId: string,
    role: Role
  ): Lesson {
    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    if (role !== 'ADMINISTRATOR' && course.instructorId !== instructorUserId) {
      throw new Error('Forbidden: You do not own this course');
    }

    const section = course.sections.find(s => s.id === sectionId);
    if (!section) throw new Error('Section not found');

    const lesson: Lesson = {
      id: randomUUID(),
      sectionId,
      title,
      content,
      videoMediaKey,
      durationSeconds,
      isPreview,
      orderIndex: section.lessons.length + 1,
    };

    section.lessons.push(lesson);
    return lesson;
  }

  public listPublishedCourses(filters?: SearchFilters): Course[] {
    const all = Array.from(db.courses.values()).filter(c => c.status === 'PUBLISHED');
    if (!filters) return all;

    return all.filter(course => {
      if (filters.categoryId && course.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.categorySlug) {
        const cat = db.categories.get(course.categoryId);
        if (!cat || cat.slug !== filters.categorySlug) return false;
      }
      if (filters.level && course.level !== filters.level) {
        return false;
      }
      if (filters.minRating !== undefined && course.ratingAverage < filters.minRating) {
        return false;
      }
      if (filters.maxPriceMinor !== undefined && course.priceMinor > filters.maxPriceMinor) {
        return false;
      }
      if (filters.minPriceMinor !== undefined && course.priceMinor < filters.minPriceMinor) {
        return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const inTitle = course.title.toLowerCase().includes(q);
        const inDesc = course.description.toLowerCase().includes(q);
        const inSubtitle = course.subtitle?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inSubtitle) return false;
      }
      return true;
    });
  }

  public searchCourses(filters: SearchFilters): Course[] {
    return this.listPublishedCourses(filters);
  }
}

export const catalogService = new CatalogService();
