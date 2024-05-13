import { Router } from "express";
import dropController from "../controllers/drop-controller.js";
import * as common from "../common.js";

const userRouter = Router();

const validationAddUpdateAirdropUser = (req: any, res: any, next: any) => {
    const { user } = req.body;

    if (!user) {
        return res.status(400).json({
            errorMsg: "No user provided",
        });
    }

    if (!user.wallet || !common.checkWallet(user.wallet)) {
        return res.status(400).json({
            errorMsg: "No wallet provided",
        });
    }

    // if (!user.tgUsername || !common.TG_USER_REGEX.test(user.tgUsername)) {
    //     return res.status(400).json({
    //         errorMsg: "Invalid telegram username",
    //     });
    // }

    if (!user.xUsername || !common.X_USER_REGEX.test(user.xUsername)) {
        return res.status(400).json({
            errorMsg: "Invalid twitter username",
        });
    }

    if (!user.xPostLink || !common.X_POST_REGEX.test(user.xPostLink)) {
        return res.status(400).json({
            errorMsg: "Invalid twitter link",
        });
    }

    next();
};

const validationCheckUserByWallet = (req: any, res: any, next: any) => {
    const { wallet } = req.body;

    if (!wallet || !common.checkWallet(wallet)) {
        return res.status(400).json({
            errorMsg: "Invalid wallet",
        });
    }

    next();
};

const validationAddUpdatePresaleUser = (req: any, res: any, next: any) => {
    const { user } = req.body;

    if (!user) {
        return res.status(400).json({
            errorMsg: "No user provided",
        });
    }

    if (!user.wallet || !common.checkWallet(user.wallet)) {
        return res.status(400).json({
            errorMsg: "No wallet provided",
        });
    }

    if (!user.solAmount || !common.checkSolAmount(user.solAmount)) {
        return res.status(400).json({
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
    dropController.addUpdateAidropUser
);
// {
//     isCreated: boolean,
//     isUpdated: boolean,
// }

// {
//     user: {
//         wallet: string,
//         solAmount: number,
//         txEnroll: string,
//     }
// }
userRouter.post(
    "/addUpdatePresaleUser",
    validationAddUpdatePresaleUser,
    dropController.addUpdatePresaleUser
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
    dropController.checkUserByWallet
);
// {
//     isValidWallet: boolean
//     isPresaleEnrolled: boolean,
//     isAirdropEnrolled: boolean,
//     presaleAmount: number,
//     errorMsgs: string[],
// }

// nothing
userRouter.get("/getDropInfo", dropController.getDropInfo);
//{ 
//    numberOfAirdropUsers: number,
//    numberOfPresaleUsers: number,
//    numberOfMaxAirdropUsers: number,
//    numberOfMaxPresaleUsers: number,
//    presaleMinSolAmount: number,
//    presaleMaxSolAmount: number,
//    presaleTokenAmount: number,
//    airdropTokenAmount: number,
//    presaleSolAmount: number,
//    dropPublicKey: string,
//    tokenTicker: string,
//    deadline: string,
//    toXFollow: string;
//    toTGFollow: string
//}

export default userRouter;
