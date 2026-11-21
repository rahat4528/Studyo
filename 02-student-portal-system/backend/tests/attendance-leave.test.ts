import { seedPortalDatabase } from '../src/database/seed';
import { AcademicService } from '../src/services/academic.service';
import { db } from '../src/database/db';
import { LeaveApplication } from '../src/types';

describe('Attendance Entry & Leave Synchronizer Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedPortalDatabase();
  });

  it('should allow assigned faculty to enter attendance and block unauthorized faculty', () => {
    const sec = seeded.sections.secCS101; // assigned to faculty1
    const fac1 = seeded.faculty.faculty1;
    const fac2 = seeded.faculty.faculty2;
    const student = seeded.students.student1;

    const today = new Date().toISOString().split('T')[0];

    // Faculty 1: assigned -> succeeds
    const saved = AcademicService.recordAttendance(fac1.id, sec.id, today, [
      { studentId: student.id, status: 'PRESENT' }
    ]);
    expect(saved.length).toBe(1);
    expect(saved[0].status).toBe('PRESENT');

    // Faculty 2: unauthorized -> throws
    expect(() => {
      AcademicService.recordAttendance(fac2.id, sec.id, today, [
        { studentId: student.id, status: 'ABSENT' }
      ]);
    }).toThrow(/Unauthorized: You are not assigned to instruct this section/);
  });

  it('should reject attendance entry past the 72-hour edit window', () => {
    const sec = seeded.sections.secCS101;
    const fac1 = seeded.faculty.faculty1;
    const student = seeded.students.student1;

    // 5 days ago (120 hours)
    const oldDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    expect(() => {
      AcademicService.recordAttendance(fac1.id, sec.id, oldDate, [
        { studentId: student.id, status: 'PRESENT' }
      ]);
    }).toThrow(/Attendance edit window expired/);
  });

  it('should automatically mark sessions as EXCUSED when leave application is approved', () => {
    const sec = seeded.sections.secCS101;
    const fac1 = seeded.faculty.faculty1;
    const student = seeded.students.student1;

    const day1 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // yesterday
    const day2 = new Date().toISOString().split('T')[0]; // today

    // 1. Enter initial ABSENT attendance for day1 & day2
    AcademicService.recordAttendance(fac1.id, sec.id, day1, [
      { studentId: student.id, status: 'ABSENT' }
    ]);
    AcademicService.recordAttendance(fac1.id, sec.id, day2, [
      { studentId: student.id, status: 'ABSENT' }
    ]);

    // 2. Student submits medical leave application covering day1 and day2
    const leaveApp: LeaveApplication = {
      id: 'leave-101',
      studentId: student.id,
      startDate: day1,
      endDate: day2,
      reason: 'Medical recovery following emergency dental procedure',
      status: 'PENDING'
    };
    db.leaveApplications.set(leaveApp.id, leaveApp);

    // 3. Faculty/Advisor reviews and approves leave
    AcademicService.reviewLeaveApplication(leaveApp.id, fac1.id, 'APPROVED');

    // 4. Verify attendances are now EXCUSED
    const att1 = db.attendances.get(`${sec.id}:${student.id}:${day1}`)!;
    const att2 = db.attendances.get(`${sec.id}:${student.id}:${day2}`)!;

    expect(att1.status).toBe('EXCUSED');
    expect(att2.status).toBe('EXCUSED');
  });
});
