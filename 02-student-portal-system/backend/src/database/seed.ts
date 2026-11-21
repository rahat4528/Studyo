import { AuthService } from '../services/auth.service';
import { db } from './db';
import { Department, Program, Semester, Course, CourseSection, Student, Faculty, Guardian } from '../types';

export async function seedPortalDatabase() {
  db.clear();

  // 1. Seed Users
  const adminUser = await AuthService.register('registrar@studyo-portal.local', 'Password123!', 'Dean Arthur Hastings', 'ADMINISTRATOR');
  const facultyUser1 = await AuthService.register('faculty.turing@studyo-portal.local', 'Password123!', 'Dr. Alan Turing', 'FACULTY');
  const facultyUser2 = await AuthService.register('faculty.lovelace@studyo-portal.local', 'Password123!', 'Dr. Ada Lovelace', 'FACULTY');
  const studentUser1 = await AuthService.register('student.bell@studyo-portal.local', 'Password123!', 'Jordan Bell', 'STUDENT');
  const studentUser2 = await AuthService.register('student.reed@studyo-portal.local', 'Password123!', 'Morgan Reed', 'STUDENT');
  const guardianUser = await AuthService.register('guardian.bell@studyo-portal.local', 'Password123!', 'Sarah Bell', 'GUARDIAN');

  // 2. Department & Program
  const deptCSE: Department = { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering' };
  db.departments.set(deptCSE.id, deptCSE);

  const progSE: Program = { id: 'prog-se', departmentId: deptCSE.id, code: 'BSSE', name: 'Bachelor of Science in Software Engineering', totalCredits: 128.0 };
  db.programs.set(progSE.id, progSE);

  // 3. Faculty Profiles
  const faculty1: Faculty = { id: 'fac-1', userId: facultyUser1.user.id, employeeId: 'EMP-1001', departmentId: deptCSE.id };
  const faculty2: Faculty = { id: 'fac-2', userId: facultyUser2.user.id, employeeId: 'EMP-1002', departmentId: deptCSE.id };
  db.faculty.set(faculty1.id, faculty1);
  db.faculty.set(faculty2.id, faculty2);

  // 4. Student Profiles
  const student1: Student = { id: 'stu-1', userId: studentUser1.user.id, studentIdNumber: 'STU-2026-001', programId: progSE.id, status: 'ACTIVE' };
  const student2: Student = { id: 'stu-2', userId: studentUser2.user.id, studentIdNumber: 'STU-2026-002', programId: progSE.id, status: 'ACTIVE' };
  db.students.set(student1.id, student1);
  db.students.set(student2.id, student2);

  // 5. Guardian Profile
  const guardian: Guardian = { id: 'grd-1', userId: guardianUser.user.id, relationship: 'Mother' };
  db.guardians.set(guardian.id, guardian);

  // 6. Semester
  const now = new Date();
  const semester: Semester = {
    id: 'sem-fall-2026',
    name: 'Fall 2026',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-12-20T00:00:00.000Z',
    regStartDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    regEndDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  };
  db.semesters.set(semester.id, semester);

  // 7. Courses with Prerequisite Hierarchy: CS101 -> CS102
  const cs101: Course = { id: 'course-cs101', departmentId: deptCSE.id, code: 'CS101', title: 'Introduction to Programming', credits: 3.0 };
  const cs102: Course = { id: 'course-cs102', departmentId: deptCSE.id, code: 'CS102', title: 'Data Structures and Algorithms', credits: 4.0, prerequisiteId: cs101.id };
  const math201: Course = { id: 'course-math201', departmentId: deptCSE.id, code: 'MATH201', title: 'Discrete Mathematics', credits: 3.0 };
  db.courses.set(cs101.id, cs101);
  db.courses.set(cs102.id, cs102);
  db.courses.set(math201.id, math201);

  // 8. Course Sections with Schedules
  // CS101: Mon/Wed 09:00-10:30
  const secCS101: CourseSection = {
    id: 'sec-cs101-01',
    courseId: cs101.id,
    semesterId: semester.id,
    facultyId: faculty1.id,
    sectionCode: 'Section 01',
    capacity: 2, // low capacity for race condition testing
    enrolled: 0,
    schedules: [
      { id: 'sch-1', sectionId: 'sec-cs101-01', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:30', room: 'Hall A' },
      { id: 'sch-2', sectionId: 'sec-cs101-01', dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '10:30', room: 'Hall A' }
    ]
  };

  // MATH201: Same slot Mon 09:30-11:00 (Schedule conflict with CS101!)
  const secMathConflict: CourseSection = {
    id: 'sec-math-conflict',
    courseId: math201.id,
    semesterId: semester.id,
    facultyId: faculty2.id,
    sectionCode: 'Section 01',
    capacity: 30,
    enrolled: 0,
    schedules: [
      { id: 'sch-3', sectionId: 'sec-math-conflict', dayOfWeek: 'MONDAY', startTime: '09:30', endTime: '11:00', room: 'Room 204' }
    ]
  };

  // CS102: Tue/Thu 14:00-15:30 (Requires CS101 passing grade)
  const secCS102: CourseSection = {
    id: 'sec-cs102-01',
    courseId: cs102.id,
    semesterId: semester.id,
    facultyId: faculty1.id,
    sectionCode: 'Section 01',
    capacity: 30,
    enrolled: 0,
    schedules: [
      { id: 'sch-4', sectionId: 'sec-cs102-01', dayOfWeek: 'TUESDAY', startTime: '14:00', endTime: '15:30', room: 'Lab 3' }
    ]
  };

  db.sections.set(secCS101.id, secCS101);
  db.sections.set(secMathConflict.id, secMathConflict);
  db.sections.set(secCS102.id, secCS102);

  return {
    users: { adminUser, facultyUser1, facultyUser2, studentUser1, studentUser2, guardianUser },
    students: { student1, student2 },
    faculty: { faculty1, faculty2 },
    guardian,
    semester,
    courses: { cs101, cs102, math201 },
    sections: { secCS101, secMathConflict, secCS102 }
  };
}
