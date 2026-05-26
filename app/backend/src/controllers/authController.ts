/**
 * ============================================================================
 * DISCOVERY ENGINE - Auth Controller
 * ============================================================================
 * Handles user authentication:
 *   - POST /api/auth/register  → Register new user
 *   - POST /api/auth/login     → Login existing user
 *
 * TODO: Replace with real authentication:
 *   - Use bcrypt for password hashing
 *   - Use JWT for token generation
 *   - Add email verification
 *   - Add OAuth (Google, LinkedIn) support
 *   - Add password reset flow
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { dummyUser, mockToken } from '../data/dummyData';
import { User } from '../types';

// In-memory user store for demo
const userStore = new Map<string, User>();
userStore.set(dummyUser.id, { ...dummyUser });

/**
 * POST /api/auth/register
 * Request: { name: string, email: string, password: string }
 * Response: { user: User, token: string }
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    console.log(`[Auth] POST /api/auth/register — email="${email}"`);

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
      return;
    }

    // Check if user already exists
    // TODO: Replace with database query: await db.users.findOne({ email })
    const existingUser = Array.from(userStore.values()).find(
      (u) => u.email === email
    );
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
      return;
    }

    // TODO: Hash password with bcrypt
    // const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    // TODO: Replace with database insert
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
      credits: 50, // Starter credits for new users
      language: 'english',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userStore.set(newUser.id, newUser);
    console.log(`[Auth] New user registered: ${newUser.id} (${email})`);

    // TODO: Generate real JWT token
    // const token = jwt.sign({ userId: newUser.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token: mockToken,
      },
      message: 'Registration successful! Welcome to Discovery Engine.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Request: { email: string, password: string }
 * Response: { user: User, token: string }
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth] POST /api/auth/login — email="${email}"`);

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    // Find user by email
    // TODO: Replace with database query
    const user = Array.from(userStore.values()).find((u) => u.email === email);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // TODO: Verify password with bcrypt
    // const isValid = await bcrypt.compare(password, user.passwordHash);
    // if (!isValid) { return 401 ... }

    console.log(`[Auth] User logged in: ${user.id} (${email})`);

    // TODO: Generate real JWT token
    // const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      data: {
        user,
        token: mockToken,
      },
      message: 'Login successful!',
    });
  } catch (error) {
    next(error);
  }
};
