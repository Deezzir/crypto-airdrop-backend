import { PublicKey } from "@solana/web3.js";

export const TG_USER_REGEX = /^@?[0-9a-zA-Z_]{5,32}$/;
export const X_POST_REGEX = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})\/status\/([0-9]+)$/;
export const X_USER_REGEX = /^@?[0-9a-zA-Z_]{1,15}$/;

export function checkWallet(wallet: string) {
    try {
        new PublicKey(wallet);
        return true;
    } catch (e) {
        return false;
    }
}