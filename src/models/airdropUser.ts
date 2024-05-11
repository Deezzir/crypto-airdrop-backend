import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    wallet: {
        type: String,
        required: true,
        unique: true,
    },
    xUsername: {
        type: String,
        required: true,
        unique: true,
    },
    xPostLink: {
        type: String,
        required: true,
        unique: true,
    },
    tgUsername: {
        type: String,
        required: true,
        unique: true,
    },
    tgVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    tokensToSend: {
        type: Number,
        default: null,
    },
    tx: {
        type: String,
        default: null,
    },
});

const AirdropUserModel = mongoose.model("AirdropUser", userSchema);

export default AirdropUserModel;
