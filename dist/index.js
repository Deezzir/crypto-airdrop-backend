import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRouter from "./router/user-router.js";
// const mongo = db;
const app = express();
const httpServer = http.createServer(app);
var corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions), cookieParser(), bodyParser.json());
// app.use('/auth',authRouter);
//need to implement userType check!
app.use("/users", userRouter);
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`Server started at http://localhost:4000`);
