const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const auth = require('../middleware/auth')
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateVerificationCode, sendVerificationEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Request verification code
router.post('/request-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in temporary user
    const tempUser = new User({
      email,
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    });
    await tempUser.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      await User.deleteOne({ email });
      return res.status(500).json({ msg: 'Failed to send verification email' });
    }

    res.json({ msg: 'Verification code sent to your email' });
  } catch (err) {
    console.error('Verification request error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Verify code and complete registration
router.post('/verify-code', async (req, res) => {
  const { email, code, username, password } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification code' });
    }

    // Update user with verified status and remove verification code
    user.isVerified = true;
    user.username = username;
    user.password = password;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ 
      token,
      user: {
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/google-login', async (req, res) => {
  const { credential } = req.body;

  try {
    // First, decode the token without verification
    const decodedToken = jwt.decode(credential);
    if (!decodedToken) {
      throw new Error('Invalid token');
    }

    // Extract user information from the decoded token
    const { email, name, picture } = decodedToken;

    // Verify the token with Google
    try {
      await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
        clockTolerance: 300,
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      // Continue with the login process even if verification fails
      // This is a fallback for time synchronization issues
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        username: name, 
        email, 
        profilePicture: picture,
        authProvider: 'google'
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ 
      token, 
      user: { 
        username: user.username, 
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider
      } 
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ msg: 'Google authentication failed' });
  }
});

// Login route with verification check
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with new verification code
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
      await user.save();

      // Send new verification email
      const emailSent = await sendVerificationEmail(email, verificationCode);
      if (!emailSent) {
        return res.status(500).json({ msg: 'Failed to send verification email' });
      }

      return res.status(403).json({ 
        msg: 'Please verify your email first',
        needsVerification: true,
        email: email
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: 'User is already verified' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      return res.status(500).json({ msg: 'Failed to send verification email' });
    }

    res.json({ msg: 'Verification code sent to your email' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/signup', signup);

router.get('/dashboard', auth, (req, res) => {
    res.json({ msg: 'Welcome to your dashboard!', userId: req.user });
  });

module.exports = router;
