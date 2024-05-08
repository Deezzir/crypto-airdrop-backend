import { Router } from "express";
import userController from "../controllers/user-controller.js";

const userRouter = Router();

// {
//     user: {
//         wallet: walletToSend,
//         twitter: twitterToSend,
//         twitterLink: twitterLinkToSend,
//         telegram: telegramToSend,
//     }
// }
userRouter.post("/addUpdateUser", userController.addUpdateUser);
// {
//     isCreated: true,
//     isUpdated: false,
// }

// {
//         wallet: walletToSend,
// }
userRouter.post("/checkUserByWallet", userController.checkUserByWallet);
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
