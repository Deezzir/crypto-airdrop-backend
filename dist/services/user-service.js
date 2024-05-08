import UserModel from "../models/user.js";
class UserService {
    async getUserByWallet(wallet) {
        const users = await UserModel.findOne({ wallet });
        return users;
    }
    async createUser(user) {
        const newUser = await new UserModel(user).save();
        return newUser;
    }
    async getNumberOfUsers() {
        return await UserModel.countDocuments();
    }
    async updateUser(user) {
        const userFound = await UserModel.findOne({ wallet: user.wallet });
        userFound.telegram = user.telegram;
        userFound.twitter = user.twitter;
        userFound.twitterLink = user.twitterLink;
        return await userFound.save();
    }
    async verifyTG(telegram) {
        const user = await UserModel.findOne({ telegram });
        if (!user || user.telegramVerified) {
            return;
        }
        user.telegramVerified = true;
        user.save();
    }
    async checkValidTG(user) {
        const userFound = await UserModel.findOne({ telegram: user.telegram });
        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }
        return true;
    }
    async checkValidTwitter(user) {
        const userFound = await UserModel.findOne({ twitter: user.twitter });
        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }
        return true;
    }
    async checkValidTwitterLink(user) {
        const userFound = await UserModel.findOne({
            twitterLink: user.twitterLink,
        });
        if (userFound) {
            if (user.wallet !== userFound.wallet) {
                return false;
            }
        }
        return true;
    }
}
export default new UserService();
