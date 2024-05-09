import UserModel from "../models/presaleUser.js";

class PresaleUserService {
    async getUserByWallet(wallet: any) {
        const users = await UserModel.findOne({ wallet });

        return users;
    }

    async createUser(user: any) {
        const newUser = await new UserModel(user).save();

        return newUser;
    }

    async getNumberOfUsers() {
        return await UserModel.countDocuments();
    }

    async updateUser(user: any) {
        const userFound = await UserModel.findOne({ wallet: user.wallet });

        userFound.solAmount += user.solAmount;

        return await userFound.save();
    }
}

export default new PresaleUserService();