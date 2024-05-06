import { Router } from "express";
import userController from "../controllers/user-controller.js";

const userRouter = Router();

userRouter.post("/addUser", userController.addUser);
userRouter.post("/checkUserByWallet", userController.checkUserByWallet);

export default userRouter;
