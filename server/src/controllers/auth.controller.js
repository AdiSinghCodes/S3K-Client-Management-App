import { getUserByEmail, createUser } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';

// Login user
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role, user.name);

    // Return user data with token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Register user (create new user)
export async function register(req, res) {
  try {
    const { name, email, password, role = 'team' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await createUser(name, email, hashedPassword, role);

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.role);

    // Return user data with token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Get current user info
export async function getCurrentUser(req, res) {
  try {
    // User is already attached by auth middleware
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No user found'
      });
    }

    // Get user from database
    const { getUserById } = await import('../models/user.model.js');
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// Logout (frontend removes token)
export function logout(req, res) {
  try {
    res.json({
      message: 'Logout successful. Please remove the token from client side.'
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
