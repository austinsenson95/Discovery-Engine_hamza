/**
 * ============================================================================
 * DISCOVERY ENGINE - Auth Controller
 * ============================================================================
 * Handles user authentication:
 *   - POST /api/auth/register  → Register new user
 *   - POST /api/auth/login     → Login existing user
 *   - POST /api/auth/forgot-password → Request password reset
 *   - POST /api/auth/reset-password  → Reset password with token
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import type { User } from '../types';
import { hashPassword, comparePassword, generateToken, generateResetToken } from '../lib/auth';
import { getUserByEmail, getUserById, createUser, updatePasswordHash, updateUser } from '../db/userRepository';
import { createResetToken, findValidToken, markTokenUsed } from '../db/passwordResetRepository';
import { sendPasswordResetEmail } from '../services/emailService';
import { config } from '../config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripPasswordHash(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    console.log(`[Auth] POST /api/auth/register — email="${email}"`);

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
      credits: 100,
      language: 'english',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createUser(newUser);
    console.log(`[Auth] New user registered: ${newUser.id} (${email})`);

    // Generate JWT
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      data: {
        user: stripPasswordHash(newUser),
        token,
      },
      message: 'Registration successful! Welcome to Discovery Engine.',
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

// Dev mode credentials
const DEV_EMAIL = 'dev';
const DEV_PASSWORD = 'password';
const DEV_CREDITS = 100;

async function ensureDevUser(): Promise<User & { passwordHash: string }> {
  let user = await getUserByEmail(DEV_EMAIL);
  if (!user) {
    const devUser: User & { passwordHash: string } = {
      id: `usr_dev_${Date.now()}`,
      name: 'Developer',
      email: DEV_EMAIL,
      passwordHash: await hashPassword(DEV_PASSWORD),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Developer',
      credits: DEV_CREDITS,
      language: 'english',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await createUser(devUser);
    console.log(`[Auth] Created dev user: ${devUser.id}`);
    user = devUser;
  }
  return user as User & { passwordHash: string };
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth] POST /api/auth/login — email="${email}"`);

    let user: User | undefined;
    let isDevMode = false;

    // Dev mode: special credentials
    if (email === DEV_EMAIL && password === DEV_PASSWORD) {
      isDevMode = true;
      user = await ensureDevUser();
      // Reset dev credits on every login
      await updateUser(user.id, { credits: DEV_CREDITS });
      user = await getUserById(user.id);
      console.log(`[Auth] Dev login: ${user?.id} — credits set to ${DEV_CREDITS}`);
    } else {
      // Regular login
      user = await getUserByEmail(email);

      if (!user || !user.passwordHash) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      // Verify password
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      console.log(`[Auth] User logged in: ${user.id} (${email})`);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        user: { ...stripPasswordHash(user), isDev: isDevMode },
        token,
      },
      message: 'Login successful!',
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    console.log(`[Auth] POST /api/auth/forgot-password — email="${email}"`);

    const user = await getUserByEmail(email);

    if (user) {
      const { raw, hash } = generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await createResetToken(user.id, hash, expiresAt);

      const resetUrl = `${config.frontendUrl}/reset-password?token=${raw}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    // Always return the same message to prevent user enumeration
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    console.log(`[Auth] POST /api/auth/reset-password`);

    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const resetRecord = await findValidToken(tokenHash);

    if (!resetRecord) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      });
      return;
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(password);
    await updatePasswordHash(resetRecord.userId, passwordHash);

    // Mark token as used
    await markTokenUsed(resetRecord.id);

    console.log(`[Auth] Password reset complete for user: ${resetRecord.userId}`);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
