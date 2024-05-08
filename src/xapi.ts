import { TwitterApi } from "twitter-api-v2";
import dotenv from 'dotenv';
dotenv.config();

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TO_FOLLOW_USER = process.env.TWITTER_USER;

const bearer = new TwitterApi(BEARER_TOKEN);
const xClient = bearer.readOnly;

const user_data = await xClient.v2.userByUsername(TO_FOLLOW_USER);
if (!user_data || user_data.errors) {
    console.error(`User ${user_data} not found`);
    process.exit(1);
}
console.log(`User to follow ${user_data.data.username} found`);
const TO_FOLLOW_USER_ID = user_data.data.id;

export { TO_FOLLOW_USER_ID, xClient };