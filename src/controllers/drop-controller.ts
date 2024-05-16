import { error } from "console";
import * as common from "../common.js";
import userAirdropService from "../services/airdropuser-service.js";
import userPresaleService from "../services/presaleuser-service.js";
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
const PRESALE_TOKENS = parseInt(process.env.PRESALE_TOKENS, 10) || 0;
const TOKEN_TICKER = process.env.TOKEN_TICKER || "";
const AIRDROP_TOKENS = parseInt(process.env.AIRDROP_TOKENS, 10) || 0;
const TWITTER_AGE = parseInt(process.env.TWITTER_AGE, 10) || 60;
const TWITTER_FOLLOWERS = parseInt(process.env.TWITTER_FOLLOWERS, 10) || 30;

class UserController {
    async addUpdatePresaleUser(req: any, res: any, next: any) {
        try {
            const { user } = req.body;

            common.log(`addUpdatePresaleUser - user: ${JSON.stringify(user)}`);

            if (!user) {
                return res.status(400).json({
                    errorMsg: "No user provided",
                });
            }

            const numberOfUsers = await userAirdropService.getNumberOfUsers();

            //DO NOT REGISTER USER IF LIMIT IS REACHED
            if (numberOfUsers >= MAX_AIRDROP_USERS) {
                common.log(`Max number of users is reached: ${MAX_AIRDROP_USERS}`);
                return res.status(403).json({
                    errorMsg: "Max number of users is reached.",
                });
            }
            //DO NOT REGISTER PEOPLE AFTER DEADLINE
            const time = Date.now() / 1000;
            if (time > DEADLINE_TIME) {
                common.log(`Deadline is reached: ${DEADLINE_TIME}`);
                return res.status(403).json({
                    errorMsg: "You cannot register after deadline.",
                });
            }

            //VALIDATE USER
            const { isValid, errorMsg } = await userPresaleService.verify(user);
            if (!isValid) {
                return res.status(400).json({
                    errorMsg: errorMsg,
                });
            }

            const userExists = await userPresaleService.getUserByWallet(user.wallet);

            if (userExists) {
                if (userExists) {
                    const updatedUser = await userPresaleService.updateUser(user);
                    common.log(`Presale record updated: ${updatedUser.wallet}`);
                    return res.status(200).json({
                        isCreated: false,
                        isUpdated: true,
                    });
                }
            }

            const newUser = await userPresaleService.createUser(user);
            common.log(`New Presale enroll: ${newUser.wallet}`);
            return res.status(200).json({
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

            common.log(`addUpdateAidropUser - user: ${JSON.stringify(user)}`);

            if (!user) {
                return res.status(400).json({
                    errorMsg: "No user provided",
                });
            }

            const numberOfUsers = await userAirdropService.getNumberOfUsers();

            //DO NOT REGISTER/UPDATE USER IF LIMIT IS REACHED
            if (numberOfUsers >= MAX_AIRDROP_USERS) {
                common.log(`Max number of users is reached: ${MAX_AIRDROP_USERS}`);
                return res.status(403).json({
                    errorMsg: "Max number of users is reached.",
                });
            }
            //DO NOT REGISTER/UPDATE PEOPLE AFTER DEADLINE
            const time = Date.now() / 1000;
            if (time > DEADLINE_TIME) {
                common.log(`Deadline is reached: ${DEADLINE_TIME}`);
                return res.status(403).json({
                    errorMsg: "You cannot register after deadline.",
                });
            }

            //VALIDATE USER
            const { isValid, errorMsg } = await userAirdropService.verify(user);
            if (!isValid) {
                return res.status(400).json({
                    errorMsg: errorMsg,
                });
            }

            const userExists = await userAirdropService.getUserByWallet(user.wallet);

            if (userExists) {
                const updatedUser = await userAirdropService.updateUser(user);
                common.log(`Airdrop record updated: ${updatedUser.wallet}`);
                return res.status(200).json({
                    isCreated: false,
                    isUpdated: true,
                });
            }

            const newUser = await userAirdropService.createUser(user);
            common.log(`New Airdrop enroll: ${newUser.wallet}`);
            return res.status(200).json({
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

            return res.status(200).json({
                numberOfAirdropUsers: numberOfAirdrops,
                numberOfPresaleUsers: numberOfPresales,
                numberOfMaxAirdropUsers: MAX_AIRDROP_USERS,
                numberOfMaxPresaleUsers: MAX_PRESALE_USERS,
                presaleMaxSolAmount: PRESALE_MAX_SOL_AMOUNT,
                presaleMinSolAmount: PRESALE_MIN_SOL_AMOUNT,
                airdropTokenAmount: AIRDROP_TOKENS,
                presaleTokenAmount: PRESALE_TOKENS,
                toXFollow: TWITTER_USER,
                dropPublicKey: DROP_PUBKEY,
                presaleSolAmount: totalSolAmount,
                toTGFollow: TG_GROUP,
                xFollowers: TWITTER_FOLLOWERS,
                xAge: TWITTER_AGE,
                tokenTicker: TOKEN_TICKER,
                deadline: DEADLINE_TIME,
            });
        } catch (e) {
            next(e);
        }
    }

    async checkUserByWallet(req: any, res: any, next: any) {
        try {
            const { wallet } = req.body;
            common.log(`CheckUserByWallet - wallet: ${wallet}`);
            let errorMsgs: string[] = [];

            if (!wallet || !common.checkWallet(wallet))
                return res.status(400).json({
                    isWallet: false,
                    errorMsgs: ["Invalid wallet"],
                });

            // WALLET PRESALE
            const airdropUser = await userAirdropService.getUserByWallet(wallet);
            if (!airdropUser) errorMsgs.push("Airdrop not enrolled");

            // WALLET AIRDROP
            const presaleUser = await userPresaleService.getUserByWallet(wallet);
            if (!presaleUser) errorMsgs.push("Presale not enrolled");

            return res.status(200).json({
                isValidWallet: true,
                isPresaleEnrolled: presaleUser ? true : false,
                isAirdropEnrolled: airdropUser ? true : false,
                presaleAmount: presaleUser ? presaleUser.solAmount : 0,
                errorMsgs: errorMsgs,
            });
        } catch (e) {
            next(e);
        }
    }

    async getPresaleUser(req: any, res: any, next: any) {
        try {
            const { wallet } = req.query;
            common.log(`GetPresaleUser - wallet: ${wallet}`);

            if (!wallet || !common.checkWallet(wallet))
                return res.status(403).json({
                    errorMsg: "Invalid wallet",
                });

            const user = await userPresaleService.getUserByWallet(wallet);
            if (!user) {
                return res.status(200).json({
                    detail: "Presale user not found",
                });
            } else {
                return res.status(200).json({
                    wallet: user.wallet,
                    solAmount: user.solAmount,
                    txEnroll: user.txEnroll,
                });
            }
        } catch (e) {
            next(e);
        }
    }

    async getAirdropUser(req: any, res: any, next: any) {
        try {
            const { wallet, xUsername, xPostLink } = req.query;
            common.log(`GetAirdropUser - field: ${wallet || xUsername || xPostLink}`);

            if (!wallet && !xUsername && !xPostLink)
                return res.status(403).json({
                    errorMsg: "Invalid field",
                });

            if (wallet && !common.checkWallet(wallet))
                return res.status(403).json({
                    errorMsg: "Invalid wallet",
                });

            if (xUsername && !common.X_USER_REGEX.test(xUsername))
                return res.status(403).json({
                    errorMsg: "Invalid twitter username",
                });

            if (xPostLink && !common.X_POST_REGEX.test(xPostLink))
                return res.status(403).json({
                    errorMsg: "Invalid twitter link",
                });

            const user = await userAirdropService.getUserByFields({ wallet, xUsername, xPostLink });
            if (!user) {
                return res.status(200).json({
                    detail: "Airdrop user not found",
                });
            } else {
                return res.status(200).json({
                    wallet: user.wallet,
                    xUsername: user.xUsername,
                    xPostLink: user.xPostLink,
                    tgUsername: user.tgUsername,
                });
            }
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();
