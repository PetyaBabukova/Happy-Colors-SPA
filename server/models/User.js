import mongoose from 'mongoose';
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: [true, "Username is required!"],
        minLength: [3, "The username is too short!"],
        maxLength: [30, "The username is too long!"],
        // match: [/^[\p{L}0-9\s\-\., - – |!?%$&@„“‘’(){}\[\]:;\/\\_=\+\*#^~`]+$/u, "The username contains invalid characters!"],  
    },

    password: {
        type: String,
        required: [true, "Password is required!"],
        minLength: [3, "The password is too short!"]
    },

    email: {
        type: String,
        required: [true, "Email is required!"],
        // match: [/^[\p{L}0-9\s\-\., - – |!?%$&@„“‘’(){}\[\]:;\/\\_=\+\*#^~`]+$/u, "The email contains invalid characters!"],  
    },

    
});

userSchema.pre('save', async function () {
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
})

const User = mongoose.model('Product', userSchema);
export default User;
