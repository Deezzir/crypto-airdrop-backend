import { Router } from "express";
import userController from "../controllers/user-controller.js";

const userRouter = Router();



userRouter.post('/getUsersByType',userController.getUsersByType);
userRouter.post('/getUserById',userController.getUserById)
userRouter.post('/updateUser',userController.updateUser)
userRouter.post('/createUser',userController.createUser)

export default userRouter;