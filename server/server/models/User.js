import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Потребителското име е задължително!"],
    trim: true,
    minLength: [3, "Потребителското име трябва да е поне 3 символа!"],
    maxLength: [15, "Потребителското име не може да е повече от 15 символа!"],
  },
  email: {
    type: String,
    required: [true, "Email адресът е задължителен!"],
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Невалиден email адрес!"
    }
  },
  password: {
    type: String,
    required: [true, "Паролата е задължителна!"],
  }
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.model('User', userSchema);
export default User;
