import AirdropUserModel from "../models/airdropUser.js";

class AirdropUserService {
    async getUserByWallet(wallet: any) {
        const users = await AirdropUserModel.findOne({ wallet });

        return users;
    }

    async createUser(user: any) {
        const newUser = await new AirdropUserModel(user).save();

        return newUser;
    }

    async getNumberOfUsers() {
        return await AirdropUserModel.countDocuments();
    }

    async updateUser(user: any) {
        const userFound = await AirdropUserModel.findOne({ wallet: user.wallet });

        userFound.tgUsername = user.tgUsername;
        userFound.xUsername = user.xUsername;
        userFound.xPostLink = user.xPostLink;

        return await userFound.save();
    }

    async verifyTG(telegram: any) {
        const user = await AirdropUserModel.findOne({ tgUsername: telegram });

        if (!user || user.tgVerified) {
            return;
        }

        user.tgVerified = true;
        user.save();
    }

    async checkValidTG(user: any) {
        const userFound = await AirdropUserModel.findOne({ tgUsername: user.telegram });

        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }

        return true;
    }

    async checkValidTwitter(user: any) {
        const userFound = await AirdropUserModel.findOne({ xUsername: user.twitter });

        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }

        return true;
    }

    async checkValidTwitterLink(user: any) {
        const userFound = await AirdropUserModel.findOne({
            xPostLink: user.twitterLink,
        });

        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }

        return true;
    }
}

export default new AirdropUserService();