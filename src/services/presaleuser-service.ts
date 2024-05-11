import PresaleUserModel from "../models/presaleUser.js";

class PresaleUserService {
    async getUserByWallet(wallet: any) {
        const users = await PresaleUserModel.findOne({ wallet });

        return users;
    }

    async createUser(user: any) {
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

    async updateUser(user: any) {
        const userFound = await PresaleUserModel.findOne({ wallet: user.wallet });

        userFound.solAmount += user.solAmount;

        return await userFound.save();
    }
}

export default new PresaleUserService();