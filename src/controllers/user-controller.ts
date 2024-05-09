import * as common from "../common.js";
import userService from "../services/airdropuser-service.js";
import xService from "../services/x-service.js";
import dotenv from "dotenv";
dotenv.config();

const MAX_USERS = parseInt(process.env.MAX_USERS, 10) || 1000;

class UserController {
    async addUpdateUser(req: any, res: any, next: any) {
        try {
            const { user } = req.body;

            const numberOfUsers = await userService.getNumberOfUsers();

            //DO NOT REGISTER/UPDATE USER IF LIMIT IS REACHED
            if (numberOfUsers >= MAX_USERS) {
                common.log(`Max number of users is reached: ${MAX_USERS}`);
                return res.json({
                    errorMsg: "Max number of users is reached.",
                });
            }
            //DO NOT REGISTER/UPDATE PEOPLE AFTER DEADLINE
            const currentDate = new Date();
            const milliseconds = currentDate.getMilliseconds();
            if (milliseconds > Number(process.env.DEADLINE_TIME)) {
                common.log(`Deadline is reached: ${process.env.DEADLINE_TIME}`);
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
                common.log(`User updated: ${updatedUser.wallet}`);
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
            common.log(`User created: ${newUser.wallet}`);
            return res.json({
                isCreated: true,
                isUpdated: false,
            });
        } catch (e) {
            next(e);
        }
    }

    async getUsersRegistered(req: any, res: any, next: any) {
        try {
            const numberOfUsers = await userService.getNumberOfUsers();
            common.log(`Number of users: ${numberOfUsers}`);
            return res.json({
                numberOfUsers: numberOfUsers,
            });
        } catch (e) {
            next(e);
        }
    }

    async checkUserByWallet(req: any, res: any, next: any) {
        try {
            const { wallet } = req.body;
            common.log(`wallet = ${wallet}`);
            let errorMsgs: string[] = [];

            if (!wallet) return null;

            const user = await userService.getUserByWallet(wallet);

            if (!user) return null;

            //TELEGRAM
            const telegramVerified = user.telegramVerified;
            if (!telegramVerified) errorMsgs.push("Telegram was not verified");

            // WALLET
            const walletVerified = common.checkWallet(wallet);
            if (!walletVerified) errorMsgs.push("Invalid wallet");

            // TWITTER
            const xUser = await xService.getXUser(user.twitter);
            const isTwitter = await xService.verifyXUser(xUser);
            if (!isTwitter) errorMsgs.push("Twitter Account is not following the required account or not found");

            // TWITTER POST
            //CHECK IF POST HAS OUR @ TAGGED
            //CHECK IF POST BELONGS TO THE USER MENTIONED FOR THIS ENTREE
            const isTwitterPost = await xService.verifyXPost(user.twitterLink, xUser);
            if (!isTwitterPost) errorMsgs.push("Twitter post is not valid or not found");

            common.log(`User checked: ${user.wallet}`);
            return res.json({
                isTelegram: telegramVerified,
                isTwitter: isTwitter,
                isTwitterPost: isTwitterPost,
                isWallet: walletVerified,
                errorMsg: errorMsgs.join("\n"),
            });
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();
