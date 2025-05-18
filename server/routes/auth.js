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

const generateRandomUsername = () => {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Swift', 'Bright', 'Calm', 'Eager', 'Fierce', 'Gentle', 'Kind'];
  const nouns = ['Coder', 'Dev', 'Hacker', 'Ninja', 'Guru', 'Master', 'Pro', 'Wizard', 'Genius', 'Star'];
  const randomNum = Math.floor(Math.random() * 1000);
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdj}${randomNoun}${randomNum}`;
};

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
    const decodedToken = jwt.decode(credential);
    if (!decodedToken) {
      throw new Error('Invalid token');
    }

    const { email, picture, name } = decodedToken;
    console.log('Google user data:', { email, name });

    try {
      await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
        clockTolerance: 300,
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Generate a unique usergeneratedname
      let usergeneratedname = generateRandomUsername();
      while (await User.findOne({ usergeneratedname })) {
        usergeneratedname = generateRandomUsername();
      }

      // Use Google's name as username, or generate one if not available
      const username = name || generateRandomUsername();

      console.log('Creating new user with:', { username, usergeneratedname, email });

      user = new User({ 
        username,
        usergeneratedname,
        email, 
        profilePicture: picture,
        authProvider: 'google',
        isVerified: true
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
        usergeneratedname: user.usergeneratedname,
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
      return res.status(400).json({ msg: 'User does not exist' });
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

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // Generate a unique random username
    let username = generateRandomUsername();
    while (await User.findOne({ username })) {
      username = generateRandomUsername();
    }

    // Generate a unique usergeneratedname
    let usergeneratedname = generateRandomUsername();
    while (await User.findOne({ usergeneratedname })) {
      usergeneratedname = generateRandomUsername();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      username,
      usergeneratedname,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    });
    await user.save();

    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      await User.deleteOne({ email });
      return res.status(500).json({ msg: 'Failed to send verification email' });
    }

    res.json({ 
      msg: 'Please check your email for verification code',
      needsVerification: true,
      email: email,
      username: username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/dashboard', auth, (req, res) => {
    res.json({ msg: 'Welcome to your dashboard!', userId: req.user });
  });

// GET profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Auth user data:', req.user);
    const userId = req.user.userId;
    console.log('Fetching profile for user:', userId);
    
    if (!userId) {
      console.log('No user ID in request');
      return res.status(401).json({ msg: 'No user ID provided' });
    }

    const user = await User.findById(userId).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    const profileData = {
      username: user.username,
      usergeneratedname: user.usergeneratedname || user.username, // Fallback to username if usergeneratedname is not set
      email: user.email,
      profilePicture: user.profilePicture,
      description: user.description || '',
      company: user.company || '',
      languages: user.languages || []
    };
    
    console.log('Sending profile data:', profileData);
    res.json(profileData);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Updating profile for user:', userId);
    console.log('Update data:', req.body);

    const { username, usergeneratedname, description, company, languages } = req.body;
    
    // Check if new usergeneratedname is taken by another user
    if (usergeneratedname) {
      const existingUser = await User.findOne({ usergeneratedname });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ msg: 'Generated name already taken' });
      }
    }

    const updateData = {
      username,
      usergeneratedname,
      description,
      company,
      languages
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('User not found for update');
      return res.status(404).json({ msg: 'User not found' });
    }

    const responseData = {
      username: updatedUser.username,
      usergeneratedname: updatedUser.usergeneratedname,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      description: updatedUser.description || '',
      company: updatedUser.company || '',
      languages: updatedUser.languages || []
    };

    console.log('Sending updated profile data:', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});



module.exports = router;
