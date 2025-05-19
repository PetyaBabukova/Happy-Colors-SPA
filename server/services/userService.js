import User from '../models/User.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret'; // за тестове може да остане така

export async function loginUser(email, password) {


    const user = await User.findOne({ email });
    if (!user) {
        console.log('❌ Няма такъв потребител!');
        throw new Error('Invalid credentials');
    }



    const isValid = await bcrypt.compare(password, user.password);
    console.log('✅ bcrypt.compare резултат:', isValid);

    if (!isValid) {
        console.log('❌ Паролата е невалидна!');
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { _id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1d' }
    );


    return {
        token,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
        }
    };
}


export async function registerUser({ username, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
        throw new Error('Този потребител вече съществува!');
    }

    const isStrong = validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    });

    if (!isStrong) {
        throw new Error(
            'Паролата трябва да е поне 8 символа, да съдържа малки и главни латински букви, поне 1 цифра и поне един символ!'
        );
    }

    const user = new User({ username, email, password }); // ❗ без предварително хеширане

    await user.save();

    return {
        _id: user._id,
        username: user.username,
        email: user.email
    };
}






