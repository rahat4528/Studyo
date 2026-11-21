import { seedPortalDatabase } from '../src/database/seed';
import { GuardianService } from '../src/services/guardian.service';
import { AcademicService } from '../src/services/academic.service';
import { FinanceService } from '../src/services/finance.service';
import { db } from '../src/database/db';
import { Examination, Grade } from '../src/types';

describe('Role Matrix & Guardian Access Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedPortalDatabase();
  });

  it('should prevent cross-student record disclosure', () => {
    const student1 = seeded.students.student1;
    const student2 = seeded.students.student2;

    FinanceService.createFeeCharge(student2.id, seeded.semester.id, 'Private Fee', 400.0);

    // Student 1 financial query for student 2 should be segregated
    const s1Summary = FinanceService.getStudentFinancialSummary(student1.id);
    const s2Summary = FinanceService.getStudentFinancialSummary(student2.id);

    expect(s1Summary.totalDue).toBe(0.0);
    expect(s2Summary.totalDue).toBe(400.0);
  });

  it('should enforce administrator approval before guardian can access student records', () => {
    const guardian = seeded.guardian;
    const student = seeded.students.student1;
    const admin = seeded.users.adminUser.user;

    // 1. Guardian requests link
    const link = GuardianService.requestGuardianLink(guardian.id, student.id);
    expect(link.isApproved).toBe(false);

    // Check access before approval
    expect(GuardianService.canGuardianAccessStudent(guardian.id, student.id)).toBe(false);

    // 2. Administrator reviews and approves link
    GuardianService.approveGuardianLink(link.id, admin.id);

    // Check access after approval
    expect(GuardianService.canGuardianAccessStudent(guardian.id, student.id)).toBe(true);
  });
});
