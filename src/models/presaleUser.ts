import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    wallet: {
        type: String,
        required: true,
        unique: true,
    },
    solAmount: {
        type: Number,
        required: true,
    },
    isTokensSent: {
        type: Boolean,
        default: false,
    },
    numberOfTokens: {
        type: Number,
        default: null,
    },
    transactionLink: {
        type: String,
        default: null,
    },
});

const PresaleUserModel = mongoose.model("PresaleUser", userSchema);

export default PresaleUserModel;
