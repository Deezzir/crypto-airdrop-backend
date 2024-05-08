import userService from "../services/user-service.js";
import { PublicKey } from "@solana/web3.js";
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
        }
        catch (e) {
            next(e);
        }
    }
    async getUsersRegistered(req, res, next) {
        const numberOfUsers = await userService.getNumberOfUsers();
        try {
            return res.json({
                numberOfUsers: numberOfUsers,
            });
        }
        catch (e) {
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
            // WALLET
            let walletVerified = false;
            try {
                await new PublicKey(wallet);
                walletVerified = true;
            }
            catch (e) { }
            // TWITTER
            // TWITTER POST
            //TODO REGEX ON CREATE/UPDATE
            //TODO TWITTER
            return res.json({
                isTelegram: telegramVerified,
                isTwitter: true,
                isTwitterPost: true,
                isWallet: walletVerified,
            });
        }
        catch (e) {
            next(e);
        }
    }
}
export default new UserController();
