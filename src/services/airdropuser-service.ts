import AirdropUserModel from "../models/airdropUser.js";
import { AirdropUser } from "../common.js";
import XService from "./x-service.js";

class AirdropUserService {
    async getUserByWallet(wallet: string) {
        const user = await AirdropUserModel.findOne({ wallet });

        return user;
    }

    async createUser(user: AirdropUser) {
        const newUser = await new AirdropUserModel(user).save();

        return newUser;
    }

    async getNumberOfUsers() {
        return await AirdropUserModel.countDocuments();
    }

    async updateUser(user: AirdropUser) {
        const userFound = await AirdropUserModel.findOne({ wallet: user.wallet });

        userFound.tgUsername = user.tgUsername;
        userFound.xUsername = user.xUsername;
        userFound.xPostLink = user.xPostLink;

        return await userFound.save();
    }

    async verify(user: AirdropUser): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        const uniquenessCheck = await this.checkUniqueness(user);
        if (!uniquenessCheck.isValid) return uniquenessCheck;

        // const isValidTG = await this.verifyTG(user.tgUsername);
        // if (!isValidTG.isValid) return isValidTG;

        const isValidX = await XService.verifyX(user.xUsername, user.xPostLink);
        if (!isValidX.isValid) return isValidX;

        return { isValid: true, errorMsg: undefined };
    }

    async verifyTG(telegram: string): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        return { isValid: true, errorMsg: undefined };
    }

    async checkUniqueness(user: AirdropUser): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        const userFound = await AirdropUserModel.findOne({
            $or: [
                { tgUsername: user.tgUsername },
                // { xUsername: user.xUsername },
                { xPostLink: user.xPostLink }
            ]
        });

        if (userFound && user.wallet !== userFound.wallet) {
            // if (userFound.tgUsername === user.tgUsername) {
            //     return { isValid: false, errorMsg: "The Telegram account is already assosiated with another registered entree." };
            // }
            if (userFound.xUsername === user.xUsername) {
                return { isValid: false, errorMsg: "The X account is already assosiated with another registered entree." };
            }
            if (userFound.xPostLink === user.xPostLink) {
                return { isValid: false, errorMsg: "The X post is already assosiated with another registered Wallet entree." };
            }
        }

        return { isValid: true, errorMsg: undefined };
    }

    async checkValidTG(user: AirdropUser) {
        const userFound = await AirdropUserModel.findOne({ tgUsername: user.tgUsername });

        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }

        return true;
    }

    async checkValidX(user: AirdropUser) {
        const userFound = await AirdropUserModel.findOne({ xUsername: user.xUsername });

        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }

        return true;
    }

    async checkValidXLink(user: AirdropUser) {
        const userFound = await AirdropUserModel.findOne({ xPostLink: user.xPostLink });

        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }

        return true;
    }
}

export default new AirdropUserService();