import { FollowersV2ParamsWithoutPaginator, UserV2 } from 'twitter-api-v2';
import { xClient, TO_FOLLOW_USER_ID } from '../xapi.js';
import * as common from '../common.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkFollows(userId: string, checkId: string) {
    let params: Partial<FollowersV2ParamsWithoutPaginator> = {
        max_results: 1000,
        "user.fields": "id,name,username",
    };

    try {
        let follows = await xClient.v2.following(userId, params);
        let found = follows.data.find(user => user.id === checkId);

        while (!found && follows.meta.next_token) {
            params.pagination_token = follows.meta.next_token;
            follows = await xClient.v2.following(userId, params);
            found = follows.data.find(user => user.id === checkId);
        }

        return found ? true : false;
    } catch (error) {
        console.error(`Error fetching following for ${userId}: ${error}`);
    }
    return false;
}

function parseXUrl(url: string): { type: 'post', id: string, user: string } | null {
    if (!common.X_POST_REGEX.test(url)) return null;

    const match = url.match(common.X_POST_REGEX);
    if (!match) return null;
    return {
        type: 'post',
        id: match[5],
        user: match[4],
    };
    return null;
}

class XService {
    async getXUser(username: string): Promise<UserV2 | null> {
        if (!common.X_USER_REGEX.test(username)) return null;

        const name = username.replace(/^@/, '');

        const user = await xClient.v2.userByUsername(name);
        if (!user || user.errors) return null;

        return user.data;
    }

    async verifyXUser(user: UserV2): Promise<boolean> {
        return await checkFollows(user.id, TO_FOLLOW_USER_ID);
    }

    async verifyXPost(url: string, user: UserV2): Promise<boolean> {
        const parsed = parseXUrl(url);
        if (!parsed) return false;

        if (parsed.type !== 'post' || parsed.user !== user.username) return false;

        const tweet = await xClient.v2.singleTweet(parsed.id, {
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
}

export default new XService();