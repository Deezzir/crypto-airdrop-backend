import { TwitterApiReadOnly } from 'twitter-api-v2';
import * as common from '../common.js';
import { X_BEARER_CLIENT, getXUserByUsername, X_BASE_API_URL, X_API_HEADERS, getXPost, getXUserFollowings } from '../xapi.js';
import dotenv from 'dotenv';
dotenv.config();

const TO_FOLLOW_USER = process.env.TWITTER_USER;
const TOKEN_TICKER = process.env.TOKEN_TICKER;
const TO_FOLLOW_ID = process.env.TWITTER_USER_ID;
const NEXT_FOLLOWING_TOKEN_REGEX = /^0\|[0-9]+$/;

function parseXUrl(url: string): { type: 'post', id: string, user: string } | null {
    if (!common.X_POST_REGEX.test(url)) return null;

    const match = url.match(common.X_POST_REGEX);
    if (!match) return null;

    return {
        type: 'post',
        id: match[5],
        user: match[4],
    };
}

class XService {
    xBearerClient: TwitterApiReadOnly | null;
    ready: boolean = false;

    constructor() {
        this.xBearerClient = X_BEARER_CLIENT;
    }

    async setup(): Promise<void> {
        // const me = await this.xBearerClient.v2.me();
        // if (!me || me.errors) {
        //     common.error(`Bearer client is not valid: ${me.errors}`);
        //     this.ready = false;
        // }

        const checkUrl = `${X_BASE_API_URL}user/details`;
        const isAvailable = await common.checkApiAvailability(checkUrl, X_API_HEADERS);
        if (!isAvailable) {
            common.error(`Api is not available: ${X_BASE_API_URL}`);
            this.ready = false;
        }

        this.ready = true;
    }


    async isReady(): Promise<boolean> {
        return this.ready;
    }

    async getXUser(username: string): Promise<any> {
        if (!this.ready) return null;
        if (!common.X_USER_REGEX.test(username)) return null;

        const name = username.replace(/^@/, '');

        const user = await getXUserByUsername(name);
        if (!user || (user.detail && user.detail.includes('not found'))) return null;

        return user;
    }

    async verifyX(username: string, postUrl: string): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        if (!this.ready) return { isValid: false, errorMsg: 'Service not ready' };

        const user = await this.getXUser(username);
        if (!user) return { isValid: false, errorMsg: 'User not found' };

        if (user.is_private !== null) return { isValid: false, errorMsg: 'Account cannot be private' };

        if (!user.is_blue_verified) {
            if (user.follower_count < 30 || common.getAgeInDays(user.creation_date) < 60)
                return {
                    isValid: false,
                    errorMsg: 'Account must be Blue verified. Or have at least 30 followers and be at least 60 days old',
                };
        }

        const isFollowing = await this.checkFollows(user.user_id, TO_FOLLOW_ID);
        if (!isFollowing.isValid) return isFollowing;

        const isPostValid = await this.verifyXPost(user, postUrl);
        if (!isPostValid.isValid) return isPostValid;

        return { isValid: true, errorMsg: undefined };
    }

    async verifyXPost(user: any, url: string): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        if (!this.ready) return { isValid: false, errorMsg: 'Service not ready' };

        const parsed = parseXUrl(url);
        if (!parsed || parsed.type !== 'post') return { isValid: false, errorMsg: 'Invalid Post Link' };

        const tweet = await getXPost(parsed.id);
        if (!tweet || tweet.detail) return { isValid: false, errorMsg: 'Post not found' };

        if (tweet.user.user_id !== user.user_id) return { isValid: false, errorMsg: 'This is not your post' };

        const postText: string = tweet.text;
        if (common.X_POST_REPLY_REGEX.test(postText)) return { isValid: false, errorMsg: "Post should not be a reply. Don't start the post with @" };

        if (!postText.includes(`@${TO_FOLLOW_USER}`)) return { isValid: false, errorMsg: 'Post must mention the provided account' };

        if (!postText.toLowerCase().includes(`$${TOKEN_TICKER}`.toLowerCase())) {
            return { isValid: false, errorMsg: 'Post must contain the provided token ticker' };
        }

        if (tweet.media_url === null) return { isValid: false, errorMsg: 'Post should have some image' };

        return { isValid: true, errorMsg: undefined };
    }

    private async checkFollows(userId: string, checkId: string): Promise<{ isValid: boolean, errorMsg: string | undefined }> {
        let follows = await getXUserFollowings(userId, undefined);
        if (!follows || follows.detail) return { isValid: false, errorMsg: 'Failed to get user followings' };

        let found = follows.results.find((user: any) => user.user_id === checkId);

        while (!found && !follows.continuation_token.test(NEXT_FOLLOWING_TOKEN_REGEX)) {
            follows = await getXUserFollowings(userId, follows.continuation_token);
            found = follows.results.find((user: any) => user.user_id === checkId);
        }

        if (!found) return { isValid: false, errorMsg: 'Account must follow the provided account' };

        return { isValid: !!found, errorMsg: undefined };
    }
}

export default new XService();
