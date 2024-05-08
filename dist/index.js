import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import db from "./db.js";
import userRouter from "./router/user-router.js";
import TelegramBot from "node-telegram-bot-api";
import userService from "./services/user-service.js";
import ErrorMiddleware from "./middlewares/error-middleware.js";
const mongo = db;
const app = express();
const httpServer = http.createServer(app);
var corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions), cookieParser(), bodyParser.json());
const bot = new TelegramBot(process.env.TELEGRAM_BOT, { polling: true });
bot.on("text", (msg) => {
    const username = msg.from.username;
    if (username) {
        userService.verifyTG(username);
    }
});
app.use("/users", userRouter);
app.use(ErrorMiddleware);
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`Server started at http://localhost:4000`);
