import { TwitterApi } from "twitter-api-v2";
import xService from "./services/x-service.js";
import dotenv from 'dotenv';
import * as common from './common.js';
dotenv.config();

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:4000/xapi-callback';

const X_CLIENT_MAIN = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET
})

const { url, codeVerifier, state: sessionState } = X_CLIENT_MAIN.generateOAuth2AuthLink(CALLBACK_URL, { scope: ['tweet.read', 'users.read', 'follows.read', 'offline.access'] });
common.log(`Please visit ${url}\n`);

export async function getXBearer(req: any, res: any) {
    // Extract state and code from query string
    const { state, code } = req.query;

    if (!codeVerifier || !state || !sessionState || !code) {
        return res.status(400).send('You denied the app or your session expired!');
    }
    if (state !== sessionState) {
        return res.status(400).send('Stored tokens didnt match!');
    }

    // Obtain access token
    X_CLIENT_MAIN.loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
        .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
            // {loggedClient} is an authenticated client in behalf of some user
            // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
            // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

            common.log('Successfull Authentication');
            common.log(`Access Token:  ${accessToken}`);
            common.log(`Refresh Token: ${refreshToken}`);
            common.log(`Expires in: ${expiresIn}`);

            xService.setup(accessToken, refreshToken, expiresIn);

            res.status(200).send('Access token obtained!');

        })
        .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
}

export { X_CLIENT_MAIN };