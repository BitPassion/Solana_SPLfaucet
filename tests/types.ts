import * as anchor from '@project-serum/anchor';
import {PublicKey} from '@solana/web3.js';

export const VAULT_AUTHORITY_SEED = "vault";
export const USER_DATA_SEED = "user-info";
export const FAUCET_SEED = "faucet";

export const MARKETPLACE_PROGRAM_ID = new PublicKey("2QvXAQFJJJBWWY7PrTxFU8MPcnEDQ1gy75w8fgo9j111");
export const MAX_CREATE_MINT_TIMES = 2;
export const FAUCET_PERIOD = 10;

export interface VaultData {
    // 8 + 80
    mint: PublicKey,            // 32
    creator: PublicKey,         // 32
    preMintAmount: anchor.BN,   // 8
    releaseAmount: anchor.BN,   // 8
}

export interface UserData {
    // 8 + 40
    address: PublicKey,             // 32
    createdMintCount: anchor.BN,    // 8
}

export interface FaucetData {
    // 8 + 72
    address: PublicKey,         // 32
    mint: PublicKey,            // 32
    lastFaucetTime: anchor.BN,  // 8
}