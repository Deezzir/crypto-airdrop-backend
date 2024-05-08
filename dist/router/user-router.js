import { Router } from "express";
import userController from "../controllers/user-controller.js";
const userRouter = Router();
const validationAddUpdateUser = (req, res, next) => {
    next();
};
const validationCheckUserByWallet = (req, res, next) => {
    next();
};
// {
//     user: {
//         wallet: walletToSend,
//         twitter: twitterToSend,
//         twitterLink: twitterLinkToSend,
//         telegram: telegramToSend,
//     }
// }
userRouter.post("/addUpdateUser", validationAddUpdateUser, userController.addUpdateUser);
// {
//     isCreated: true,
//     isUpdated: false,
// }
// {
//         wallet: walletToSend,
// }
userRouter.post("/checkUserByWallet", validationCheckUserByWallet, userController.checkUserByWallet);
// {
//     isTelegram: telegramVerified,
//     isTwitter: true,
//     isTwitterPost: true,
//     isWallet: walletVerified,
// }
// nothing
userRouter.get("/getUsersRegistered", userController.getUsersRegistered);
//{ numberOfUsers: number }
export default userRouter;
