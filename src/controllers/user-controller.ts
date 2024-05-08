import userService from "../services/user-service.js";
import { PublicKey } from "@solana/web3.js";

class UserController {
  async addUpdateUser(req, res, next) {
    try {
      const { user } = req.body;

      const numberOfUsers = await userService.getNumberOfUsers();

      //DO NOT REGISTER/UPDATE USER IF LIMIT IS REACHED
      if (numberOfUsers >= 1000) {
        return res.json({
          errorMsg: "Max number of users is reached.",
        });
      }
      //DO NOT REGISTER/UPDATE PEOPLE AFTER DEADLINE
      const currentDate = new Date();
      const milliseconds = currentDate.getMilliseconds();
      if (milliseconds > Number(process.env.DEADLINE_TIME)) {
        return res.json({
          errorMsg: "You cannot register after deadline.",
        });
      }

      //CHECK IF DATA IS USED FOR ANOTHER WALLET

      //TG
      const isValidTG = await userService.checkValidTG(user);
      if (!isValidTG) {
        return res.json({
          errorMsg:
            "This Telegram account is assosiated with another registered Wallet entree.",
        });
      }

      //TWITTER
      const isValidTwitter = await userService.checkValidTwitter(user);
      if (!isValidTwitter) {
        return res.json({
          errorMsg:
            "This Twitter account is assosiated with another registered Wallet entree.",
        });
      }

      //TWITTER_LINK
      const isValidTwitterLink = await userService.checkValidTwitterLink(user);
      if (!isValidTwitterLink) {
        return res.json({
          errorMsg:
            "This twitter post is assosiated with another registered Wallet entree.",
        });
      }

      const userExists = await userService.getUserByWallet(user.wallet);

      if (userExists) {
        const updatedUser = await userService.updateUser(user);

        return res.json({
          isCreated: false,
          isUpdated: true,
        });
      }

      //THIS IS COMMENTED BECAUSE WE ADDED cheking request middleware
      // if (!user) {
      //   return res.json({
      //     isCreated: false,
      //     isUpdated: false,
      //   });
      // }

      const newUser = await userService.createUser(user);

      return res.json({
        isCreated: true,
        isUpdated: false,
      });
    } catch (e) {
      next(e);
    }
  }

  async getUsersRegistered(req, res, next) {
    const numberOfUsers = await userService.getNumberOfUsers();
    try {
      return res.json({
        numberOfUsers: numberOfUsers,
      });
    } catch (e) {
      next(e);
    }
  }

  async checkUserByWallet(req, res, next) {
    try {
      const { wallet } = req.body;

      if (!wallet) {
        return null;
      }

      const user = await userService.getUserByWallet(wallet);

      if (!user) {
        return null;
      }

      //TELEGRAM
      const telegramVerified = user.telegramVerified;

      // WALLET
      let walletVerified = false;
      try {
        await new PublicKey(wallet);
        walletVerified = true;
      } catch (e) {}

      // TWITTER

      //CHECK IF TWITTER IS SUBSCRIBED TO OUR ACCOUT

      // TWITTER POST

      //CHECK IF POST HAS OUR @ TAGGED
      //CHECK IF POST BELONGS TO THE USER MENTIONED FOR THIS ENTREE

      //GIVE PROPER RESPONSE IF ONE OR ANOTHER RULE WAS NOT FOLLOWED
      //WE CAN JUST PASS TRUE/FALSE OR WE CAN RETURN ERRORMSG LIKE HERE FOR EACH ERROR:
      //  return res.json({
      //    errorMsg:
      //      "bla bla bla"
      //  });

      //TODO REGEX ON CREATE/UPDATE

      return res.json({
        isTelegram: telegramVerified,
        isTwitter: true,
        isTwitterPost: true,
        isWallet: walletVerified,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
