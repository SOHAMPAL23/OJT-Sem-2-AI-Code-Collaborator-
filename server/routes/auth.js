const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const auth = require('../middleware/auth')
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username: name, email, password: '' });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: { username: user.username, email: user.email } });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ msg: 'Google authentication failed' });
  }
});
router.post('/signup', signup);
router.post('/login', login);

router.get('/dashboard', auth, (req, res) => {
    res.json({ msg: 'Welcome to your dashboard!', userId: req.user });
  });

module.exports = router;
