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
    txEnroll: {
        type: String,
        default: null,
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

const PresaleUserModel = mongoose.model("PresaleUser", userSchema);

export default PresaleUserModel;
