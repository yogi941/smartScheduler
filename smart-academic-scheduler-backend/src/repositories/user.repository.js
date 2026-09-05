const { User } = require('../models');

async function createUser(userData) {
  return User.create(userData);
}

async function findByEmail(email, withPassword = false) {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  if (withPassword) {
    query.select('+password');
  }
  return query;
}

async function findById(userId) {
  return User.findById(userId);
}

async function findByIdWithRefreshToken(userId) {
  return User.findById(userId).select('+refreshToken');
}

async function updateRefreshToken(userId, hashedRefreshToken) {
  return User.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken }, { new: true });
}

async function updateLastLogin(userId) {
  return User.findByIdAndUpdate(userId, { lastLoginAt: new Date() }, { new: true });
}

async function updateById(userId, updates) {
  return User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
}

async function existsByEmail(email) {
  const count = await User.countDocuments({ email: email.toLowerCase().trim() });
  return count > 0;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findByIdWithRefreshToken,
  updateRefreshToken,
  updateLastLogin,
  updateById,
  existsByEmail,
};
