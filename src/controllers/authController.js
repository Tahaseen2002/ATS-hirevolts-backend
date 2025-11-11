import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const RESET_TOKEN_EXPIRES_IN = '1h';

// Sign up
export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'recruiter'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Send welcome email (optional, non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(err => 
      console.log('Welcome email failed:', err.message)
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
}

// Sign in
export async function signin(req, res) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}

// Get current user
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
}

// Forgot password - generate reset token
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate reset token (6-digit code)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email with reset code
    const emailResult = await sendPasswordResetEmail(
      user.email, 
      resetToken, 
      user.name
    );

    // Log to console for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n' + '='.repeat(60));
      console.log('PASSWORD RESET REQUEST');
      console.log('Email:', email);
      console.log('Reset Code:', resetToken);
      console.log('Expires:', new Date(resetTokenExpiry).toLocaleString());
      console.log('Email Sent:', emailResult.success ? '✅ Yes' : '❌ No');
      console.log('='.repeat(60) + '\n');
    }

    // Response
    const response = {
      message: emailResult.success 
        ? 'Password reset code sent to your email'
        : 'Reset code generated. Check console (email service not configured)',
      email: user.email
    };

    // In development, include the token if email failed
    if (process.env.NODE_ENV !== 'production' && !emailResult.success) {
      response.resetToken = resetToken;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
}

// Verify reset token
export async function verifyResetToken(req, res) {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    res.json({ message: 'Reset code verified successfully', valid: true });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying code', error: error.message });
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
}
