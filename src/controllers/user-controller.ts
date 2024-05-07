import userService from "../services/user-service.js";
import TelegramBot from "node-telegram-bot-api";

class UserController {
  async addUpdateUser(req, res, next) {
    try {
      const { user } = req.body;
      console.log("user = ", user);
      const userExists = await userService.getUserByWallet(user.wallet);

      if (userExists) {
        console.log("userExists = ", userExists);
        const updatedUser = await userService.updateUser(user);

        return res.json({
          isCreated: false,
          isUpdated: true,
        });
      }

      if (!user) {
        return res.json({
          isCreated: false,
          isUpdated: false,
        });
      }

      const newUser = await userService.createUser(user);

      return res.json({
        isCreated: true,
        isUpdated: false,
      });
    } catch (e) {
      next(e);
    }
  }

  async checkUserByWallet(req, res, next) {
    try {
      const { wallet } = req.body;
      console.log("wallet = ", wallet);

      if (!wallet) {
        return null;
      }

      const user = await userService.getUserByWallet(wallet);

      if (!user) {
        return null;
      }

      //TELEGRAM
      const telegramVerified = user.telegramVerified;

      // TWITTER
      // TWITTER POST
      // WALLET
      return res.json({
        isTwitter: true,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
