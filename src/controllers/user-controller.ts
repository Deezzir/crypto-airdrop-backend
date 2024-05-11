import * as common from "../common.js";
import userAirdropService from "../services/airdropuser-service.js";
import userPresaleService from "../services/presaleuser-service.js";
import xService from "../services/x-service.js";
import dotenv from "dotenv";
dotenv.config();

const MAX_AIRDROP_USERS = parseInt(process.env.MAX_AIRDROP_USERS, 10) || 1000;
const MAX_PRESALE_USERS = parseInt(process.env.MAX_PRESALE_USERS, 10) || 1000;
const PRESALE_MIN_SOL_AMOUNT = parseFloat(process.env.PRESALE_MIN_SOL_AMOUNT) || 0;
const PRESALE_MAX_SOL_AMOUNT = parseFloat(process.env.PRESALE_MAX_SOL_AMOUNT) || 0;
const DEADLINE_TIME = parseInt(process.env.DEADLINE_TIME, 10) || 0;
const DROP_PUBKEY = process.env.DROP_PUBKEY || "7faQb7SQxswoQyRY47iyYtff6iDG1bt7jSFsUm1cxUp9";
const TWITTER_USER = process.env.TWITTER_USER || "";
const TG_GROUP = process.env.TG_GROUP || "";

class UserController {
    async addUpdatePresaleUser(req: any, res: any, next: any) {
        try {
            const { user } = req.body;

            const numberOfUsers = await userAirdropService.getNumberOfUsers();

            //DO NOT REGISTER/UPDATE USER IF LIMIT IS REACHED
            if (numberOfUsers >= MAX_AIRDROP_USERS) {
                common.log(`Max number of users is reached: ${MAX_AIRDROP_USERS}`);
                return res.json({
                    errorMsg: "Max number of users is reached.",
                });
            }
            //DO NOT REGISTER/UPDATE PEOPLE AFTER DEADLINE
            const time = Date.now() / 1000;
            if (time > DEADLINE_TIME) {
                common.log(`Deadline is reached: ${DEADLINE_TIME}`);
                return res.json({
                    errorMsg: "You cannot register after deadline.",
                });
            }

            const userExists = await userPresaleService.getUserByWallet(user.wallet);

            if (userExists) {
                const updatedUser = await userPresaleService.updateUser(user);
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

            const newUser = await userPresaleService.createUser(user);
            common.log(`User created: ${newUser.wallet}`);
            return res.json({
                isCreated: true,
                isUpdated: false,
            });
        } catch (e) {
            next(e);
        }
    }

    async addUpdateAidropUser(req: any, res: any, next: any) {
        try {
            const { user } = req.body;

            const numberOfUsers = await userAirdropService.getNumberOfUsers();

            //DO NOT REGISTER/UPDATE USER IF LIMIT IS REACHED
            if (numberOfUsers >= MAX_AIRDROP_USERS) {
                common.log(`Max number of users is reached: ${MAX_AIRDROP_USERS}`);
                return res.json({
                    errorMsg: "Max number of users is reached.",
                });
            }
            //DO NOT REGISTER/UPDATE PEOPLE AFTER DEADLINE
            const time = Date.now() / 1000;
            if (time > DEADLINE_TIME) {
                common.log(`Deadline is reached: ${DEADLINE_TIME}`);
                return res.json({
                    errorMsg: "You cannot register after deadline.",
                });
            }

            //CHECK IF DATA IS USED FOR ANOTHER WALLET

            //TG
            const isValidTG = await userAirdropService.checkValidTG(user);
            if (!isValidTG) {
                return res.json({
                    errorMsg:
                        "This Telegram account is assosiated with another registered Wallet entree.",
                });
            }

            //TWITTER
            const isValidTwitter = await userAirdropService.checkValidTwitter(user);
            if (!isValidTwitter) {
                return res.json({
                    errorMsg:
                        "This Twitter account is assosiated with another registered Wallet entree.",
                });
            }

            //TWITTER_LINK
            const isValidTwitterLink = await userAirdropService.checkValidTwitterLink(user);
            if (!isValidTwitterLink) {
                return res.json({
                    errorMsg:
                        "This twitter post is assosiated with another registered Wallet entree.",
                });
            }

            const userExists = await userAirdropService.getUserByWallet(user.wallet);

            if (userExists) {
                const updatedUser = await userAirdropService.updateUser(user);
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

            const newUser = await userAirdropService.createUser(user);
            common.log(`User created: ${newUser.wallet}`);
            return res.json({
                isCreated: true,
                isUpdated: false,
            });
        } catch (e) {
            next(e);
        }
    }

    async getDropInfo(req: any, res: any, next: any) {
        try {

            const numberOfAirdrops = await userAirdropService.getNumberOfUsers();
            const numberOfPresales = await userPresaleService.getNumberOfUsers();
            const totalSolAmount = await userPresaleService.getTotalSolAmout();
            common.log(`GetDropInfo - Airdrops: ${numberOfAirdrops}, Presales: ${numberOfPresales}, Total SOL: ${totalSolAmount}`);

            return res.json({
                numberOfAirdropUsers: numberOfAirdrops,
                numberOfPresaleUsers: numberOfPresales,
                numberOfMaxAirdropUsers: MAX_AIRDROP_USERS,
                numberOfMaxPresaleUsers: MAX_PRESALE_USERS,
                presaleMaxSolAmount: PRESALE_MAX_SOL_AMOUNT,
                presaleMinSolAmount: PRESALE_MIN_SOL_AMOUNT,
                toXFollow: TWITTER_USER,
                dropPublicKey: DROP_PUBKEY,
                presaleSolAmount: totalSolAmount,
                toTGFollow: TG_GROUP,
                deadline: DEADLINE_TIME,
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

            if (!wallet || !common.checkWallet(wallet))
                return res.json({
                    isWallet: false,
                    errorMsgs: ["Invalid wallet"],
                });

            // WALLET PRESALE
            const airdropUser = await userAirdropService.getUserByWallet(wallet);
            if (!airdropUser) errorMsgs.push("Airdrop not enrolled");

            // WALLET AIRDROP
            const presaleUser = await userPresaleService.getUserByWallet(wallet);
            if (!presaleUser) errorMsgs.push("Presale not enrolled");

            //TELEGRAM
            // const telegramVerified = user.telegramVerified;
            // if (!telegramVerified) errorMsgs.push("Telegram was not verified");

            // TWITTER
            // const xUser = await xService.getXUser(user.twitter);
            // const isTwitter = await xService.verifyXUser(xUser);
            // if (!isTwitter) errorMsgs.push("Twitter Account is not following the required account or not found");

            // TWITTER POST
            //CHECK IF POST HAS OUR @ TAGGED
            //CHECK IF POST BELONGS TO THE USER MENTIONED FOR THIS ENTREE
            // const isTwitterPost = await xService.verifyXPost(user.twitterLink, xUser);
            // if (!isTwitterPost) errorMsgs.push("Twitter post is not valid or not found");

            return res.json({
                // isValidTg: telegramVerified,
                // isValidX: isTwitter,
                // isValidXPost: isTwitterPost,
                isValidWallet: true,
                isPresaleEnrolled: airdropUser ? true : false,
                isAirdropEnrolled: presaleUser ? true : false,
                presaleAmount: presaleUser ? presaleUser.solAmount : 0,
                errorMsgs: errorMsgs,
            });
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();
