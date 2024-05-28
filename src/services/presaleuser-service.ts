import PresaleUserModel from "../models/presaleUser.js";
import { PresaleUser } from "../common.js";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const PRESALE_MAX_SOL_AMOUNT = parseFloat(process.env.PRESALE_MAX_SOL_AMOUNT) || 0;
const PRESALE_MIN_SOL_AMOUNT = parseFloat(process.env.PRESALE_MIN_SOL_AMOUNT) || 0;
const RPC_URL = new Connection(process.env.RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
const DROP_PUBKEY = process.env.DROP_PUBKEY || '';

class PresaleUserService {
    async verify(user: PresaleUser): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        const isValidTx = await this.verifySignature(user.txEnroll);
        if (!isValidTx.isValid) return isValidTx;

        const record = await this.getUserByWallet(user.wallet);
        if (!record) return { isValid: true, errorMsg: undefined };

        if (record.solAmount + user.solAmount > PRESALE_MAX_SOL_AMOUNT) {
            return { isValid: false, errorMsg: `You exceeded the maximum amount of ${PRESALE_MAX_SOL_AMOUNT} SOL. Contact dev for refund` };
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
        userFound.txEnroll.push(user.txEnroll);

        return await userFound.save();
    }

    async verifySignature(signature: string): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        const { value: status } = await RPC_URL.getSignatureStatus(signature);

        if (status && ((status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized')) && status.err === null) {
            const details = await RPC_URL.getTransaction("3uVuXFfFTqQw5jRi8Cpvpa6Jt578ASVYMnDrE3xFAdf4voStYbfMU7rq8sc8JmwfadVAXJUeNZ1M2o4iSVzdnJ1u", {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0
            });

            const balance_change = (details?.meta?.postBalances[1] ?? 0) - (details?.meta?.preBalances[1] ?? 0) / LAMPORTS_PER_SOL;
            const receiver = details?.transaction.message.getAccountKeys().get(1)?.toString() ?? '';

            if (receiver !== DROP_PUBKEY) {
                return { isValid: false, errorMsg: 'Invalid receiver' };
            }

            if (balance_change < (PRESALE_MIN_SOL_AMOUNT - 0.0001) || balance_change > (PRESALE_MAX_SOL_AMOUNT + 0.0001)) {
                return { isValid: false, errorMsg: 'Invalid amount' };
            }

            return { isValid: true, errorMsg: undefined };
        }

        return { isValid: false, errorMsg: 'Transaction failed' }
    }
}

export default new PresaleUserService();