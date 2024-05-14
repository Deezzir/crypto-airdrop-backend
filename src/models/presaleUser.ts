import mongoose, { Schema, Document } from "mongoose";

interface IPresaleUser extends Document {
    wallet: string;
    solAmount: number;
    txEnroll: string[];
    tokensToSend?: number;
    tx?: string;
}

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
        type: [String],
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

const PresaleUserModel = mongoose.model<IPresaleUser>("PresaleUser", userSchema);

export default PresaleUserModel;
