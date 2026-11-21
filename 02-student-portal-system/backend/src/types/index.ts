export type Role = 'STUDENT' | 'FACULTY' | 'ADMINISTRATOR' | 'GUARDIAN';

export type EnrollmentStatus = 'REQUESTED' | 'ENROLLED' | 'DROPPED' | 'WITHDRAWN' | 'COMPLETED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type ExamResultStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';

export type HoldType = 'FINANCIAL_HOLD' | 'ACADEMIC_SUSPENSION' | 'DISCIPLINARY' | 'REGISTRATION_BLOCK';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface Program {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  totalCredits: number;
}

export interface Student {
  id: string;
  userId: string;
  studentIdNumber: string;
  programId: string;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED';
}

export interface Faculty {
  id: string;
  userId: string;
  employeeId: string;
  departmentId: string;
}

export interface Guardian {
  id: string;
  userId: string;
  relationship: string;
}

export interface GuardianLink {
  id: string;
  guardianId: string;
  studentId: string;
  isApproved: boolean;
  approvedAt?: string;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regStartDate: string;
  regEndDate: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  departmentId: string;
  code: string;
  title: string;
  credits: number;
  prerequisiteId?: string;
}

export interface ClassSchedule {
  id: string;
  sectionId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  room: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  semesterId: string;
  facultyId: string;
  sectionCode: string;
  capacity: number;
  enrolled: number;
  schedules: ClassSchedule[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  sectionId: string;
  semesterId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface Attendance {
  id: string;
  sectionId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedById: string;
  markedAt: string;
}

export interface Examination {
  id: string;
  sectionId: string;
  semesterId: string;
  name: string;
  maxMarks: number;
  weight: number;
  status: ExamResultStatus;
}

export interface Grade {
  id: string;
  examinationId: string;
  studentId: string;
  rawMarks: number;
  letter: string;
  gradePoints: number;
  isRepeat: boolean;
  updatedAt: string;
}

export interface Transcript {
  id: string;
  studentId: string;
  verificationCode: string;
  gpa: number;
  cgpa: number;
  totalCreditsEarned: number;
  isSealed: boolean;
  issuedAt: string;
}

export interface StudentFee {
  id: string;
  studentId: string;
  semesterId: string;
  feeName: string;
  amountDue: number;
  amountPaid: number;
  isCleared: boolean;
}

export interface PaymentRecord {
  id: string;
  studentFeeId: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  isReversal: boolean;
  reversalReason?: string;
  createdAt: string;
}

export interface Hold {
  id: string;
  studentId: string;
  type: HoldType;
  reason: string;
  isActive: boolean;
  placedAt: string;
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  reviewedById?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
