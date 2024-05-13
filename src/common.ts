import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import dotenv from "dotenv";
import * as common from "./common.js";
dotenv.config();

const PRESALE_MIN_SOL_AMOUNT = parseFloat(process.env.PRESALE_MIN_SOL_AMOUNT) || 0;
const PRESALE_MAX_SOL_AMOUNT = parseFloat(process.env.PRESALE_MAX_SOL_AMOUNT) || 0;

export const TG_USER_REGEX = /^@?[0-9a-zA-Z_]{5,32}$/;
export const X_POST_REGEX = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})\/status\/([0-9]+)$/;
export const X_USER_REGEX = /^@?[0-9a-zA-Z_]{1,15}$/;

export interface PresaleUser {
    wallet: string;
    solAmount: number;
}

export interface AirdropUser {
    wallet: string,
    xUsername: string,
    xPostLink: string,
    tgUsername: string,
}

export function checkWallet(wallet: string) {
    try {
        new PublicKey(wallet);
        return true;
    } catch (e) {
        return false;
    }
}

export function log(msg: string) {
    console.log(`[INFO ${new Date().toISOString()}] ${msg}`);
}

export function error(msg: string) {
    console.error(`[ERROR ${new Date().toISOString()}] ${msg}`);
}

export function warn(msg: string) {
    console.warn(`[WARN ${new Date().toISOString()}] ${msg}`);
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function checkSolAmount(solAmount: any) {
    if (typeof solAmount !== 'number') return false;
    if (solAmount < PRESALE_MIN_SOL_AMOUNT) return false;
    if (solAmount > PRESALE_MAX_SOL_AMOUNT) return false;
    return true;
}

export async function checkApiAvailability(url: string, headers: any) {
    try {
        const response = await axios.get(url, { headers });
        if (response.status === 200) {
            common.log('API is available.');
            return true;
        }
    } catch (error: any) {
        if (error.response) {
            common.error(`API check failed with status: ${error.response.status}`);
        } else if (error.request) {
            common.error('API did not respond.');
        } else {
            common.error(`Failed to check API status: ${error.message}`);
        }
        return false;
    }
}

export function getAgeInDays(date: string) {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}