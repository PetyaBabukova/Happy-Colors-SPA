import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: [true, "Username is required!"],
        minLength: [3, "The username is too short!"],
        maxLength: [30, "The username is too long!"],
        match: [/^[\p{L}0-9\s\-\., - – |!?%$&@„“‘’(){}\[\]:;\/\\_=\+\*#^~`]+$/u, "The username contains invalid characters!"],  
    },

    password: {
        type: String,
        required: [true, "Password is required!"],
    },

    email: {
        type: String,
        required: [true, "Email is required!"],
        match: [/^[\p{L}0-9\s\-\., - – |!?%$&@„“‘’(){}\[\]:;\/\\_=\+\*#^~`]+$/u, "The email contains invalid characters!"],  
    },

    dateCreated: String, 
    
    storageFolder: { 
        type: String, 
        default: "userimages",
    }
});

const User = mongoose.model('Product', userSchema);
export default User;
