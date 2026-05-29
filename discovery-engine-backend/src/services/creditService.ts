/**
 * ============================================================================
 * DISCOVERY ENGINE - Credit Service
 * ============================================================================
 * Manages credit deduction for AI-powered blueprint generation steps.
 *
 * In production, this should integrate with your database (PostgreSQL, MongoDB)
 * and potentially a payment gateway (Stripe, Razorpay) for credit top-ups.
 * ============================================================================
 */

import { CreditDeductions } from '../types';
import { dummyUser, creditDeductions as defaultDeductions } from '../data/dummyData';

class CreditService {
  // Singleton pattern
  private static instance: CreditService;

  // In-memory store for demo purposes
  // TODO: Replace with database calls (PostgreSQL / MongoDB / Redis)
  private userCredits: Map<string, number> = new Map();

  private deductions: CreditDeductions = { ...defaultDeductions };

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  constructor() {
    // Initialize demo user with credits
    this.userCredits.set(dummyUser.id, dummyUser.credits);
  }

  /**
   * Get the credit cost for a specific action.
   */
  getCost(action: keyof CreditDeductions): number {
    return this.deductions[action] || 0;
  }

  /**
   * Get all available credit deduction rules.
   */
  getAllDeductions(): CreditDeductions {
    return { ...this.deductions };
  }

  /**
   * Get the current credit balance for a user.
   *
   * TODO: Replace with database query:
   * ```typescript
   * const user = await db.users.findById(userId);
   * return user.credits;
   * ```
   */
  async getBalance(userId: string): Promise<number> {
    const balance = this.userCredits.get(userId);
    if (balance === undefined) {
      // New user — initialize with default credits
      // TODO: Set default based on user's plan (free trial, paid, etc.)
      this.userCredits.set(userId, 100);
      return 100;
    }
    return balance;
  }

  /**
   * Deduct credits from a user's balance for a specific action.
   *
   * TODO: Replace with database update:
   * ```typescript
   * await db.users.updateOne(
   *   { _id: userId },
   *   { $inc: { credits: -amount } }
   * );
   * ```
   */
  async deductCredits(
    userId: string,
    action: keyof CreditDeductions
  ): Promise<{ deducted: number; remaining: number }> {
    const amount = this.deductions[action];
    const currentBalance = await this.getBalance(userId);

    if (currentBalance < amount) {
      throw new Error(
        `Insufficient credits. Required: ${amount}, Available: ${currentBalance}. Please top up your credits.`
      );
    }

    const newBalance = currentBalance - amount;
    this.userCredits.set(userId, newBalance);

    console.log(`[Credits] Deducted ${amount} credits from user ${userId} for "${action}"`);
    console.log(`[Credits] New balance: ${newBalance}`);

    // TODO: Persist transaction to database
    // await db.creditTransactions.create({ userId, action, amount, type: 'deduct', createdAt: new Date() });

    return { deducted: amount, remaining: newBalance };
  }

  /**
   * Add credits to a user's balance (e.g., after payment).
   *
   * TODO: Integrate with payment webhook (Stripe / Razorpay)
   */
  async addCredits(userId: string, amount: number): Promise<number> {
    const currentBalance = await this.getBalance(userId);
    const newBalance = currentBalance + amount;
    this.userCredits.set(userId, newBalance);

    console.log(`[Credits] Added ${amount} credits to user ${userId}`);
    console.log(`[Credits] New balance: ${newBalance}`);

    // TODO: Persist transaction to database
    // await db.creditTransactions.create({ userId, amount, type: 'add', source: 'purchase', createdAt: new Date() });

    return newBalance;
  }

  /**
   * Check if a user has sufficient credits for an action.
   */
  async hasEnoughCredits(
    userId: string,
    action: keyof CreditDeductions
  ): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= this.deductions[action];
  }

  /**
   * Get a summary of credits for a user (balance + all deduction costs).
   */
  async getCreditSummary(userId: string): Promise<{
    balance: number;
    deductions: CreditDeductions;
    canAfford: Record<keyof CreditDeductions, boolean>;
  }> {
    const balance = await this.getBalance(userId);
    const canAfford = {
      niche: balance >= this.deductions.niche,
      audience: balance >= this.deductions.audience,
      program: balance >= this.deductions.program,
      pricing: balance >= this.deductions.pricing,
      curriculum: balance >= this.deductions.curriculum,
      roadmap: balance >= this.deductions.roadmap,
    };

    return {
      balance,
      deductions: { ...this.deductions },
      canAfford,
    };
  }
}

export const creditService = CreditService.getInstance();
