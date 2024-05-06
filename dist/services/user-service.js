import UserModel from "../models/user.js";
class UserService {
    async getUsersByWallet(wallet) {
        const users = await UserModel.find({ wallet });
        return users;
    }
    async createUser(user) {
        const newUser = await new UserModel(user).save();
        return newUser;
    }
}
export default new UserService();
