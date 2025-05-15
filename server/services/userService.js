import User from '../models/User.js';
import bcrypt from 'bcrypt';
import validator from 'validator';

export async function registerUser({ username, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('A user with this email already exists!');
  }

  // ✅ ТУК проверяваме raw password, преди да го хешираме
  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });

  if (!isStrong) {
    throw new Error(
      'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
    );
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashedPass
  });

  await user.save();
  return {
    _id: user._id,
    username: user.username,
    email: user.email
  };
}
