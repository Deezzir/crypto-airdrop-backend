import { Router } from "express";
import userController from "../controllers/user-controller.js";
import * as common from "../common.js";

const userRouter = Router();

const validationAddUpdateUser = (req: any, res: any, next: any) => {
    const { user } = req.body;

    if (!user) {
        return res.json({
            errorMsg: "No user provided",
        });
    }

    if (!user.telegram || !common.TG_USER_REGEX.test(user.telegram)) {
        return res.json({
            errorMsg: "Invalid telegram username",
        });
    }

    if (!user.twitter || !common.X_USER_REGEX.test(user.twitter)) {
        return res.json({
            errorMsg: "Invalid twitter username",
        });
    }

    if (!user.twitterLink || !common.X_POST_REGEX.test(user.twitterLink)) {
        return res.json({
            errorMsg: "Invalid twitter link",
        });
    }

    if (!user.wallet || !common.checkWallet(user.wallet)) {
        return res.json({
            errorMsg: "No wallet provided",
        });
    }

    next();
};

const validationCheckUserByWallet = (req: any, res: any, next: any) => {
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
userRouter.post(
    "/addUpdateUser",
    validationAddUpdateUser,
    userController.addUpdateUser
);
// {
//     isCreated: true,
//     isUpdated: false,
// }

// {
//         wallet: walletToSend,
// }
userRouter.post(
    "/checkUserByWallet",
    validationCheckUserByWallet,
    userController.checkUserByWallet
);
// {
//     isTelegram: telegramVerified,
//     isTwitter: isTwitterVerified,
//     isTwitterPost: isTwitterLinkVerified,
//     isWallet: walletVerified,
// }

// nothing
userRouter.get("/getUsersRegistered", userController.getUsersRegistered);
//{ numberOfUsers: number }

export default userRouter;
