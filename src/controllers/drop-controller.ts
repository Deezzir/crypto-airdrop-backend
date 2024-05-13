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
const PRESALE_TOKENS = parseInt(process.env.PRESALE_TOKENS, 10) || 0;
const TOKEN_TICKER = process.env.TOKEN_TICKER || "";
const AIRDROP_TOKENS = parseInt(process.env.AIRDROP_TOKENS, 10) || 0;

class UserController {
    async addUpdatePresaleUser(req: any, res: any, next: any) {
        try {
            const { user } = req.body;

            if (!user) {
                return res.status(400).json({
                    isCreated: false,
                    isUpdated: false,
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

            const userExists = await userPresaleService.getUserByWallet(user.wallet);

            if (userExists) {
                const updatedUser = await userPresaleService.updateUser(user);
                common.log(`Presale record updated: ${updatedUser.wallet}`);
                return res.status(200).json({
                    isCreated: false,
                    isUpdated: true,
                });
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

            if (!user) {
                return res.status(400).json({
                    isCreated: false,
                    isUpdated: false,
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
            common.log(`wallet = ${wallet}`);
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
}

export default new UserController();
