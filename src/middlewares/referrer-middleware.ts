import dotenv from "dotenv";
dotenv.config();

const allowedOrigins = [process.env.CLIENT_URL];

export const ReferrerMiddleware = (req: any, res: any, next: any) => {
    const origin = req.get('Origin') || req.get('Referer');
    if (origin && allowedOrigins.includes(origin)) {
        next();
    } else {
        res.status(403).json({ message: 'Direct access not allowed' });
    }
};