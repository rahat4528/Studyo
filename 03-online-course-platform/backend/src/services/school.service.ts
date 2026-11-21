import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { School, SchoolMember, SchoolRole, LandingPage } from '../types';

export class SchoolService {
  /**
   * Sanitizes input strings against XSS attacks
   */
  public static sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onerror\s*=/gi, '');
  }

  public static createSchool(
    ownerId: string,
    slug: string,
    name: string,
    theme?: Partial<School['theme']>,
    landingPage?: Partial<LandingPage>
  ): School {
    const cleanSlug = slug.trim().toLowerCase();
    for (const s of db.schools.values()) {
      if (s.slug === cleanSlug) {
        throw new Error('School with this slug already exists');
      }
    }

    const school: School = {
      id: uuidv4(),
      slug: cleanSlug,
      name: this.sanitizeString(name),
      ownerId,
      theme: {
        primaryColor: theme?.primaryColor || '#4f46e5',
        accentColor: theme?.accentColor || '#06b6d4',
        logoUrl: theme?.logoUrl,
        bannerUrl: theme?.bannerUrl
      },
      landingPage: {
        heroTitle: this.sanitizeString(landingPage?.heroTitle || `Welcome to ${name}`),
        heroSubtitle: this.sanitizeString(landingPage?.heroSubtitle || 'Transform your skills with practical creator-led courses.'),
        blocks: landingPage?.blocks || []
      },
      createdAt: new Date().toISOString()
    };

    db.schools.set(school.id, school);

    // Register owner membership
    const membership: SchoolMember = {
      id: uuidv4(),
      schoolId: school.id,
      userId: ownerId,
      role: 'OWNER',
      joinedAt: new Date().toISOString()
    };
    db.members.set(`${school.id}:${ownerId}`, membership);

    return school;
  }

  public static getSchoolBySlug(slug: string): School {
    const cleanSlug = slug.trim().toLowerCase();
    for (const s of db.schools.values()) {
      if (s.slug === cleanSlug) {
        return s;
      }
    }
    throw new Error('School not found');
  }

  public static addMember(schoolId: string, userId: string, role: SchoolRole): SchoolMember {
    const key = `${schoolId}:${userId}`;
    const member: SchoolMember = {
      id: uuidv4(),
      schoolId,
      userId,
      role,
      joinedAt: new Date().toISOString()
    };
    db.members.set(key, member);
    return member;
  }

  public static getMemberRole(schoolId: string, userId: string): SchoolRole | null {
    const member = db.members.get(`${schoolId}:${userId}`);
    return member ? member.role : null;
  }
}
