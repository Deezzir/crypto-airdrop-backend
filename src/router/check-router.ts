import { Router } from "express";
import checkContoller from "../controllers/check-contoller.js";

const checkRouter = Router();

checkRouter.get("/", checkContoller.verify);

export default checkRouter;