import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { StudentFee, PaymentRecord } from '../types';

export class FinanceService {
  /**
   * Creates an institutional fee charge for a student
   */
  public static createFeeCharge(
    studentId: string,
    semesterId: string,
    feeName: string,
    amountDue: number
  ): StudentFee {
    const fee: StudentFee = {
      id: uuidv4(),
      studentId,
      semesterId,
      feeName,
      amountDue: Math.round(amountDue * 100) / 100,
      amountPaid: 0.0,
      isCleared: false
    };

    db.studentFees.set(fee.id, fee);
    return fee;
  }

  /**
   * Appends an immutable payment record to the ledger
   */
  public static recordPayment(
    studentFeeId: string,
    studentId: string,
    amount: number,
    paymentMethod: string = 'ONLINE_MOCK'
  ): PaymentRecord {
    const fee = db.studentFees.get(studentFeeId);
    if (!fee) {
      throw new Error('Student fee record not found');
    }

    if (fee.studentId !== studentId) {
      throw new Error('Payment account mismatch');
    }

    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const payment: PaymentRecord = {
      id: uuidv4(),
      studentFeeId,
      studentId,
      amount: Math.round(amount * 100) / 100,
      paymentMethod,
      isReversal: false,
      createdAt: new Date().toISOString()
    };

    db.payments.set(payment.id, payment);

    // Update fee running balance
    fee.amountPaid = Math.round((fee.amountPaid + payment.amount) * 100) / 100;
    fee.isCleared = fee.amountPaid >= fee.amountDue;
    db.studentFees.set(fee.id, fee);

    return payment;
  }

  /**
   * Appends an explicit reversing entry in the append-only ledger for corrections
   */
  public static recordReversal(
    paymentId: string,
    reversalReason: string
  ): PaymentRecord {
    const originalPayment = db.payments.get(paymentId);
    if (!originalPayment) {
      throw new Error('Original payment record not found');
    }

    if (originalPayment.isReversal) {
      throw new Error('Cannot reverse an existing reversal entry');
    }

    const fee = db.studentFees.get(originalPayment.studentFeeId);
    if (!fee) {
      throw new Error('Associated student fee not found');
    }

    const reversal: PaymentRecord = {
      id: uuidv4(),
      studentFeeId: fee.id,
      studentId: originalPayment.studentId,
      amount: -originalPayment.amount, // Negated amount
      paymentMethod: originalPayment.paymentMethod,
      isReversal: true,
      reversalReason,
      createdAt: new Date().toISOString()
    };

    db.payments.set(reversal.id, reversal);

    // Adjust fee balance
    fee.amountPaid = Math.max(0, Math.round((fee.amountPaid - originalPayment.amount) * 100) / 100);
    fee.isCleared = fee.amountPaid >= fee.amountDue;
    db.studentFees.set(fee.id, fee);

    return reversal;
  }

  /**
   * Verifies if a student has any outstanding uncleared fee balances
   */
  public static isStudentFinanciallyCleared(studentId: string): boolean {
    for (const fee of db.studentFees.values()) {
      if (fee.studentId === studentId && !fee.isCleared) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets fee summary and ledger for a student
   */
  public static getStudentFinancialSummary(studentId: string): {
    totalDue: number;
    totalPaid: number;
    balance: number;
    isCleared: boolean;
    fees: StudentFee[];
    payments: PaymentRecord[];
  } {
    let totalDue = 0;
    let totalPaid = 0;
    const fees: StudentFee[] = [];
    const payments: PaymentRecord[] = [];

    for (const f of db.studentFees.values()) {
      if (f.studentId === studentId) {
        fees.push(f);
        totalDue += f.amountDue;
        totalPaid += f.amountPaid;
      }
    }

    for (const p of db.payments.values()) {
      if (p.studentId === studentId) {
        payments.push(p);
      }
    }

    const balance = Math.max(0, Math.round((totalDue - totalPaid) * 100) / 100);
    return {
      totalDue: Math.round(totalDue * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      balance,
      isCleared: balance === 0,
      fees,
      payments
    };
  }
}
