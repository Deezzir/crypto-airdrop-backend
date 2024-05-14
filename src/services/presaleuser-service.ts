import PresaleUserModel from "../models/presaleUser.js";
import { PresaleUser } from "../common.js";
import dotenv from "dotenv";
dotenv.config();

const PRESALE_MAX_SOL_AMOUNT = parseFloat(process.env.PRESALE_MAX_SOL_AMOUNT) || 0;

class PresaleUserService {
    async verify(user: PresaleUser): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        const record = await this.getUserByWallet(user.wallet);
        if (!record) return { isValid: false, errorMsg: "Failed to verify user" };

        if (record.solAmount + user.solAmount > PRESALE_MAX_SOL_AMOUNT) {
            return { isValid: false, errorMsg: `You will exceed the maximum amount of ${PRESALE_MAX_SOL_AMOUNT} SOL` };
        }

        return { isValid: true, errorMsg: undefined };
    }

    async getUserByWallet(wallet: string) {
        const users = await PresaleUserModel.findOne({ wallet });

        return users;
    }

    async createUser(user: PresaleUser) {
        const newUser = await new PresaleUserModel(user).save();

        return newUser;
    }

    async getNumberOfUsers() {
        return await PresaleUserModel.countDocuments();
    }

    async getTotalSolAmout() {
        const result = await PresaleUserModel.aggregate([
            {
                $group: {
                    _id: null, // Grouping key - 'null' means to calculate total across all documents
                    totalSolAmount: { $sum: "$solAmount" } // Sum up all SolAmount values
                }
            }
        ]);
        if (result.length > 0) {
            return result[0].totalSolAmount;
        } else {
            return 0.0;
        }
    }

    async updateUser(user: PresaleUser) {
        const userFound = await PresaleUserModel.findOne({ wallet: user.wallet });

        userFound.solAmount += user.solAmount;

        return await userFound.save();
    }
}

export default new PresaleUserService();