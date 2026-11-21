import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { GuardianLink } from '../types';

export class GuardianService {
  public static requestGuardianLink(guardianId: string, studentId: string): GuardianLink {
    const student = db.students.get(studentId);
    if (!student) {
      throw new Error('Target student record not found');
    }

    const guardian = db.guardians.get(guardianId);
    if (!guardian) {
      throw new Error('Guardian profile not found');
    }

    // Check existing
    for (const link of db.guardianLinks.values()) {
      if (link.guardianId === guardianId && link.studentId === studentId) {
        return link;
      }
    }

    const link: GuardianLink = {
      id: uuidv4(),
      guardianId,
      studentId,
      isApproved: false
    };

    db.guardianLinks.set(link.id, link);
    return link;
  }

  public static approveGuardianLink(linkId: string, adminId: string): GuardianLink {
    const link = db.guardianLinks.get(linkId);
    if (!link) {
      throw new Error('Guardian link not found');
    }

    link.isApproved = true;
    link.approvedAt = new Date().toISOString();
    db.guardianLinks.set(link.id, link);
    return link;
  }

  public static canGuardianAccessStudent(guardianId: string, studentId: string): boolean {
    for (const link of db.guardianLinks.values()) {
      if (link.guardianId === guardianId && link.studentId === studentId && link.isApproved) {
        return true;
      }
    }
    return false;
  }
}
