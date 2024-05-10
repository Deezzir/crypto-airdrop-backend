import { FollowersV2ParamsWithoutPaginator, TwitterApi, TwitterApiReadOnly, UserV2 } from 'twitter-api-v2';
import * as common from '../common.js';
import { X_CLIENT_MAIN } from '../xapi.js';
import dotenv from 'dotenv';
dotenv.config();

const TO_FOLLOW_USER = process.env.TWITTER_USER;
const CHECK_INTERVAL = 1000 * 60;

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
    xClient: TwitterApiReadOnly | null;
    accessToken: string | null;
    toFollowUserId: string | null;
    refreshToken: string | null;
    expiresIn: number;

    constructor() {
        this.xClient = null;
        this.toFollowUserId = null;
        this.refreshToken = null;
        this.expiresIn = 0;
    }

    async setup(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
        const bearer = new TwitterApi(accessToken);
        common.log('XService ready');

        this.accessToken = accessToken;
        this.xClient = bearer.readOnly;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn - 120;

        const user_data = await this.xClient.v2.userByUsername(TO_FOLLOW_USER);
        if (!user_data || user_data.errors) {
            common.error(`User ${user_data} not found`);
            process.exit(1);
        }
        common.log(`User to follow ${user_data.data.username} found\n`);
        this.toFollowUserId = user_data.data.id;

        setInterval(() => {
            this.expiresIn -= CHECK_INTERVAL / 1000;
            this.checkRefreshToken();
        }, CHECK_INTERVAL);
    }

    async isReady(): Promise<boolean> {
        return this.xClient !== null;
    }

    async getXUser(username: string): Promise<UserV2 | null> {
        if (!this.isReady()) return null;
        if (!common.X_USER_REGEX.test(username)) return null;

        const name = username.replace(/^@/, '');

        const user = await this.xClient.v2.userByUsername(name);
        if (!user || user.errors) return null;

        return user.data;
    }

    async verifyXUser(user: UserV2): Promise<boolean> {
        if (!this.isReady()) return false;
        return await this.checkFollows(user.id, this.toFollowUserId);
    }

    async verifyXPost(url: string, user: UserV2): Promise<boolean> {
        if (!this.isReady()) return false;

        const parsed = parseXUrl(url);
        if (!parsed) return false;

        if (parsed.type !== 'post' || parsed.user !== user.username) return false;

        const tweet = await this.xClient.v2.singleTweet(parsed.id, {
            expansions: [
                'author_id',
            ],
            "tweet.fields": [
                'created_at',
                'public_metrics',
                'source',
                'text',
            ],
        });

        //TODO CHECK TEXT, TAGS, METRICS, ETC

        if (!tweet || tweet.errors) return false;
        return tweet.data.author_id === user.id;
    }

    private async checkFollows(userId: string, checkId: string): Promise<boolean> {
        let params: Partial<FollowersV2ParamsWithoutPaginator> = {
            max_results: 1000,
            "user.fields": "id,name,username",
        };

        try {
            let follows = await this.xClient.v2.following(userId, params);
            let found = follows.data.find(user => user.id === checkId);

            while (!found && follows.meta.next_token) {
                params.pagination_token = follows.meta.next_token;
                follows = await this.xClient.v2.following(userId, params);
                found = follows.data.find(user => user.id === checkId);
            }

            return found ? true : false;
        } catch (error) {
            common.error(`Error fetching following for ${userId}: ${error}`);
        }
        return false;
    }

    private async checkRefreshToken(): Promise<void> {
        if (this.expiresIn > 0 || !this.refreshToken) {
            common.log(`XService Token not expired, expires in: ${this.expiresIn} secs`);
            return;
        }

        common.log(`Updating XService Token`)
        const { client: refreshedClient, accessToken, refreshToken: newRefreshToken, expiresIn } = await X_CLIENT_MAIN.refreshOAuth2Token(this.refreshToken);
        this.xClient = refreshedClient;
        this.accessToken = accessToken;
        this.refreshToken = newRefreshToken;
        this.expiresIn = expiresIn - 120;
        common.log('XService Token refreshed');
    }
}

export default new XService();