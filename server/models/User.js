import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required!"],
    trim: true,
    minLength: [3, "The username is too short!"],
    maxLength: [30, "The username is too long!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email address!"
    }
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  }
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.model('User', userSchema);
export default User;
