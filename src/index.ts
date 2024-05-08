import express from 'express';
import http from 'http';
import cors from 'cors';
import 'dotenv/config';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import db from './db.js';
import { xClient } from './xapi.js';
import userRouter from './router/user-router.js';
import TelegramBot from 'node-telegram-bot-api';
import userService from './services/user-service.js';
import ErrorMiddleware from './middlewares/error-middleware.js';
import helmet from 'helmet';
import rateLimiterMiddleware from './middlewares/ratelimit-middleware.js';
import dotenv from 'dotenv';
dotenv.config();

const mongo = db;
const x = xClient;

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 4000;

var corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(bodyParser.json({ limit: '1mb' }));
app.use(helmet());
app.use(cors(corsOptions), cookieParser(), bodyParser.json());
app.use(
  session({
    name: 'session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }),
);
app.use(rateLimiterMiddleware);

const bot = new TelegramBot(process.env.TELEGRAM_BOT, { polling: true });
bot.on('text', (msg: { from: { username: any } }) => {
  const username = msg.from.username;
  if (username) {
    userService.verifyTG(username);
  }
});

app.use('/users', userRouter);

app.use(ErrorMiddleware);

app.use((req: any, res: any, next: any) => {
  res.status(404).send({
    status: 404,
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
  });
});

await new Promise((resolve: any) => httpServer.listen({ port: port }, resolve));
console.log(`Server started at http://localhost:${port}`);
