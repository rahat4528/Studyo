import { seedPortalDatabase } from '../src/database/seed';
import { FinanceService } from '../src/services/finance.service';
import { db } from '../src/database/db';

describe('Append-Only Financial Ledger & Clearance Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedPortalDatabase();
  });

  it('should calculate running balance and support partial payments', () => {
    const student = seeded.students.student1;

    // 1. Tuition charge: $3,000
    const fee = FinanceService.createFeeCharge(student.id, seeded.semester.id, 'Tuition Fall 2026', 3000.0);
    expect(fee.amountDue).toBe(3000.0);
    expect(fee.isCleared).toBe(false);

    // 2. Partial payment: $1,000
    FinanceService.recordPayment(fee.id, student.id, 1000.0, 'BANK_TRANSFER');
    let summary = FinanceService.getStudentFinancialSummary(student.id);
    expect(summary.totalPaid).toBe(1000.0);
    expect(summary.balance).toBe(2000.0);
    expect(summary.isCleared).toBe(false);

    // 3. Final payment: $2,000
    FinanceService.recordPayment(fee.id, student.id, 2000.0, 'ONLINE_MOCK');
    summary = FinanceService.getStudentFinancialSummary(student.id);
    expect(summary.totalPaid).toBe(3000.0);
    expect(summary.balance).toBe(0.0);
    expect(summary.isCleared).toBe(true);
    expect(FinanceService.isStudentFinanciallyCleared(student.id)).toBe(true);
  });

  it('should record explicit reversing entries for payment corrections without deleting ledger history', () => {
    const student = seeded.students.student1;
    const fee = FinanceService.createFeeCharge(student.id, seeded.semester.id, 'Lab Fee', 500.0);

    // Payment made
    const payment = FinanceService.recordPayment(fee.id, student.id, 500.0, 'BANK_TRANSFER');
    expect(FinanceService.isStudentFinanciallyCleared(student.id)).toBe(true);

    // Bank transfer bounces / incorrect payment reversed
    const reversal = FinanceService.recordReversal(payment.id, 'Bank transfer NSF returned check');
    expect(reversal.amount).toBe(-500.0);
    expect(reversal.isReversal).toBe(true);

    // Verify ledger contains both records (append-only)
    const summary = FinanceService.getStudentFinancialSummary(student.id);
    expect(summary.payments.length).toBe(2);
    expect(summary.balance).toBe(500.0);
    expect(summary.isCleared).toBe(false);
    expect(FinanceService.isStudentFinanciallyCleared(student.id)).toBe(false);
  });
});
