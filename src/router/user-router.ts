import { Router } from "express";
import userController from "../controllers/user-controller.js";
import * as common from "../common.js";

const userRouter = Router();

const validationAddUpdateAirdropUser = (req: any, res: any, next: any) => {
    const { user } = req.body;

    if (!user) {
        return res.json({
            errorMsg: "No user provided",
        });
    }

    if (!user.wallet || !common.checkWallet(user.wallet)) {
        return res.json({
            errorMsg: "No wallet provided",
        });
    }

    if (!user.tgUsername || !common.TG_USER_REGEX.test(user.tgUsername)) {
        return res.json({
            errorMsg: "Invalid telegram username",
        });
    }

    if (!user.xUsername || !common.X_USER_REGEX.test(user.xUsername)) {
        return res.json({
            errorMsg: "Invalid twitter username",
        });
    }

    if (!user.xPostLink || !common.X_POST_REGEX.test(user.xPostLink)) {
        return res.json({
            errorMsg: "Invalid twitter link",
        });
    }

    next();
};

const validationCheckUserByWallet = (req: any, res: any, next: any) => {
    const { wallet } = req.body;

    if (!wallet || !common.checkWallet(wallet)) {
        return res.json({
            errorMsg: "Invalid wallet",
        });
    }

    next();
};

const validationAddUpdatePresaleUser = (req: any, res: any, next: any) => {
    const { user } = req.body;

    if (!user) {
        return res.json({
            errorMsg: "No user provided",
        });
    }

    if (!user.wallet || !common.checkWallet(user.wallet)) {
        return res.json({
            errorMsg: "No wallet provided",
        });
    }

    if (!user.solAmount || !common.checkSolAmount(user.solAmount)) {
        return res.json({
            errorMsg: "Invalid sol amount",
        });
    }

    next();
}

// {
//     user: {
//         wallet: string,
//         xUsername: string,
//         xPostLink: string,
//         tgUsername: string,
//     }
// }
userRouter.post(
    "/addUpdateAirdropUser",
    validationAddUpdateAirdropUser,
    userController.addUpdateAidropUser
);
// {
//     isCreated: boolean,
//     isUpdated: boolean,
// }

// {
//     user: {
//         wallet: string,
//         solAmount: number,
//     }
// }
userRouter.post(
    "/addUpdatePresaleUser",
    validationAddUpdatePresaleUser,
    userController.addUpdatePresaleUser
);
// {
//     isCreated: boolean,
//     isUpdated: boolean,
// }

// {
//         wallet: string,
// }
userRouter.post(
    "/checkUserByWallet",
    validationCheckUserByWallet,
    userController.checkUserByWallet
);
// {
//     isValidTg: boolean,
//     isValidX: boolean,
//     isValidXPost: boolean,
//     isValidWallet: boolean
//     isPresaleEnrolled: boolean,
//     isAirdropEnrolled: boolean,
//     presaleAmount: number,
//     errorMsgs: string[],
// }

// nothing
userRouter.get("/getDropInfo", userController.getDropInfo);
//{ 
//    numberOfAirdropUsers: number,
//    numberOfPresaleUsers: number,
//    numberOfMaxAirdropUsers: number,
//    numberOfMaxPresaleUsers: number,
//    presaleMinSolAmount: number,
//    presaleMaxSolAmount: number,
//    presaleSolAmount: number,
//    dropPublicKey: string,
//    deadline: string,
//    toXFollow: string;
//    toTGFollow: string
//}

export default userRouter;
