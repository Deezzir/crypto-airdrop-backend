import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    isActivated: {
        type: Boolean,
        required: true,
        default: false
    },
    activationLink: {
        type: String
    },
    userType: {
        type: String,
        enum: ['USER', 'COACH', 'ADMIN'],
        require: true,
        default: 'USER'
    },
    birthday: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
});
const UserModel = mongoose.model('User', userSchema);
export default UserModel;
