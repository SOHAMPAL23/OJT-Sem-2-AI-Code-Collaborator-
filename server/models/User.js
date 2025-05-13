const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: false },
  profilePicture: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
