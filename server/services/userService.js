import User from '../models/User.js';
import bcrypt from 'bcrypt';
import validator from 'validator';

export async function registerUser({ username, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Този потребител вече съществува!');
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
      'Паролата трябва да е поне 8 символа, да съдържа поне 1 малка буква, 1 главна буква, 1 число и 1 специален символ!'
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
