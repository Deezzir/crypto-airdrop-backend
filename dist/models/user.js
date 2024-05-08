import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    wallet: {
        type: String,
        required: true,
        unique: true,
    },
    twitter: {
        type: String,
        required: true,
        unique: true,
    },
    twitterLink: {
        type: String,
        required: true,
        unique: true,
    },
    telegram: {
        type: String,
        required: true,
        unique: true,
    },
    telegramVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    isMoneySent: {
        type: Boolean,
        required: true,
        default: false,
    },
    numberOfTokens: {
        type: Number,
        required: true,
        default: null,
    },
    transactionLink: {
        type: String,
        required: true,
        default: null,
    },
});
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
