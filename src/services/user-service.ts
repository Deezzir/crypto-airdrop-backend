import TelegramBot, { Message, ChatMember } from "node-telegram-bot-api";
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
    return await UserModel.updateOne({ wallet: user.wallet }, user);
  }

  async verifyTG(telegram) {
    const user = await UserModel.findOne({ telegram });

    if (!user || user.telegramVerified) {
      return;
    }

    user.telegramVerified = true;
    user.save();
  }
}

export default new UserService();
