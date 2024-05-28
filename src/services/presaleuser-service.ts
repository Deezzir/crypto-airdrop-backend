import PresaleUserModel from "../models/presaleUser.js";
import { PresaleUser, sleep, log } from "../common.js";
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
        if (!isValidTx.isValid) {
            log(`Invalid tx: ${isValidTx.errorMsg}`);
            return isValidTx;
        }

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
        const maxAttempts = 40;
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;
            try {
                const { value: status } = await RPC_URL.getSignatureStatus(signature);
                log(`Attempt ${attempts}: ${JSON.stringify(status, null, 2)}`);

                if (!status) {
                    await sleep(2000);
                    continue;
                }

                const { confirmationStatus, err } = status;

                if ((confirmationStatus === 'processed' || confirmationStatus === 'confirmed') && err === null) {
                    await sleep(1000);
                    continue;
                }

                if (confirmationStatus === 'finalized' && err === null) {
                    const details = await RPC_URL.getTransaction(signature, {
                        commitment: 'confirmed',
                        maxSupportedTransactionVersion: 0
                    });

                    const balanceChange = ((details?.meta?.postBalances[1] ?? 0) - (details?.meta?.preBalances[1] ?? 0)) / LAMPORTS_PER_SOL;
                    const receiver = details?.transaction.message.getAccountKeys().get(1)?.toString() ?? '';

                    if (receiver !== DROP_PUBKEY) {
                        return { isValid: false, errorMsg: 'Invalid receiver' };
                    }

                    if (balanceChange < (PRESALE_MIN_SOL_AMOUNT - 0.0001) || balanceChange > (PRESALE_MAX_SOL_AMOUNT + 0.0001)) {
                        return { isValid: false, errorMsg: 'Invalid amount' };
                    }

                    return { isValid: true, errorMsg: undefined };
                }

                return { isValid: false, errorMsg: 'Transaction failed' };
            } catch (error) {
                return { isValid: false, errorMsg: `Error occured during tx verification. Contact dev` };
            }
        }

        return { isValid: false, errorMsg: 'Max attempts to verify the tx reached. Contact dev' };
    }

}

export default new PresaleUserService();