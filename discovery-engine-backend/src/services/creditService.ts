/**
 * ============================================================================
 * DISCOVERY ENGINE - Credit Service
 * ============================================================================
 * Manages credit deduction for AI-powered blueprint generation steps.
 *
 * Uses PostgreSQL via creditRepository for persistence.
 * ============================================================================
 */

import { CreditDeductions } from '../types';
import { dummyUser, creditDeductions as defaultDeductions } from '../data/dummyData';
import {
  getTransactionsByUser,
  addTransaction,
  getBalance,
  updateBalance,
} from '../db/creditRepository';
import { seedDummyUserIfNeeded } from '../db/userRepository';

class CreditService {
  private static instance: CreditService;
  private deductions: CreditDeductions = { ...defaultDeductions };

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  getCost(action: keyof CreditDeductions): number {
    return this.deductions[action] || 0;
  }

  getAllDeductions(): CreditDeductions {
    return { ...this.deductions };
  }

  async getBalance(userId: string): Promise<number> {
    const balance = await getBalance(userId);
    if (balance === undefined) {
      // New user — seed and return default
      await seedDummyUserIfNeeded();
      return 100;
    }
    return balance;
  }

  async deductCredits(
    userId: string,
    action: keyof CreditDeductions,
    blueprintId?: string
  ): Promise<{ deducted: number; remaining: number }> {
    const amount = this.deductions[action];
    const currentBalance = await this.getBalance(userId);

    if (currentBalance < amount) {
      throw new Error(
        `Insufficient credits. Required: ${amount}, Available: ${currentBalance}. Please top up your credits.`
      );
    }

    const newBalance = currentBalance - amount;
    await updateBalance(userId, newBalance);

    // Record transaction
    await addTransaction({
      userId,
      blueprintId,
      action,
      amount: -amount,
      balanceAfter: newBalance,
      description: `Deducted ${amount} credits for ${action}`,
      createdAt: new Date(),
    });

    console.log(`[Credits] Deducted ${amount} credits from user ${userId} for "${action}"`);
    console.log(`[Credits] New balance: ${newBalance}`);

    return { deducted: amount, remaining: newBalance };
  }

  async addCredits(userId: string, amount: number): Promise<number> {
    const currentBalance = await this.getBalance(userId);
    const newBalance = currentBalance + amount;
    await updateBalance(userId, newBalance);

    await addTransaction({
      userId,
      action: 'purchase',
      amount,
      balanceAfter: newBalance,
      description: `Added ${amount} credits`,
      createdAt: new Date(),
    });

    console.log(`[Credits] Added ${amount} credits to user ${userId}`);
    console.log(`[Credits] New balance: ${newBalance}`);

    return newBalance;
  }

  async hasEnoughCredits(
    userId: string,
    action: keyof CreditDeductions
  ): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= this.deductions[action];
  }

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
      problems: balance >= this.deductions.problems,
      curriculum: balance >= this.deductions.curriculum,
      roadmap: balance >= this.deductions.roadmap,
      quiz: balance >= this.deductions.quiz,
    };

    return {
      balance,
      deductions: { ...this.deductions },
      canAfford,
    };
  }

  async getTransactionHistory(userId: string, limit = 50) {
    return getTransactionsByUser(userId, limit);
  }
}

export const creditService = CreditService.getInstance();
