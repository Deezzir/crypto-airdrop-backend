import mongoose, { Document, Schema } from "mongoose";
import { AirdropUser } from "../common";

interface IAirdropUser extends Document {
    wallet: string;
    xUsername: string;
    xPostLink: string;
    tgUsername?: string;
    tokensToSend?: number;
    tx?: string;
}

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
        required: false,
        unique: false,
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

const AirdropUserModel = mongoose.model<AirdropUser>("AirdropUser", userSchema);

export default AirdropUserModel;
