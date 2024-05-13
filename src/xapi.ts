import { TwitterApi } from "twitter-api-v2";
import xService from "./services/x-service.js";
import dotenv from 'dotenv';
import * as common from './common.js';
import axios from "axios";
dotenv.config();

const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const X_BASE_API_URL = process.env.X_BASE_API_URL;
const X_API_KEY = process.env.X_API_KEY;
const X_API_HOST = process.env.X_API_HOST;

const X_BEARER_CLIENT = new TwitterApi(X_BEARER_TOKEN).readOnly;

const X_API_HEADERS = {
    'X-RapidAPI-Key': X_API_KEY,
    'X-RapidAPI-Host': X_API_HOST
};

async function getXUserByUsername(username: string): Promise<any> {
    const options = {
        method: 'GET',
        url: `${X_BASE_API_URL}user/details`,
        params: {
            username: username
        },
        headers: X_API_HEADERS
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        common.error(`Failed to get X user details: ${error}`);
    }
    return null;
}

async function getXPost(id: string): Promise<any> {
    const options = {
        method: 'GET',
        url: `${X_BASE_API_URL}tweet/details`,
        params: {
            tweet_id: id
        },
        headers: X_API_HEADERS
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        common.error(`Failed to get X post details: ${error}`);
    }
    return null;
}

async function getXUserFollowings(userID: string, nextToken: string | undefined): Promise<any> {
    const options = {
        method: 'GET',
        url: nextToken ? `${X_BASE_API_URL}user/following/continuation` : `${X_BASE_API_URL}user/following`,
        params: {
            user_id: userID,
            limit: '100',
            continuation_token: nextToken
        },
        headers: X_API_HEADERS
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        common.error(`Failed to get X user followings: ${error}`);
    }
    return null;
}

export { X_BEARER_CLIENT, X_API_HEADERS, X_BASE_API_URL, getXUserByUsername, getXPost, getXUserFollowings };