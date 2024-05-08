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
//         wallet: walletToSend,
// }
userRouter.post("/checkUserByWallet", userController.checkUserByWallet);
userRouter.get("/getUsersRegistered", userController.getUsersRegistered);
export default userRouter;
