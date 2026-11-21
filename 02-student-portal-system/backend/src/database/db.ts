import {
  User, Student, Faculty, Guardian, GuardianLink, Department, Program, Semester,
  Course, CourseSection, Enrollment, Attendance, Examination, Grade, Transcript,
  StudentFee, PaymentRecord, Hold, LeaveApplication, AuditLog
} from '../types';

export class PortalDatabase {
  public users: Map<string, User> = new Map();
  public students: Map<string, Student> = new Map();
  public faculty: Map<string, Faculty> = new Map();
  public guardians: Map<string, Guardian> = new Map();
  public guardianLinks: Map<string, GuardianLink> = new Map();
  public departments: Map<string, Department> = new Map();
  public programs: Map<string, Program> = new Map();
  public semesters: Map<string, Semester> = new Map();
  public courses: Map<string, Course> = new Map();
  public sections: Map<string, CourseSection> = new Map();
  public enrollments: Map<string, Enrollment> = new Map();
  public attendances: Map<string, Attendance> = new Map();
  public examinations: Map<string, Examination> = new Map();
  public grades: Map<string, Grade> = new Map();
  public transcripts: Map<string, Transcript> = new Map();
  public studentFees: Map<string, StudentFee> = new Map();
  public payments: Map<string, PaymentRecord> = new Map();
  public holds: Map<string, Hold> = new Map();
  public leaveApplications: Map<string, LeaveApplication> = new Map();
  public auditLogs: Map<string, AuditLog> = new Map();

  private static instance: PortalDatabase;

  public static getInstance(): PortalDatabase {
    if (!PortalDatabase.instance) {
      PortalDatabase.instance = new PortalDatabase();
    }
    return PortalDatabase.instance;
  }

  public clear(): void {
    this.users.clear();
    this.students.clear();
    this.faculty.clear();
    this.guardians.clear();
    this.guardianLinks.clear();
    this.departments.clear();
    this.programs.clear();
    this.semesters.clear();
    this.courses.clear();
    this.sections.clear();
    this.enrollments.clear();
    this.attendances.clear();
    this.examinations.clear();
    this.grades.clear();
    this.transcripts.clear();
    this.studentFees.clear();
    this.payments.clear();
    this.holds.clear();
    this.leaveApplications.clear();
    this.auditLogs.clear();
  }
}

export const db = PortalDatabase.getInstance();
